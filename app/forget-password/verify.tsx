// File: app/forget-password/verify.tsx

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function VerifyOTP() {
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const router = useRouter();

  const verifyCode = async () => {
    if (!code) {
      Alert.alert('Error', 'Enter the verification code.');
      return;
    }

    try {
      // Replace with your actual verification API
      // await axios.post('/api/auth/verify-otp', { email, code });
      Alert.alert('Success', 'Code verified.');
      router.push({ pathname: '/forget-password/reset', params: { email } });
    } catch (error) {
      Alert.alert('Error', 'Invalid or expired code.');
    }
  };

  return (
    <View className="flex-1 justify-center px-4">
      <Text className="text-xl font-bold mb-4 text-center">Enter Verification Code</Text>

      <TextInput
        placeholder="6-digit code"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
        className="border border-gray-300 rounded px-4 py-3 mb-4 text-center"
      />

      <TouchableOpacity
        onPress={verifyCode}
        className="bg-green-600 py-3 rounded-xl"
      >
        <Text className="text-white text-center font-semibold">Verify</Text>
      </TouchableOpacity>
    </View>
  );
}
