import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChangePasswordPage() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = () => {
    if (newPassword === confirmPassword) {
      alert('Password changed successfully');
      router.back();
    } else {
      alert('Passwords do not match');
    }
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.background }}
      className="flex-1 px-5"
    >
      {/* Header */}
      <View className="flex-row items-center mt-6 mb-8">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <FontAwesome5 name="arrow-left" size={20} color={colors.subtext} />
        </TouchableOpacity>
        <Text
          style={{ color: colors.text }}
          className="text-xl font-bold"
        >
          Change Password
        </Text>
      </View>

      {/* Form */}
      <View className="gap-4">
        <TextInput
          className="p-4 rounded-xl shadow-sm"
          style={{
            backgroundColor: colors.secondaryBackground,
            color: colors.text,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          secureTextEntry
          placeholder="Current Password"
          placeholderTextColor={colors.subtext}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TextInput
          className="p-4 rounded-xl shadow-sm"
          style={{
            backgroundColor: colors.secondaryBackground,
            color: colors.text,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          secureTextEntry
          placeholder="New Password"
          placeholderTextColor={colors.subtext}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          className="p-4 rounded-xl shadow-sm mb-2"
          style={{
            backgroundColor: colors.secondaryBackground,
            color: colors.text,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          secureTextEntry
          placeholder="Confirm New Password"
          placeholderTextColor={colors.subtext}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        onPress={handleChangePassword}
        className="mt-4 p-4 rounded-xl items-center"
        style={{
          backgroundColor: '#2563EB',
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: Platform.OS === 'android' ? 4 : 0,
        }}
      >
        <Text className="text-white font-bold text-base">Save Changes</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
