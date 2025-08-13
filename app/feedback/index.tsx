// app/feedback.tsx
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View, TextInput } from 'react-native';

export default function FeedbackPage() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [needQuickSupport, setNeedQuickSupport] = useState(true);

  const issues = [
    'App Crashed & Freezing',
    'Poor Photo Quality',
    'GPS Tracking Issues',
    'Show Performance',
    'Other',
  ];

  const handleSubmit = () => {
    // TODO: Send feedback to API
    console.log({
      rating,
      issue: selectedIssue,
      comment,
      needQuickSupport,
    });
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingTop: 50 }}
    >
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: 50,
          left: 20,
          zIndex: 1,
          padding: 8,
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={{ color: colors.text }} className="text-2xl font-bold text-center mb-2">
        Share Your Feedback
      </Text>
      <Text style={{ color: colors.text }} className="text-base text-center mb-6 opacity-70">
        Rate your experience
      </Text>

      {/* Star Rating */}
      <View className="flex-row justify-center mb-8">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            activeOpacity={0.7}
            style={{ marginHorizontal: 6 }}
          >
            <Ionicons
              name={rating >= star ? 'star' : 'star-outline'}
              size={36}
              color={rating >= star ? '#FFD700' : colors.text}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Issues Selector */}
      <Text style={{ color: colors.text }} className="text-sm font-semibold mb-4">
        SELECT THE ISSUES YOU'VE EXPERIENCED
      </Text>
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          paddingVertical: 4,
        }}
      >
        {issues.map((issue, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => setSelectedIssue(issue)}
            className="flex-row items-center py-3 px-4"
            style={{
              borderBottomWidth: idx !== issues.length - 1 ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <View
              className="w-5 h-5 mr-3 rounded-full border"
              style={{
                borderColor: selectedIssue === issue ? colors.accent : colors.border,
                backgroundColor: selectedIssue === issue ? colors.accent : 'transparent',
              }}
            />
            <Text style={{ color: colors.text }}>{issue}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Comment */}
      <View className="mt-6">
        <View className="flex-row items-center justify-between mb-2">
          <Text style={{ color: colors.text }} className="font-semibold">
            Your Comment
          </Text>
          <TouchableOpacity onPress={() => setNeedQuickSupport(!needQuickSupport)}>
            <View className="flex-row items-center">
              <View
                className="w-4 h-4 mr-2 rounded-full border"
                style={{
                  borderColor: needQuickSupport ? colors.accent : colors.border,
                  backgroundColor: needQuickSupport ? colors.accent : 'transparent',
                }}
              />
              <Text style={{ color: colors.text, fontSize: 12 }}>Need Quick Support</Text>
            </View>
          </TouchableOpacity>
        </View>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Describe your experience here..."
          placeholderTextColor="#999"
          multiline
          style={{
            backgroundColor: colors.card,
            color: colors.text,
            borderRadius: 12,
            padding: 12,
            height: 120,
            textAlignVertical: 'top',
            fontSize: 14,
          }}
        />
      </View>

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: colors.accent,
          borderRadius: 12,
          marginTop: 20,
          paddingVertical: 14,
        }}
        activeOpacity={0.8}
      >
        <Text className="text-white text-center font-semibold text-base">
          Submit Feedback
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
