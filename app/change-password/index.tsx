import { View, Text, TextInput, TouchableOpacity, Platform, Alert, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
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
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch user profile to get registered email
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

        const userEmail = userData.email || userData.data?.email;
        setRegisteredEmail(userEmail);
        setEmail(userEmail || ''); // Pre-fill with registered email
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
      setLoading(true);
      const res = await sendResetLink(email);
      
      // Show success modal instead of alert
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error("Error sending reset link:", error);
      Alert.alert("Error", error?.response?.data?.message || "The email you entered is not registered.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = async () => {
    setShowSuccessModal(false);
    
    // Auto logout after sending reset link
    await AsyncStorage.multiRemove(["accessToken", "refreshToken", "uid"]);
    
    setTimeout(() => {
      router.replace("/");
    }, 100);
  };

  const inputStyle = {
    height: 56,
    borderWidth: 1,
    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 24,
  };

  const labelStyle = {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.2,
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 40,
          flexGrow: 1,
        }}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 40,
          paddingTop: 8,
        }}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
            }}
          >
            <FontAwesome5 name="arrow-left" size={18} color={colors.text} />
          </TouchableOpacity>
          <Text style={{
            fontSize: 24,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: -0.3,
          }}>
            Change Password
          </Text>
        </View>

        {/* Main Content */}
        <View style={{ flex: 1 }}>
          {/* Icon and Description */}
          <View style={{
            alignItems: 'center',
            marginBottom: 48,
          }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#F59E0B',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
              shadowColor: '#F59E0B',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 6,
            }}>
              <FontAwesome5 name="key" size={32} color="white" />
            </View>

            <Text style={{
              fontSize: 28,
              fontWeight: '700',
              color: colors.text,
              textAlign: 'center',
              marginBottom: 12,
              letterSpacing: -0.5,
            }}>
              Reset Your Password
            </Text>

            <Text style={{
              fontSize: 16,
              color: colors.subtext,
              textAlign: 'center',
              lineHeight: 24,
              paddingHorizontal: 16,
            }}>
              We'll send you a secure link to reset your password via email
            </Text>
          </View>

          {/* Email Input */}
          <View style={{ marginBottom: 32 }}>
            <Text style={labelStyle}>
              Email Address <Text style={{ color: '#ef4444' }}>*</Text>
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={[inputStyle, { paddingLeft: 48 }]}
                placeholder="Enter your registered email"
                placeholderTextColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
                autoCorrect={false}
              />
              <View style={{
                position: 'absolute',
                left: 16,
                top: 18,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <FontAwesome5 
                  name="envelope" 
                  size={16} 
                  color={theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'} 
                />
              </View>
            </View>

            {/* Registered Email Info */}
            {registeredEmail && (
              <View style={{
                backgroundColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                borderRadius: 8,
                padding: 12,
                marginTop: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Ionicons 
                  name="information-circle" 
                  size={16} 
                  color="#F59E0B" 
                  style={{ marginRight: 8 }}
                />
                <Text style={{
                  fontSize: 12,
                  color: colors.subtext,
                  flex: 1,
                }}>
                  Your registered email: {registeredEmail}
                </Text>
              </View>
            )}
          </View>

          {/* Send Reset Link Button */}
          <TouchableOpacity
            onPress={handleSendResetLink}
            disabled={loading || !email}
            style={{
              height: 56,
              backgroundColor: loading || !email ? 'rgba(245, 158, 11, 0.6)' : '#F59E0B',
              borderRadius: 16,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#F59E0B',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 4,
              marginBottom: 24,
            }}
          >
            {loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="white" />
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600',
                  marginLeft: 8,
                  letterSpacing: 0.3,
                }}>
                  Sending...
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesome5 name="paper-plane" size={16} color="white" style={{ marginRight: 8 }} />
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600',
                  letterSpacing: 0.3,
                }}>
                  Send Reset Link
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Security Notice */}
          <View style={{
            backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'flex-start',
          }}>
            <Ionicons 
              name="shield-checkmark" 
              size={20} 
              color="#3B82F6" 
              style={{ marginRight: 12, marginTop: 2 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 4,
              }}>
                Security Notice
              </Text>
              <Text style={{
                fontSize: 13,
                color: colors.subtext,
                lineHeight: 18,
              }}>
                For your security, you'll be logged out after the reset link is sent. Check your email and follow the instructions to create a new password.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSuccessModalClose}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
        }}>
          <View style={{
            backgroundColor: colors.background,
            borderRadius: 20,
            paddingVertical: 40,
            paddingHorizontal: 32,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
            minWidth: 300,
          }}>
            {/* Success Icon */}
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#22c55e',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
              shadowColor: '#22c55e',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}>
              <FontAwesome5 name="paper-plane" size={28} color="white" />
            </View>

            {/* Success Text */}
            <Text style={{
              fontSize: 22,
              fontWeight: '700',
              color: colors.text,
              textAlign: 'center',
              marginBottom: 12,
              letterSpacing: -0.3,
            }}>
              Email Sent!
            </Text>

            <Text style={{
              fontSize: 16,
              color: colors.subtext,
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 32,
              paddingHorizontal: 8,
            }}>
              Check your inbox for the password reset link. You'll be redirected to login.
            </Text>

            {/* OK Button */}
            <TouchableOpacity
              onPress={handleSuccessModalClose}
              style={{
                backgroundColor: '#22c55e',
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 32,
                minWidth: 120,
                shadowColor: '#22c55e',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '600',
                textAlign: 'center',
                letterSpacing: 0.3,
              }}>
                Got it!
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}