// app/forgot-password.tsx
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const handleReset = () => {
    if (!email) {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }

    // Simulated reset behavior
    // Replace with actual call to Firebase/Auth service
    Alert.alert(
      'Reset Link Sent',
      `A password reset link has been sent to ${email}.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1 justify-center items-center px-4">
      <View className="w-full max-w-md">
        <Text className="text-2xl font-bold mb-6 text-center" style={{ color: colors.subtext }}>
          Reset Your Password
        </Text>
        <TextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.placeholder}
          className="border border-gray-300 rounded px-4 py-3 mb-4"
        />
        <TouchableOpacity
          onPress={handleReset}
          className="bg-[#0A2A54] py-3 rounded-xl"
        >
          <Text className="text-white text-center font-semibold text-base">Send Reset Link</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
