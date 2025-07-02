// /app/(tabs)/settings/about.tsx
import SettingTemplate from '@/components/SettingTemplate';
import { Text, View } from 'react-native';

export default function AboutScreen() {
  return (
    <SettingTemplate title="About">
      <View className="space-y-4">
        <Text className="text-base text-gray-700">
          This app is developed to make commuting easier and more convenient.
        </Text>
        <Text className="text-sm text-gray-500">Version 1.0.0</Text>
      </View>
    </SettingTemplate>
  );
}
