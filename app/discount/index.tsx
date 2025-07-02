// File: app/discount/index.tsx
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function DiscountIndex() {
  const hasDiscount = false; // Set true to simulate existing discount
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1  px-4 pt-12 pb-6">
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 left-4 z-10"
      >
        <FontAwesome5 name="arrow-left" size={20} color={colors.subtext} />
      </TouchableOpacity>

      <View className="mt-20">
        <Text style={{ color: colors.subtext }} className="text-3xl font-bold  text-center mb-8">
          Account Discount
        </Text>

        {hasDiscount ? (
          <View className="bg-[#0c2340] p-6 rounded-xl shadow-md">
            <Text style={{ color: colors.text }} className=" text-lg mb-2">Discount Type: <Text className="font-bold">Student</Text></Text>
            <Text style={{ color: colors.text }} className=" text-lg mb-2">Percentage: <Text className="font-bold">20%</Text></Text>
            <Text style={{ color: colors.text }} className=" text-lg">Expires: <Text className="font-bold">2025-05-01</Text></Text>
          </View>
        ) : (
          <View className="items-center mt-10">
            <Text style={{ color: colors.placeholder }}className=" text-base mb-6 text-center">
              You don't currently have an active discount.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/discount/apply')}
              className="bg-[#0c2340] px-6 py-3 rounded-full shadow-md"
            >
              <Text className="text-white font-semibold text-base">
                Apply for Discount
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
