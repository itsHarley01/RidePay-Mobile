// /app/(tabs)/settings/permissions.tsx
import SettingTemplate from '@/components/SettingTemplate';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Text, View } from 'react-native';

export default function PermissionsScreen() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [locationPermission, setLocationPermission] = useState('while_using');
  const [cameraPermission, setCameraPermission] = useState('ask_every_time');

  const permissionOptions = [
    { label: 'Allow all the time', value: 'always' },
    { label: 'Allow only while using the app', value: 'while_using' },
    { label: 'Ask every time', value: 'ask_every_time' },
    { label: "Don’t allow", value: 'denied' },
  ];

  const renderPermissionRow = (
    label: string,
    value: string,
    onChange: (val: string) => void,
    icon: React.ReactNode
  ) => (
    <View className="space-y-2">
      <View className="flex-row items-center space-x-2">
        {icon}
        <Text
          className="text-base font-medium flex-1"
          style={{
            color: colors.text,
            flexShrink: 1,
            flexWrap: 'wrap',
          }}
        >
          {label}
        </Text>
      </View>

      <View
        style={{
          borderColor: colors.subtext,
          borderWidth: 1,
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: colors.background,
        }}
      >
        <Picker
          selectedValue={value}
          onValueChange={onChange}
          style={{
            color: colors.text,
            height: 60,
          }}
          dropdownIconColor={colors.text}
        >
          {permissionOptions.map((option) => (
            <Picker.Item label={option.label} value={option.value} key={option.value} />
          ))}
        </Picker>
      </View>
    </View>
  );

  return (
    <SettingTemplate title="App Permissions">
      <View className="px-4">
        <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
          Manage what the app can access
        </Text>

        <View
          className="rounded-2xl p-4 space-y-6"
          style={{
            backgroundColor: theme === 'dark' ? '#1f1f2e' : '#ffffff',
            borderColor: theme === 'dark' ? '#3e3e50' : '#ddd',
            borderWidth: 1,
            shadowColor: '#000',
            shadowOpacity: theme === 'dark' ? 0.3 : 0.06,
            shadowRadius: 6,
          }}
        >
          {renderPermissionRow(
            'Location Access',
            locationPermission,
            setLocationPermission,
            <Ionicons name="location-outline" size={20} color={colors.text} />
          )}

          {renderPermissionRow(
            'Camera Access',
            cameraPermission,
            setCameraPermission,
            <Ionicons name="camera-outline" size={20} color={colors.text} />
          )}

        </View>
      </View>
    </SettingTemplate>
  );
}
