// File: app/_layout.tsx
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import '../global.css';

function AppContent() {
  const { theme } = useTheme();

  return (
    <View className={theme === 'dark' ? 'flex-1 bg-black' : 'flex-1 bg-white'}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
