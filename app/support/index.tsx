import { View, Text, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';

export default function SupportPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const handleContactSupport = () => {
    const email = 'RidePayMobile@gmail.com';
    const subject = encodeURIComponent('Need Help with the App');
    const body = encodeURIComponent('Hello Support Team,\n\nI need assistance with...');
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    Linking.openURL(mailtoUrl).catch(() =>
      Alert.alert('Error', 'Could not open your email app.')
    );
  };

  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1">
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 left-4 z-10 p-2"
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <ScrollView
        className="flex-1 px-6 pt-24 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text
          style={{ color: colors.text }}
          className="text-3xl font-bold text-center mb-4"
        >
          Customer Support
        </Text>

        {/* Description */}
        <Text
          style={{ color: colors.text }}
          className="text-base text-center mb-8 leading-relaxed"
        >
          Need help? Our support team is here to assist you with any issues, questions, or concerns.
        </Text>

        {/* Contact Button */}
        <TouchableOpacity
          onPress={handleContactSupport}
          className="bg-blue-600 rounded-xl py-4 px-6 mb-6 shadow-md"
        >
          <Text className="text-white text-center text-base font-semibold">
            Contact Support
          </Text>
        </TouchableOpacity>

        {/* Additional Info */}
        <View className="items-center mt-4 space-y-1">
          <Text
            style={{ color: colors.text }}
            className="text-sm text-center"
          >
            Support Hours: 9:00 AM – 6:00 PM, Monday to Friday
          </Text>
          <Text
            style={{ color: colors.text }}
            className="text-sm text-center"
          >
            Email: RidePayMobile@gmail.com
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
