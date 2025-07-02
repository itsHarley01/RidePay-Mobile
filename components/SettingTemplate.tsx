// components/SettingTemplate.tsx
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingTemplate({ title, children }: { title: string; children: React.ReactNode }) {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1 px-4 pt-4">
      {/* Header */}
      <View className="flex-row items-center mb-4 relative">
        <TouchableOpacity  onPress={() => router.back()} className="z-10">
          <FontAwesome5 name="arrow-left" size={20} color={colors.highlight} />
        </TouchableOpacity>
        <Text style={{ color: colors.subtext }} className="text-xl font-bold absolute left-1/2 -translate-x-1/2">
          {title}
        </Text>
      </View>

      {/* Body Content */}
      <ScrollView showsVerticalScrollIndicator={false} className="pb-10">
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
