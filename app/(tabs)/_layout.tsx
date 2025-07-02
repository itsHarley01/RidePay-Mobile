import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const logoSource =
  theme === 'dark'
    ? require('../../assets/images/dark-logo.png')
    : require('../../assets/images/ridepay-logo2.png');

  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1">
      {/* Floating Header */}
      <SafeAreaView className="z-50">
        <View className="flex-row items-center justify-between px-4 py-3 shadow-md">
          {/* Profile */}
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <FontAwesome5 name="user" size={22} color={colors.subtext} />
          </TouchableOpacity>

          {/* Logo */}
          <View className="flex-row items-center">
            <Image
              source={logoSource}
              className="w-10 h-10 mr-2"
              resizeMode="contain"
            />
            <Text className="text-2xl font-bold">
              <Text style={{ color: colors.text }} className="">Ride</Text>
              <Text className="text-yellow-600">Pay</Text>
            </Text>
          </View>

          {/* Notification */}
          <TouchableOpacity onPress={() => router.push('/notification-page')}>
            <Ionicons name="notifications-outline" size={24} color={colors.subtext} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Tabs */}
      <Tabs
         screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: '#FFD700',
          tabBarInactiveTintColor: 'white',
          tabBarLabelStyle: {
            fontSize: 10,
            marginBottom: 6,
          },
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 10, // vertically centers icon+label
          },
          tabBarStyle: {
            backgroundColor: '#0A2A54',
            height: 70,
            borderTopWidth: 0,
            borderRadius: 20,
            position: 'absolute',
            marginHorizontal: 20,
            marginBottom: 10,
           
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 10,
            zIndex: 10,
          },

        }}
      >
        {/* Home */}
        <Tabs.Screen
          name="home"
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="home" size={20} color={color} />
            ),
          }}
        />

        {/* History */}
        <Tabs.Screen
          name="history"
          options={{
            tabBarLabel: 'History',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="history" size={22} color={color} />
            ),
          }}
        />

        {/* Scan & Pay */}
        <Tabs.Screen
          name="scan-pay"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: () => (
              <View className="absolute -top-6 w-16 h-16 bg-yellow-400 rounded-full justify-center items-center shadow-md border-[4px] border-[#0A2A54]">
                <MaterialIcons name="center-focus-strong" size={28} color="#0A2A54" />
              </View>
            ),
          }}
        />


        {/* Explore */}
        <Tabs.Screen
          name="more-options"
          options={{
            tabBarLabel: 'Explore',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="explore" size={24} color={color} />
            ),
          }}
        />

        {/* Settings */}
        <Tabs.Screen
          name="settings"
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings-outline" size={22} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
