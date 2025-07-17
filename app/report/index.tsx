import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ReportPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in both the subject and message.');
      return;
    }

    // Simulate form submission
    Alert.alert('Submitted', 'Your issue has been reported.');
    setSubject('');
    setMessage('');
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} className="flex-1 px-4 pt-10">
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} className="absolute left-4 top-10 z-10">
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      {/* Spacer to push content below back button */}
      <View className="mb-4" />

      <Text style={{ color: colors.text }} className="text-2xl font-bold mb-6 text-center">Report an Issue</Text>

      {/* Subject Input */}
      <Text style={{ color: colors.text }} className="mb-2">Subject</Text>
      <TextInput
        className="border rounded-lg px-4 py-2 mb-4"
        style={{ borderColor: colors.border, color: colors.text }}
        placeholder="e.g., App crashes on top-up"
        placeholderTextColor={colors.placeholder}
        value={subject}
        onChangeText={setSubject}
      />

      {/* Message Input */}
      <Text style={{ color: colors.text }} className="mb-2">Description</Text>
      <TextInput
        className="border rounded-lg px-4 py-2 mb-6 h-40 text-top"
        style={{ borderColor: colors.border, color: colors.text }}
        placeholder="Describe the issue in detail..."
        placeholderTextColor={colors.placeholder}
        value={message}
        onChangeText={setMessage}
        multiline
        textAlignVertical="top"
      />

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-blue-500 rounded-lg py-3"
      >
        <Text className="text-white text-center font-semibold">Submit Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
