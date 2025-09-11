// ScanPayScreen.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { busTapApi } from '@/api/busTapApi';
import { getAuthData } from '@/utils/auth';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ScanPayScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [nfcMode, setNfcMode] = useState(false);
  const router = useRouter();

  // QR states
  const [scanned, setScanned] = useState(false);
  const scannedRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    success: boolean;
    message: string;
    newBalance?: number;
    finalFare?: number;
    raw?: any;
  }>(null);

  // NFC panel animation
  const NFC_HEIGHT = SCREEN_HEIGHT * 0.9;
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  useEffect(() => {
    translateY.value = withTiming(nfcMode ? SCREEN_HEIGHT - NFC_HEIGHT : SCREEN_HEIGHT, {
      duration: 300,
    });
  }, [nfcMode]);

  // Barcode handler. Accepts either event.data or event.nativeEvent?.data to be safe.
  const handleBarCodeScanned = async (event: any) => {
    try {
      // prevent double-processing
      if (scannedRef.current) return;
      scannedRef.current = true;
      setScanned(true);

      const rawData: string = event?.data ?? event?.nativeEvent?.data ?? '';
      console.log('[Scan] rawData:', rawData);

      let payload: { busId?: string; deviceId?: string } | null = null;
      try {
        payload = JSON.parse(rawData);
      } catch (parseErr) {
        console.warn('[Scan] parse error', parseErr);
        setResult({ success: false, message: 'Invalid QR code' });
        return;
      }

      if (!payload?.busId || !payload?.deviceId) {
        setResult({ success: false, message: 'Missing busId or deviceId in QR' });
        return;
      }

      setLoading(true);
      try {
        const { uid } = await getAuthData();
        if (!uid) {
          setResult({ success: false, message: 'User not authenticated' });
          return;
        }

        const apiRes = await busTapApi({
          userId: uid,
          busId: payload.busId,
          deviceId: payload.deviceId,
        });

        setResult({
          success: apiRes.success,
          message: apiRes.message,
          newBalance: apiRes.newBalance,
          finalFare: apiRes.finalFare,
          raw: apiRes,
        });
      } catch (apiErr: any) {
        console.error('[Scan] api error', apiErr);
        setResult({ success: false, message: apiErr?.message || 'Unexpected error' });
      } finally {
        setLoading(false);
      }
    } finally {
      // keep scanned true until user presses "Scan Again" (do not immediately re-enable)
    }
  };

  const resetScanner = () => {
    scannedRef.current = false;
    setScanned(false);
    setResult(null);
    setLoading(false);
  };

  if (!permission || !permission.granted) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-base mb-2">We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text className="text-lg text-blue-600">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Camera stays mounted while in QR mode. We only enable the barcode callback when scanned === false */}
      {!nfcMode && (
        <CameraView
          facing={facing}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          // correct prop name for CameraView is `onBarcodeScanned`
          // cast to any to avoid strict typings if necessary
          onBarcodeScanned={scanned ? undefined : (handleBarCodeScanned as any)}
          // keep barcode scanner settings — cast to any if types complain
          barcodeScannerSettings={{ barcodeTypes: ['qr'] } as any}
        />
      )}

      {/* Scanning overlay (white square) — pointerEvents="none" so it doesn't block camera */}
      {!nfcMode && !scanned && (
        <View
          pointerEvents="none"
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          <View className="w-64 h-64 border-4 border-white rounded-lg opacity-90" />
          <Text className="absolute bottom-20 text-white text-lg">Align QR code inside the box</Text>
        </View>
      )}

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 left-5 bg-black/40 rounded-full p-2 z-20"
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Bottom NFC Button */}
      {!nfcMode && !scanned && (
        <TouchableOpacity
          onPress={() => setNfcMode(true)}
          className="absolute bottom-5 self-center bg-[#0A2A54] w-52 h-16 rounded-full justify-center items-center z-20"
        >
          <MaterialCommunityIcons name="contactless-payment" size={26} color="white" />
          <Text className="text-white text-sm mt-1">Pay with NFC</Text>
        </TouchableOpacity>
      )}

      {/* NFC PANEL */}
      <Animated.View
        className="absolute bottom-0 w-full items-center pt-10 bg-[#0A2A54] rounded-t-[40px] z-30"
        style={[{ height: NFC_HEIGHT }, animatedStyle]}
      >
        <TouchableOpacity onPress={() => setNfcMode(false)}>
          <Text className="text-white mb-5 underline">Back to QR</Text>
        </TouchableOpacity>
        <View className="items-center mt-12">
          <Image source={require('../assets/images/nfc-phone-icon-white.png')} style={{ width: 220, height: 220 }} />
          <Text className="text-white text-2xl font-bold mt-4">Tap to Pay</Text>
          <Text className="text-gray-300 text-md mt-1">Hold your phone near the bus scanner.</Text>
        </View>
      </Animated.View>

      {/* Result Popup (this intentionally blocks touches while visible) */}
      {scanned && (
        <View className="absolute inset-0 z-40 items-center justify-center bg-black/60 px-6">
          <View className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 items-center">
            {loading ? (
              <>
                <ActivityIndicator size="large" color="#0A2A54" />
                <Text className="text-gray-700 mt-4 text-lg">Processing tap...</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons
                  name={result?.success ? 'check-circle' : 'close-circle'}
                  size={64}
                  color={result?.success ? 'green' : 'red'}
                />
                <Text className={`text-xl font-bold mt-3 ${result?.success ? 'text-green-600' : 'text-red-600'}`}>
                  {result?.success ? 'Tap Successful' : 'Tap Failed'}
                </Text>
                <Text className="text-gray-600 mt-2 text-center">{result?.message}</Text>

{result?.success && (
  <View className="mt-4 items-center">
    <Text className="text-lg text-gray-800">
      Fare: ₱{result.finalFare != null ? result.finalFare.toFixed(2) : '-'}
    </Text>
    <Text className="text-lg text-gray-800">
      New Balance: ₱{result.newBalance != null ? result.newBalance.toFixed(2) : '-'}
    </Text>
  </View>
)}


                <View className="flex-row mt-6 w-full justify-between">
                  <TouchableOpacity
                    onPress={resetScanner}
                    className="flex-1 bg-[#0A2A54] py-3 rounded-xl mr-2"
                  >
                    <Text className="text-center text-white font-semibold">Scan Again</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-1 bg-gray-300 py-3 rounded-xl ml-2"
                  >
                    <Text className="text-center text-gray-800 font-semibold">Done</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
