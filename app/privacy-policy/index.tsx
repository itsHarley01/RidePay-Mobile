import { ScrollView, Text, View, TouchableOpacity  } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { darkColors, lightColors } from '@/theme/colors';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const router = useRouter();

  return (
    <ScrollView style={{ backgroundColor: colors.background }} className="flex-1 px-4 pt-10 pb-32">
       {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="flex-row items-center mb-6"
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={{ color: colors.text }} className="text-2xl font-bold mb-6 text-center">
        Privacy Policy
      </Text>

      <View className="space-y-4">
        <Text style={{ color: colors.text }} className="text-base">
          We value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data.
        </Text>

        <Text style={{ color: colors.text }} className="text-lg font-semibold">1. Information We Collect</Text>
        <Text style={{ color: colors.text }} className="text-base">
          • Personal Information (e.g., name, email, contact number){'\n'}
          • Transaction details (e.g., top-ups, payments){'\n'}
          • Device and usage data (e.g., IP address, app usage)
        </Text>

        <Text style={{ color: colors.text }} className="text-lg font-semibold">2. How We Use Your Information</Text>
        <Text style={{ color: colors.text }} className="text-base">
          • To provide and improve our services{'\n'}
          • To process transactions securely{'\n'}
          • To offer customer support and notify users of important updates{'\n'}
          • For research, analytics, and app enhancement
        </Text>

        <Text style={{ color: colors.text }} className="text-lg font-semibold">3. Data Protection</Text>
        <Text style={{ color: colors.text }} className="text-base">
          • We implement industry-standard security measures{'\n'}
          • Only authorized personnel have access to your data{'\n'}
          • Data is encrypted and stored securely
        </Text>

        <Text style={{ color: colors.text }} className="text-lg font-semibold">4. Sharing of Information</Text>
        <Text style={{ color: colors.text }} className="text-base">
          • We do not sell or rent your data{'\n'}
          • Information may be shared with third-party service providers only to support our operations
        </Text>

        <Text style={{ color: colors.text }} className="text-lg font-semibold">5. Your Rights</Text>
        <Text style={{ color: colors.text }} className="text-base">
          • You can access, update, or delete your personal information at any time by contacting us{'\n'}
          • You may opt out of certain data uses like marketing
        </Text>

        <Text style={{ color: colors.text }} className="text-lg font-semibold">6. Policy Updates</Text>
        <Text style={{ color: colors.text }} className="text-base">
          • We may update this policy to reflect changes in practices or regulations. Users will be notified through the app.
        </Text>

        <Text style={{ color: colors.text }} className="text-base">
          If you have questions, contact us at: support@ridepay.com
        </Text>
      </View>

      <View className="mt-12 h-64">
        <Footer />
      </View>
    </ScrollView>
  );
}
