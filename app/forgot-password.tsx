// app/forgot-password.tsx
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { 
  Alert, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { sendResetLink } from '@/api/forgotpasswordApi';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError('');
    }
  };

  const handleReset = async () => {
    // Clear any existing errors
    setEmailError('');

    // Validation
    if (!email.trim()) {
      setEmailError('Email address is required');
      return;
    }

    if (!validateEmail(email.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const res = await sendResetLink(email.trim());
      
      Alert.alert(
        'Reset Link Sent',
        res.message || `We've sent a password reset link to ${email}. Please check your email and follow the instructions.`,
        [
          { 
            text: 'OK', 
            onPress: () => router.back(),
            style: 'default'
          }
        ]
      );
    } catch (error: any) {
      console.error('Error sending reset link:', error);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to send reset link. Please try again.';
      
      Alert.alert('Unable to Send Reset Link', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = email.trim() && validateEmail(email.trim());

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ backgroundColor: colors.background }} 
      className="flex-1"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View className="pt-16 pb-8 px-6">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mb-8"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text 
              style={{ color: colors.subtext }} 
              className="text-base font-medium"
            >
              ← Back
            </Text>
          </TouchableOpacity>

          <View className="mb-8">
            <Text 
              className="text-3xl font-light mb-3" 
              style={{ color: colors.subtext }}
            >
              Forgot Password?
            </Text>
            <Text 
              className="text-base leading-relaxed" 
              style={{ color: theme === 'dark' ? colors.placeholder : '#6B7280' }}
            >
              No worries. Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>
        </View>

        {/* Form Section */}
        <View className="flex-1 px-6">
          <View className="mb-6">
            <Text 
              className="text-sm font-medium mb-3" 
              style={{ color: colors.subtext }}
            >
              Email Address
            </Text>
            
            <View className="relative">
              <TextInput
                placeholder="Enter your email address"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor={colors.placeholder}
                style={{ 
                  color: colors.subtext,
                  backgroundColor: theme === 'dark' ? '#1F2937' : '#F9FAFB'
                }}
                className={`px-4 py-4 rounded-xl text-base border ${
                  emailError 
                    ? 'border-red-500' 
                    : theme === 'dark' 
                      ? 'border-gray-700' 
                      : 'border-gray-200'
                }`}
              />
              
              {/* Email validation indicator */}
              {email.length > 0 && (
                <View className="absolute right-4 top-4">
                  <View 
                    className={`w-2 h-2 rounded-full ${
                      isEmailValid ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                </View>
              )}
            </View>

            {/* Error Message */}
            {emailError ? (
              <Text className="text-red-500 text-sm mt-2 leading-relaxed">
                {emailError}
              </Text>
            ) : null}
          </View>

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleReset}
            disabled={loading || !isEmailValid}
            className={`py-4 rounded-xl mb-6 ${
              loading || !isEmailValid 
                ? theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                : theme === 'dark' ? 'bg-white' : 'bg-gray-900'
            }`}
            style={{
              shadowColor: theme === 'dark' ? '#000' : '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            {loading ? (
              <ActivityIndicator 
                color={theme === 'dark' ? colors.background : '#fff'} 
              />
            ) : (
              <Text 
                className={`text-center font-medium text-base ${
                  !isEmailValid 
                    ? 'text-gray-400'
                    : theme === 'dark' ? 'text-gray-900' : 'text-white'
                }`}
              >
                Send Reset Link
              </Text>
            )}
          </TouchableOpacity>

          {/* Help Text */}
          <View className="items-center">
            <Text 
              className="text-sm text-center leading-relaxed" 
              style={{ color: colors.placeholder }}
            >
              Remember your password?{' '}
              <TouchableOpacity 
                onPress={() => router.back()}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              >
                <Text 
                  className="font-medium underline" 
                  style={{ color: theme === 'dark' ? colors.subtext : '#374151' }}
                >
                  Sign in
                </Text>
              </TouchableOpacity>
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}