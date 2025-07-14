import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TopUpPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const handleTopUp = (method: 'station' | 'online') => {
    if (method === 'station') {
      // router.push('/station-topup'); // for future use
    } else {
      router.push('/topup/topup-online');
    }
  };

  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1 pt-16 px-6">
      {/* Back Button */}
      <View className="absolute top-12 left-4 z-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center space-x-2"
        >
          <FontAwesome5 name="arrow-left" size={20} color={colors.subtext} />
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View className="mt-20 items-center">
        <MaterialCommunityIcons
          name="credit-card-plus-outline"
          size={64}
          color={colors.accent}
          style={styles.iconShadow}
        />
        <Text style={{ color: colors.text }} className="text-3xl font-bold mt-4">
          Top-Up Methods
        </Text>
        <Text style={{ color: colors.subtext }} className="text-base text-center mt-2 px-6">
          Choose a convenient way to reload your balance.
        </Text>
      </View>

      {/* Options */}
      <View className="mt-10 space-y-6">
        {/* Station Option */}
        <TouchableOpacity
          onPress={() => handleTopUp('station')}
          className="flex-row items-center px-5 py-6 rounded-2xl shadow-lg"
          style={{ backgroundColor: theme === 'dark' ? '#1f1f1f' : '#f2f2f2' }}
        >
          <Ionicons name="location-sharp" size={40} color={colors.text} />
          <View className="ml-4">
            <Text style={{ color: colors.text }} className="text-lg font-bold">
              Top-Up at Station
            </Text>
            <Text style={{ color: colors.subtext }} className="text-sm mt-1">
              Visit the nearest station to reload your card.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Online Option */}
        <TouchableOpacity
          onPress={() => handleTopUp('online')}
          className="flex-row items-center px-5 py-6 mt-5 rounded-2xl shadow-lg"
          style={{ backgroundColor: theme === 'dark' ? '#1f1f1f' : '#f2f2f2' }}
        >
          <MaterialIcons name="online-prediction" size={40} color={colors.text} />
          <View className="ml-4">
            <Text style={{ color: colors.text }} className="text-lg font-bold">
              Top-Up Online
            </Text>
            <Text style={{ color: colors.subtext }} className="text-sm mt-1">
              Use your e-wallet or bank card to top-up instantly.
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconShadow: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});
