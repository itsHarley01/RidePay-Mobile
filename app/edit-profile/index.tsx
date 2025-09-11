import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuthData } from '@/utils/auth';
import { fetchUserDataByUid, updateUserProfile } from '@/api/userApi';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function EditProfile() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  
  const [uid, setUid] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setmiddleName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Getting auth data...');
        
        const authData = await getAuthData();
        console.log('🔍 Auth data received:', authData);
        
        if (!authData.uid) {
          Alert.alert('Error', 'No UID found. Please log in again.');
          router.replace('/'); // Redirect to login
          return;
        }
        
        setUid(authData.uid);
        console.log('📡 Fetching user data for UID:', authData.uid);
        
        const userData = await fetchUserDataByUid(authData.uid);
        console.log('👤 User data received:', userData);
        
        // Handle different response structures
        const user = userData.data || userData; // In case API wraps data
        
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setmiddleName(user.middleName || '');
        setContactNumber(user.contactNumber || '');
        
      } catch (err: any) {
        console.error('❌ Error in loadUser:', err);
        
        // More specific error handling
        let errorMessage = 'Failed to load profile';
        
        if (err.response?.status === 404) {
          errorMessage = 'User profile not found';
        } else if (err.response?.status === 401) {
          errorMessage = 'Unauthorized. Please log in again.';
          router.replace('/');
          return;
        } else if (err.response?.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.error) {
          errorMessage = err.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        Alert.alert('Error', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleSave = async () => {
    if (!uid) {
      Alert.alert('Error', 'No user ID found');
      return;
    }

    // Basic validation
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      console.log('💾 Saving profile updates...');
      
      const updates = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        middleName: middleName.trim() || '',
        contactNumber: contactNumber.trim()
      };
      
      console.log('📤 Updates to send:', updates);
      
      await updateUserProfile(uid, updates);
      
      // Show success modal instead of alert
      setShowSuccessModal(true);
      
    } catch (err: any) {
      console.error('❌ Error in handleSave:', err);
      
      // More specific error handling
      let errorMessage = 'Failed to update profile';
      
      if (err.response?.status === 400) {
        errorMessage = 'Invalid data provided';
      } else if (err.response?.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
      } else if (err.response?.status === 404) {
        errorMessage = 'User not found';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.error) {
        errorMessage = err.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert('Update Failed', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setTimeout(() => {
      router.back();
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

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colors.background 
      }}>
        <ActivityIndicator size="large" color="#0c2340" />
        <Text style={{ 
          color: colors.subtext, 
          marginTop: 16, 
          fontSize: 16,
          fontWeight: '400'
        }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: 24,
          paddingTop: 32,
          paddingBottom: 40,
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
          
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 28,
              fontWeight: '700',
              color: colors.text,
              letterSpacing: -0.5,
              marginBottom: 8,
            }}>
              Edit Profile
            </Text>
            <Text style={{
              fontSize: 16,
              color: colors.subtext,
              fontWeight: '400',
              lineHeight: 22,
            }}>
              Update your personal information
            </Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={{ marginBottom: 40 }}>
          {/* First Name */}
          <View style={{ marginBottom: 24 }}>
            <Text style={labelStyle}>
              First Name <Text style={{ color: '#ef4444' }}>*</Text>
            </Text>
            <TextInput
              style={inputStyle}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              placeholderTextColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
              editable={!isSaving}
            />
          </View>

          {/* Last Name */}
          <View style={{ marginBottom: 24 }}>
            <Text style={labelStyle}>
              Last Name <Text style={{ color: '#ef4444' }}>*</Text>
            </Text>
            <TextInput
              style={inputStyle}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              placeholderTextColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
              editable={!isSaving}
            />
          </View>

          {/* Middle Name */}
          <View style={{ marginBottom: 24 }}>
            <Text style={labelStyle}>Middle Name</Text>
            <TextInput
              style={inputStyle}
              value={middleName}
              onChangeText={setmiddleName}
              placeholder="Enter middle name (optional)"
              placeholderTextColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
              editable={!isSaving}
            />
          </View>

          {/* Contact Number */}
          <View>
            <Text style={labelStyle}>Contact Number</Text>
            <TextInput
              style={inputStyle}
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={setContactNumber}
              placeholder="Enter contact number"
              placeholderTextColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
              editable={!isSaving}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={{
            height: 56,
            backgroundColor: isSaving ? 'rgba(12, 35, 64, 0.6)' : '#0c2340',
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#0c2340',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          {isSaving ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator size="small" color="white" />
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '600',
                marginLeft: 8,
                letterSpacing: 0.3,
              }}>
                Saving...
              </Text>
            </View>
          ) : (
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600',
              letterSpacing: 0.3,
            }}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
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
            minWidth: 280,
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
              <Ionicons 
                name="checkmark" 
                size={40} 
                color="white" 
              />
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
              Success!
            </Text>

            <Text style={{
              fontSize: 16,
              color: colors.subtext,
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 32,
            }}>
              Your profile has been updated successfully
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
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}