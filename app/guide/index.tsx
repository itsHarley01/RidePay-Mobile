// app/app-guide.tsx
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View, Platform } from 'react-native';

export default function AppGuidePage() {
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
          marginTop: Platform.OS === 'ios' ? 50 : 20,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-lg font-bold">
          App Guide
        </Text>
      </View>

      {/* CONTENT */}
      <ScrollView
        className="px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ color: colors.text }} className="mb-4">
          This guide will help you get started with using our application effectively.
        </Text>

        {/* Section 1 */}
        <Text style={{ color: colors.text }} className="font-bold mb-2">
          1. Creating an Account
        </Text>
        <Text style={{ color: colors.text }} className="mb-4">
          Open the app and tap "Sign Up" to create a new account. Fill in the required details and verify your email.
        </Text>

        {/* Section 2 */}
        <Text style={{ color: colors.text }} className="font-bold mb-2">
          2. Adding Balance
        </Text>
        <Text style={{ color: colors.text }} className="mb-4">
          Go to the "Top Up" section from the Explore page. Choose your payment method and follow the prompts.
        </Text>

        {/* Section 3 */}
        <Text style={{ color: colors.text }} className="font-bold mb-2">
          3. Applying for Discounts
        </Text>
        <Text style={{ color: colors.text }} className="mb-4">
          Navigate to "Discount" in the Explore page. If you haven't applied yet, you will be guided through the application form.
        </Text>

        {/* Section 4 */}
        <Text style={{ color: colors.text }} className="font-bold mb-2">
          4. Viewing Bus Locations
        </Text>
        <Text style={{ color: colors.text }} className="mb-4">
          Tap "Live Bus" to see real-time locations of buses on your routes.
        </Text>

        {/* Section 5 */}
        <Text style={{ color: colors.text }} className="font-bold mb-2">
          5. Getting Support
        </Text>
        <Text style={{ color: colors.text }} className="mb-4">
          Use the "Support" section to chat with our team or submit an inquiry form.
        </Text>
      </ScrollView>
    </View>
  );
}
