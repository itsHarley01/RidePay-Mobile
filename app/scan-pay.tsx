import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ScanPayScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [nfcMode, setNfcMode] = useState(false);
  const router = useRouter();

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
      {/* Camera always behind */}
      {!nfcMode && (
        <CameraView
          facing={facing}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
        />
      )}

      {/* Overlay on camera */}
      {!nfcMode && (
        <View className="absolute inset-0 z-10 pointer-events-none">
          <View className="flex-1 items-center justify-center">
            <View className="absolute inset-0 " />
            <View className="w-64 h-64 border-2 border-white z-10" />
          </View>
        </View>
      )}

      {/* Gray background when NFC panel is open */}
      {nfcMode && (
        <View className="absolute inset-0 bg-gray-900 z-10" />
      )}

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 left-5 bg-black/40 rounded-full p-2 z-20"
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Bottom NFC Button */}
      {!nfcMode && (
        <TouchableOpacity
          onPress={() => setNfcMode(true)}
          className="absolute bottom-5 self-center bg-[#0A2A54] w-52 h-16 rounded-full justify-center items-center z-20"
        >
          <MaterialCommunityIcons name="contactless-payment" size={28} color="white" />
          <Text className="text-white text-sm mt-1">Pay with NFC</Text>
        </TouchableOpacity>
      )}

      {/* NFC PANEL (animated slide) */}
      <Animated.View
        className="absolute bottom-0 w-full items-center pt-10 bg-[#0A2A54] rounded-t-[60px] z-30"
        style={[{ height: NFC_HEIGHT }, animatedStyle]}
      >
        <TouchableOpacity onPress={() => setNfcMode(false)}>
          <Text className="text-white mb-5">Tap to return to QR scanner</Text>
        </TouchableOpacity>
        <View className="items-center mt-12">
          <Image source={require('../assets/images/nfc-phone-icon-white.png')} style={{ width: 300, height: 300 }} />
          <Text className="text-white text-xl font-bold mt-3">Tap to Pay</Text>
          <Text className="text-gray-300 text-md mt-1">Hold your phone near the bus scanner.</Text>
        </View>
      </Animated.View>
    </View>
  );
}
