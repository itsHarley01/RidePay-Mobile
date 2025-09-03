import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuthData } from '@/utils/auth';
import { fetchUserDataByUid, updateUserProfile } from '@/api/userApi';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';

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
    if (!firstName.trim() || !lastName.trim() || !middleName.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    // Email validation

    try {
      setIsSaving(true);
      console.log('💾 Saving profile updates...');
      
      const updates = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        middleName: middleName.trim(),
        contactNumber: contactNumber.trim()
      };
      
      console.log('📤 Updates to send:', updates);
      
      await updateUserProfile(uid, updates);
      
      Alert.alert(
        '✅ Success', 
        'Profile updated successfully!', 
        [{ text: 'OK', onPress: () => router.back() }]
      );
      
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

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colors.background 
      }}>
        <ActivityIndicator size="large" color="#0c2340" />
        <Text style={{ color: colors.text, marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={{ color: colors.text }} className="text-2xl font-bold mb-4">
        Edit Profile
      </Text>

      <Text style={{ color: colors.subtext }}>First Name *</Text>
      <TextInput
        className="border p-3 rounded mb-4"
        style={{ 
          borderColor: colors.subtext, 
          color: colors.text,
          backgroundColor: theme === 'dark' ? colors.surface : 'white'
        }}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Enter your first name"
        placeholderTextColor={colors.subtext}
        editable={!isSaving}
      />

      <Text style={{ color: colors.subtext }}>Last Name *</Text>
      <TextInput
        className="border p-3 rounded mb-4"
        style={{ 
          borderColor: colors.subtext, 
          color: colors.text,
          backgroundColor: theme === 'dark' ? colors.surface : 'white'
        }}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Enter your last name"
        placeholderTextColor={colors.subtext}
        editable={!isSaving}
      />

      <Text style={{ color: colors.subtext }}>Middle Name *</Text>
      <TextInput
        className="border p-3 rounded mb-4"
        style={{ 
          borderColor: colors.subtext, 
          color: colors.text,
          backgroundColor: theme === 'dark' ? colors.surface : 'white'
        }}
        value={middleName}
        onChangeText={setmiddleName}
        placeholder="Enter your middle name"
        placeholderTextColor={colors.subtext}
        editable={!isSaving}
      />

      <Text style={{ color: colors.subtext }}>Contact Number</Text>
      <TextInput
        className="border p-3 rounded mb-6"
        style={{ 
          borderColor: colors.subtext, 
          color: colors.text,
          backgroundColor: theme === 'dark' ? colors.surface : 'white'
        }}
        keyboardType="phone-pad"
        value={contactNumber}
        onChangeText={setContactNumber}
        placeholder="Enter your contact number"
        placeholderTextColor={colors.subtext}
        editable={!isSaving}
      />

      <TouchableOpacity
        onPress={handleSave}
        disabled={isSaving}
        className={`p-4 rounded items-center ${isSaving ? 'opacity-50' : ''}`}
        style={{ backgroundColor: '#0c2340' }}
      >
        {isSaving ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ActivityIndicator size="small" color="white" />
            <Text className="text-white font-bold text-lg ml-2">Saving...</Text>
          </View>
        ) : (
          <Text className="text-white font-bold text-lg">Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}