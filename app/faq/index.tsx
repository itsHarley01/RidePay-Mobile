import { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const faqs = [
  {
    question: 'How do I top up my card?',
    answer:
      'You can top up via the "Top Up" section on the Explore page, or visit a physical Top-Up Spot near you.',
  },
  {
    question: 'How can I track the bus in real-time?',
    answer: 'Go to Explore > Locations > Live Bus to view real-time bus tracking.',
  },
  {
    question: 'Where can I view my transaction history?',
    answer: 'Navigate to Explore > Services > History to see your past transactions.',
  },
  {
    question: 'What should I do if I encounter a problem?',
    answer: 'You can report problems using the "Report" option under Services in the Explore tab.',
  },
  {
    question: 'How do I apply for a discount?',
    answer: 'Go to Explore > Services > Discount to apply if you are eligible.',
  },
];

export default function FAQPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
    >
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>

      {/* Header */}
      <Text
        style={{
          color: colors.text,
          fontSize: 24,
          textAlign: 'center',
          marginBottom: 24,
          fontWeight: '600',
        }}
      >
        FAQs
      </Text>

      {/* FAQ List */}
      {faqs.map((item, index) => {
        const isExpanded = expandedIndex === index;

        return (
          <View key={index} style={{ marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => toggleFAQ(index)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 14,
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16,
                  flex: 1,
                }}
              >
                {item.question}
              </Text>
              <Ionicons
                name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>

            {isExpanded && (
              <Text
                style={{
                  marginTop: 6,
                  color: colors.text,
                  fontSize: 14,
                  lineHeight: 20,
                  opacity: 0.9,
                }}
              >
                {item.answer}
              </Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
