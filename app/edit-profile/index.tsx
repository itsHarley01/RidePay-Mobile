// app/edit-profile.tsx
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

export default function EditProfilePage() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const router = useRouter();

  const [name, setName] = useState('helloworld');
  const [email, setEmail] = useState('sheitt@gmail.com');

  const handleSave = () => {
    if (!name || !email) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    console.log('Saved:', { name, email });
    Alert.alert('Success', 'Profile updated successfully!');
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      {/* Back Button */}
      <View className="absolute top-12 left-4 z-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center"
        >
          <FontAwesome5 name="arrow-left" size={18} color={colors.subtext} />
          <Text style={{ color: colors.subtext }} className="ml-2 text-base font-medium">
            Back
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6 pt-28">
        <Text
          style={{ color: colors.text }}
          className="text-3xl font-semibold text-center mb-8"
        >
          Edit Profile
        </Text>

        {/* Input Container */}
        <View className="space-y-5">
          <View>
            <Text style={{ color: colors.subtext }} className="mb-1 ml-1 text-sm">
              Name
            </Text>
            <View
              style={{ backgroundColor: colors.secondaryBackground, borderColor: colors.border }}
              className="rounded-2xl px-4 py-3 border"
            >
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.placeholder}
                style={{ color: colors.text }}
                className="text-base"
              />
            </View>
          </View>

          <View>
            <Text style={{ color: colors.subtext }} className="mb-1 ml-1 text-sm">
              Email
            </Text>
            <View
              style={{ backgroundColor: colors.secondaryBackground, borderColor: colors.border }}
              className="rounded-2xl px-4 py-3 border"
            >
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.placeholder}
                style={{ color: colors.text }}
                className="text-base"
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View className="mt-10">
          <TouchableOpacity
            onPress={handleSave}
            style={{
              backgroundColor: '#0c2340',
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            }}
            className="p-4 rounded-2xl items-center"
          >
            <Text className="text-white text-lg font-semibold">Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
