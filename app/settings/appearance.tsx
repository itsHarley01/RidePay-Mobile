// File: /app/settings/appearance.tsx
import SettingTemplate from '@/components/SettingTemplate';
import ThemeToggleSwitch from '@/components/ThemeToggleSwitch';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { Text, View } from 'react-native';

export default function AppearanceScreen() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <SettingTemplate
      title="Appearance"
    >
      <View >
        <Text style={{ color: colors.subtext }} className='text-2xl font-bold px-5 mb-2'>
          Theme
        </Text>
        <Text style={{ fontSize: 16, color: colors.text }} className='text-lg mb-10 px-5'>
          Customize theme appearance.
        </Text>
        <ThemeToggleSwitch />
      </View>
    </SettingTemplate>
  );
}
