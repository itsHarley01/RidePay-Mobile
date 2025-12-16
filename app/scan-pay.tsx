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
  const NFC_HEIGHT = SCREEN_HEIGHT * 0.85;
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

  // Barcode handler
  const handleBarCodeScanned = async (event: any) => {
    try {
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
      // keep scanned true until user presses "Scan Again"
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
      <View className="flex-1 items-center justify-center bg-white px-8">
        <MaterialCommunityIcons name="camera" size={64} color="#9CA3AF" />
        <Text className="text-gray-600 text-center mt-6 mb-8 text-base leading-6">
          Camera access is required to scan QR codes
        </Text>
        <TouchableOpacity 
          onPress={requestPermission}
          className="bg-gray-900 px-8 py-3 rounded-full"
        >
          <Text className="text-white font-medium">Enable Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Camera View */}
      {!nfcMode && (
        <CameraView
          facing={facing}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onBarcodeScanned={scanned ? undefined : (handleBarCodeScanned as any)}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] } as any}
        />
      )}

      {/* Scanning Overlay */}
      {!nfcMode && !scanned && (
        <View
          pointerEvents="none"
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          {/* Dark overlay with transparent center */}
          <View className="absolute inset-0 bg-black/40" />
          <View className="w-60 h-60 border-2 border-white rounded-2xl bg-transparent" 
                style={{ 
                  shadowColor: 'rgba(255, 255, 255, 0.3)', 
                  shadowOffset: { width: 0, height: 0 }, 
                  shadowOpacity: 1, 
                  shadowRadius: 8,
                  elevation: 8 
                }} 
          />
          
          {/* Corner indicators */}
          <View className="absolute w-60 h-60 pointer-events-none">
            {/* Top left */}
            <View className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-white rounded-tl-2xl" />
            {/* Top right */}
            <View className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-white rounded-tr-2xl" />
            {/* Bottom left */}
            <View className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-white rounded-bl-2xl" />
            {/* Bottom right */}
            <View className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-white rounded-br-2xl" />
          </View>
          
          <Text className="absolute bottom-32 text-white/90 text-center px-8 font-medium">
            Position QR code within the frame
          </Text>
        </View>
      )}

      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-20 pt-12 pb-4 bg-gradient-to-b from-black/60 to-transparent">
        <View className="flex-row items-center px-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white font-semibold text-lg ml-4">
            {nfcMode ? 'NFC Payment' : 'Scan QR Code'}
          </Text>
        </View>
      </View>

      {/* Bottom Actions */}
      {!nfcMode && !scanned && (
        <View className="absolute bottom-0 left-0 right-0 z-20 pb-8 pt-6 bg-gradient-to-t from-black/60 to-transparent">
          <View className="items-center">
            <TouchableOpacity
              onPress={() => setNfcMode(true)}
              className="bg-white rounded-full px-8 py-4 flex-row items-center shadow-lg"
            >
              <MaterialCommunityIcons name="contactless-payment" size={24} color="#000" />
              <Text className="text-black font-semibold ml-3">Use NFC Instead</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* NFC Panel */}
      <Animated.View
        className="absolute bottom-0 w-full bg-white rounded-t-3xl z-30 items-center"
        style={[{ height: NFC_HEIGHT }, animatedStyle]}
      >
        {/* Handle */}
        <View className="w-12 h-1 bg-gray-300 rounded-full mt-4 mb-8" />
        
        <TouchableOpacity 
          onPress={() => setNfcMode(false)}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="close" size={18} color="#6B7280" />
        </TouchableOpacity>

        <View className="items-center px-8 mt-16">
          <View className="w-32 h-32 bg-gray-50 rounded-full items-center justify-center mb-8">
            <MaterialCommunityIcons name="contactless-payment" size={64} color="#6B7280" />
          </View>
          
          <Text className="text-2xl font-bold text-gray-900 mb-3">Tap to Pay</Text>
          <Text className="text-gray-600 text-center text-base leading-6 max-w-64">
            Hold your phone near the payment terminal on the bus
          </Text>

          {/* Animated ripple effect */}
          <View className="mt-12 relative">
            <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center">
              <View className="w-16 h-16 bg-blue-200 rounded-full items-center justify-center">
                <View className="w-8 h-8 bg-blue-500 rounded-full" />
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Result Modal */}
      {scanned && (
        <View className="absolute inset-0 z-40 items-center justify-center bg-black/50 px-6">
          <View className="w-full max-w-sm bg-white rounded-3xl p-8 items-center shadow-2xl">
            {loading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#6B7280" />
                <Text className="text-gray-600 mt-6 text-lg">Processing...</Text>
              </View>
            ) : (
              <>
                <View className={`w-16 h-16 rounded-full items-center justify-center mb-6 ${
                  result?.success ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <MaterialCommunityIcons
                    name={result?.success ? 'check' : 'close'}
                    size={32}
                    color={result?.success ? '#10B981' : '#EF4444'}
                  />
                </View>

                <Text className={`text-xl font-bold mb-3 ${
                  result?.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result?.success ? 'Payment Successful' : 'Payment Failed'}
                </Text>

                <Text className="text-gray-600 text-center mb-6 leading-6">
                  {result?.message}
                </Text>

                {result?.success && (
                  <View className="w-full bg-gray-50 rounded-2xl p-4 mb-6">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-gray-600">Fare</Text>
                      <Text className="font-semibold text-gray-900">
                        ₱{result.finalFare?.toFixed(2) ?? '-'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-600">New Balance</Text>
                      <Text className="font-semibold text-gray-900">
                        ₱{result.newBalance?.toFixed(2) ?? '-'}
                      </Text>
                    </View>
                  </View>
                )}

                <View className="flex-row w-full gap-3">
                  <TouchableOpacity
                    onPress={resetScanner}
                    className="flex-1 bg-gray-100 py-4 rounded-2xl"
                  >
                    <Text className="text-center text-gray-900 font-semibold">Scan Again</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-1 bg-gray-900 py-4 rounded-2xl"
                  >
                    <Text className="text-center text-white font-semibold">Done</Text>
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