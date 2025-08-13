import SettingTemplate from '@/components/SettingTemplate';
import { Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';

export default function AboutScreen() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <SettingTemplate title="About">
      <View className="space-y-8 px-4 py-4">
        {/* Mission Section */}
        <View className="space-y-3">
          <Text style={{ color: colors.text }} className="text-xl font-semibold">
            Mission Statement
          </Text>
          <Text style={{ color: colors.text }} className="text-base text-justify leading-loose">
            Our mission is to transform the way people move by delivering a smart, convenient, and fully cashless transportation experience.{" "}
            We aim to bridge the gap between traditional commuting and modern mobility through a user-friendly platform that empowers both passengers and transport operators.
          </Text>
          <Text style={{ color: colors.text }} className="text-base text-justify leading-loose">
            By integrating advanced digital payment systems, real-time tracking, and route optimization, we strive to provide a reliable, secure, and time-saving alternative to everyday travel.{" "}
            We are committed to fostering a culture of innovation, inclusivity, and trust—ensuring that every ride is not just a journey, but a seamless experience.
          </Text>
        </View>

        {/* Vision Section */}
        <View className="space-y-3">
          <Text style={{ color: colors.text }} className="text-xl font-semibold">
            Vision Statement
          </Text>
          <Text style={{ color: colors.text }} className="text-base text-justify leading-loose">
            We envision a future where public and private transportation is effortlessly accessible to everyone—digitally connected, environmentally responsible, and economically sustainable.{" "}
            Our goal is to become the leading mobility platform that redefines commuting by eliminating the need for cash, reducing wait times, and enhancing overall travel efficiency.
          </Text>
          <Text style={{ color: colors.text }} className="text-base text-justify leading-loose">
            Through continuous technological advancement and strong community engagement, we aspire to build a nationwide network that supports smart cities, improves quality of life, and empowers individuals to travel with confidence, convenience, and control.
          </Text>
        </View>

        {/* App Version */}
        <View className="pt-4">
          <Text style={{ color: colors.subtext }} className="text-sm text-center">
            Version 1.0.0
          </Text>
        </View>
      </View>
    </SettingTemplate>
  );
}
