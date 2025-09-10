// File: app/forget-password/reset.tsx

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ResetPassword() {
  const { email } = useLocalSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      // Replace with your actual reset password API
      // await axios.post('/api/auth/reset-password', { email, newPassword });
      Alert.alert('Success', 'Password has been reset.');
      router.replace('/'); // Back to login
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password.');
    }
  };

  return (
    <View className="flex-1 justify-center px-4">
      <Text className="text-xl font-bold mb-4 text-center">Reset Password</Text>

      <TextInput
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        className="border border-gray-300 rounded px-4 py-3 mb-4"
      />
      <TextInput
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        className="border border-gray-300 rounded px-4 py-3 mb-4"
      />

      <TouchableOpacity
        onPress={handleReset}
        className="bg-[#0A2A54] py-3 rounded-xl"
      >
        <Text className="text-white text-center font-semibold">Update Password</Text>
      </TouchableOpacity>
    </View>
  );
}
