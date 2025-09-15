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
    try {
      router.push(path as any);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const settingSections = [
    {
      title: 'General',
      items: [
        { 
          id: 'appearance',
          label: 'Appearance', 
          path: '/settings/appearance',
          icon: 'color-palette-outline',
          description: 'Theme and display settings'
        },
        { 
          id: 'notifications',
          label: 'Notifications', 
          path: '/settings/notifications',
          icon: 'notifications-outline',
          description: 'Manage notification preferences'
        },
        { 
          id: 'about',
          label: 'About', 
          path: '/settings/about',
          icon: 'information-circle-outline',
          description: 'App version and information'
        },
      ]
    },
    {
      title: 'Account',
      items: [
        { 
          id: 'profile',
          label: 'Manage Account', 
          path: '/profile',
          icon: 'person-outline',
          description: 'Profile and account settings'
        },
      ]
    },
    {
      title: 'Privacy & Security',
      items: [
        { 
          id: 'permissions',
          label: 'App Permissions', 
          path: '/settings/permissions',
          icon: 'shield-outline',
          description: 'Manage app access permissions'
        },
        { 
          id: 'privacy',
          label: 'Privacy Policy', 
          path: '/settings/privacy-policy',
          icon: 'document-text-outline',
          description: 'Read our privacy policy'
        },
      ]
    }
  ];

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => handlePress(item.path)}
      style={{
        backgroundColor: colors.secondaryBackground || (theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#ffffff'),
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
        borderWidth: 1,
        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      }}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
      }}>
        <Ionicons 
          name={item.icon as any} 
          size={20} 
          color={colors.text}
        />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 2,
        }}>
          {item.label}
        </Text>
        <Text style={{
          fontSize: 13,
          color: colors.subtext,
          lineHeight: 16,
        }}>
          {item.description}
        </Text>
      </View>

      {/* Chevron */}
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={colors.subtext}
        style={{ opacity: 0.5 }}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 120, // leave space for footer
        }}
      >
        {/* Header */}
        <View style={{
          alignItems: 'center',
          marginBottom: 48,
          paddingTop: 16,
        }}>
          <Text style={{
            fontSize: 32,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: -0.8,
            marginBottom: 8,
          }}>
            Settings
          </Text>
          <Text style={{
            fontSize: 16,
            color: colors.subtext,
            textAlign: 'center',
            fontWeight: '400',
          }}>
            Customize your app experience
          </Text>
        </View>

        {/* Settings Sections */}
        {settingSections.map((section) => (
          <View key={section.title} style={{ marginBottom: 40 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 16,
              letterSpacing: -0.2,
            }}>
              {section.title}
            </Text>
            
            <View style={{ gap: 0 }}>
              {section.items.map((item) => renderSettingItem(item))}
            </View>
          </View>
        ))}

        {/* App Version Info */}
        <View style={{
          backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          marginBottom: 32,
          borderWidth: 1,
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        }}>
          <Ionicons 
            name="phone-portrait-outline" 
            size={32} 
            color={colors.subtext}
            style={{ marginBottom: 12 }}
          />
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
          }}>
            Bus Ticketing App
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.subtext,
            textAlign: 'center',
          }}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Footer - same as ticketing app */}
       <View style={{
        position: 'absolute',
        bottom: 80, // Positioned above the tab bar (usually 80-90px height)
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      }}></View>
      <Footer />
    </SafeAreaView>
  );
}
