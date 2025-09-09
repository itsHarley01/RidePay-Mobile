import { View, Text, TextInput, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendResetLink } from '@/api/forgotpasswordApi';
import { fetchUserDataByUid } from '@/api/userApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthData, clearAuthData } from '@/utils/auth';

export default function ChangePasswordPage() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // ✅ Loading state

  // ✅ Fetch user profile to get registered email
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { uid } = await getAuthData();
        if (!uid) {
          console.warn("⚠️ No UID found in storage");
          return;
        }

        const userData = await fetchUserDataByUid(uid);
        console.log("📩 User data from backend:", userData);

        setRegisteredEmail(userData.email || userData.data?.email);
      } catch (error) {
        console.error("❌ Failed to fetch user email:", error);
      }
    };
    loadUserData();
  }, []);

  const handleSendResetLink = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email first.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    if (
      registeredEmail &&
      email.trim().toLowerCase() !== registeredEmail.trim().toLowerCase()
    ) {
      Alert.alert("Error", "The email does not match your registered account.");
      return;
    }

    try {
      setLoading(true); // ✅ Show loader
      const res = await sendResetLink(email);
      Alert.alert("Success", res.message || "Reset link sent to your email!");

      // 🔐 Auto logout after sending reset link
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "uid"]);
      router.replace("/");
    } catch (error: any) {
      console.error("Error sending reset link:", error);
      Alert.alert("Error", error?.response?.data?.message || "The email you entered is not registered.");
    } finally {
      setLoading(false); // ✅ Hide loader
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1 px-5">
      {/* Header */}
      <View className="flex-row items-center mt-6 mb-8">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <FontAwesome5 name="arrow-left" size={20} color={colors.subtext} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-xl font-bold">
          Change Password
        </Text>
      </View>

      {/* Reset Password via Email */}
      <TextInput
        className="p-4 rounded-xl shadow-sm mb-2"
        style={{
          backgroundColor: colors.secondaryBackground,
          color: colors.text,
          borderColor: colors.border,
          borderWidth: 1,
        }}
        placeholder="Enter your email"
        placeholderTextColor={colors.subtext}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        onPress={handleSendResetLink}
        disabled={loading} // ✅ Disable while loading
        className="p-4 rounded-xl items-center"
        style={{
          backgroundColor: loading ? '#D97706' : '#F59E0B',
          opacity: loading ? 0.8 : 1,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: Platform.OS === 'android' ? 4 : 0,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-base">Send Reset Link</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
