// /app/(tabs)/settings/appearance.tsx
import SettingTemplate from '@/components/SettingTemplate';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { Text, View } from 'react-native';

export default function NotificationScreen() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  return (
    <SettingTemplate title="Appearance">
      <View className="space-y-4">
        <Text className="text-base text-gray-700">
          notification
        </Text>
      </View>
    </SettingTemplate>
  );
}
