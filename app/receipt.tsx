import Footer from '@/components/Footer';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReceiptScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const { id, refId, title, body, date, time, amount } = useLocalSearchParams();

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1  py-4 px-6 ">
      {/* Close Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 right-6 z-10"
      >
        <FontAwesome5 name="times" size={24} color={colors.subtext} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Icon & Title */}
        <View className="items-center mt-12 mb-6">
          <FontAwesome5 name="receipt" size={40} color={colors.subtext} />
          <Text style={{ color: colors.subtext }} className="text-2xl font-bold mt-2">{title}</Text>
          <Text style={{ color: colors.text }} className=" text-base mt-1 text-center px-4">{body}</Text>
        </View>

        {/* Transaction Details */}
        <View className="gap-y-4">
          <View className="flex-row justify-between mb-2">
            <Text style={{ color: colors.text }} className=" font-medium">Date and Time:</Text>
            <Text style={{ color: colors.text }} className=" font-semibold">
              {date} {time}
            </Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text style={{ color: colors.text }} className="font-medium">Amount:</Text>
            <Text style={{ color: colors.text }} className=" font-semibold">{amount}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text style={{ color: colors.text }} className="font-medium">Transaction ID:</Text>
            <Text style={{ color: colors.text }} className=" font-semibold">{id}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text style={{ color: colors.text }} className="font-medium">Reference ID:</Text>
            <Text style={{ color: colors.text }} className=" font-semibold">{refId}</Text>
          </View>
        </View>

        <View className="mt-auto">
          <Footer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
