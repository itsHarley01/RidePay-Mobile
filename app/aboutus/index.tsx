import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';

export default function AboutUsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

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
        className="flex-1 px-6 pt-24 pb-12"
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <Text style={{ color: colors.text }} className="text-3xl font-bold text-center mb-6">
          About Us
        </Text>

        {/* Section Container */}
        <View
          className="rounded-2xl p-6 shadow-sm"
          style={{ backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f9f9f9' }}
        >
          {/* Paragraphs */}
          <Text
            style={{ color: colors.text }}
            className="text-base leading-relaxed text-justify mb-5"
          >
            Welcome to our platform! We are a forward-thinking tech company committed to making public
            transportation more accessible, convenient, and user-friendly. Our fare collection system is
            designed with modern commuters in mind — fast, cashless, and built for everyday Filipinos.
          </Text>

          <Text
            style={{ color: colors.text }}
            className="text-base leading-relaxed text-justify mb-5"
          >
            Our team is composed of passionate developers, designers, and transportation experts working
            together to digitize local mobility. We partner with transport operators and local government
            units to bring innovative solutions that improve efficiency and rider satisfaction.
          </Text>

          <Text
            style={{ color: colors.text }}
            className="text-base leading-relaxed text-justify mb-5"
          >
            We believe in creating inclusive technology — one that empowers commuters and drivers alike.
            Whether you're topping up your balance, checking your ride history, or applying for fare
            discounts, our goal is to make the process seamless and secure.
          </Text>

          <Text
            style={{ color: colors.text }}
            className="text-base leading-relaxed text-justify font-semibold"
          >
            Thank you for being part of our journey. Let’s move forward, together.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
