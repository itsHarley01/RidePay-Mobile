// File: app/forget-password/index.tsx

import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function ForgetPasswordScreen() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const sendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    try {
      // Replace this with your actual API call
      // await axios.post('/api/auth/forgot-password', { email });
      Alert.alert('Success', 'OTP sent to your email.');
      router.push({ pathname: '/forget-password/verify', params: { email } });
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP.');
    }
  };

  return (
    <View className="flex-1 justify-center px-4">
      <Text className="text-2xl font-bold mb-4 text-center">Forgot Password</Text>

      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className="border border-gray-300 rounded px-4 py-3 mb-4"
      />

      <TouchableOpacity
        onPress={sendOTP}
        className="bg-blue-600 py-3 rounded-xl"
      >
        <Text className="text-white text-center font-semibold">Send Verification Code</Text>
      </TouchableOpacity>
    </View>
  );
}
