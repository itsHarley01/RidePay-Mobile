// /app/(tabs)/settings/appearance.tsx
import SettingTemplate from '@/components/SettingTemplate';
import { Text, View } from 'react-native';

export default function PermissionScreen() {
  return (
    <SettingTemplate title="Appearance">
      <View className="space-y-4">
        <Text className="text-base text-gray-700">
          permission
        </Text>
      </View>
    </SettingTemplate>
  );
}
