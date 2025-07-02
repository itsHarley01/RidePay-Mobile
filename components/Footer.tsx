// components/Footer.tsx
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { Text, View } from 'react-native';

export default function Footer() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  return (
    <View className="items-center ">
      <View className="flex-row space-x-1">
        <Text className="text-[#0A2A54] font-bold">Ride</Text>
        <Text className="text-yellow-600 font-bold">Pay</Text>
      </View>
      <Text style={{ color: colors.text }} className=" text-sm text-center mt-1">
        Cebu Philippines 2025 | Southwestern University
      </Text>
    </View>
  );
}
