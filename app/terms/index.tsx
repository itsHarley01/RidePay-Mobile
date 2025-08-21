// app/terms.tsx
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View, Platform } from 'react-native';

export default function TermsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* HEADER */}
      <View
        className="flex-row items-center px-4 py-4 border-b"
        style={{
          borderBottomColor: colors.border,
          marginTop: Platform.OS === 'ios' ? 50 : 20, // extra top space for status bar
        }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-lg font-bold">
          Terms & Conditions
        </Text>
      </View>

      {/* CONTENT */}
      <ScrollView
        className="px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ color: colors.text }} className="mb-4">
          Welcome to our Terms and Conditions page. Please read these terms carefully before using our services.
        </Text>

        <Text style={{ color: colors.text }} className="font-bold mb-2">
          1. Acceptance of Terms
        </Text>
        <Text style={{ color: colors.text }} className="mb-4">
          By accessing or using our application, you agree to be bound by these Terms and Conditions.
        </Text>

        <Text style={{ color: colors.text }} className="font-bold mb-2">
          2. Use of Service
        </Text>
        <Text style={{ color: colors.text }} className="mb-4">
          You agree to use the service only for lawful purposes and in a manner that does not infringe the rights of others.
        </Text>

        <Text style={{ color: colors.text }} className="font-bold mb-2">
          3. Changes to Terms
        </Text>
        <Text style={{ color: colors.text }} className="mb-4">
          We may update these terms at any time. Changes will be posted within the application and will be effective immediately.
        </Text>

        <Text style={{ color: colors.text }} className="font-bold mb-2">
          4. Contact Us
        </Text>
        <Text style={{ color: colors.text }} className="mb-4">
          If you have any questions about these Terms, please contact our support team.
        </Text>
      </ScrollView>
    </View>
  );
}
