// File: /app/(tabs)/settings.tsx
import Footer from '@/components/Footer';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsTab() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const handlePress = (path: string) => {
    router.push(path as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        className='px-6 pb-10'
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 24 }}>
          Settings
        </Text>

        {/* General Section */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>
            General
          </Text>
          {[
            { label: 'Appearance', path: '/settings/appearance' },
            { label: 'Notifications', path: '/settings/notifications' },
            { label: 'About', path: '/settings/about' },
          ].map(({ label, path }) => (
            <TouchableOpacity
              key={label}
              onPress={() => handlePress(path)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#ccc',
              }}
            >
              <Text style={{ fontSize: 16, color: colors.text }}>{label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Account Section */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>
            Account
          </Text>
          <TouchableOpacity
            onPress={() => handlePress('/profile')}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#ccc',
            }}
          >
            <Text style={{ fontSize: 16, color: colors.text }}>Manage Account</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Privacy & Security Section */}
        <View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>
            Privacy & Security
          </Text>
          {[
            { label: 'Manage App Permissions', path: '/settings/permissions' },
            { label: 'Privacy Policy', path: '/settings/privacy-policy' },
          ].map(({ label, path }) => (
            <TouchableOpacity
              key={label}
              onPress={() => handlePress(path)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#ccc',
              }}
            >
              <Text style={{ fontSize: 16, color: colors.text }}>{label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

          <View className= 'mt-auto h-64 pt-20'>
            <Footer/>
          </View>
      </ScrollView>
    </SafeAreaView>
  );
}
