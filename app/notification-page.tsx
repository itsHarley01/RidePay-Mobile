import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationItem from '../components/NotificationItem';

// Sample notification data array
const notificationsData = [
  {
    id: '1',
    title: 'Successfully Paid',
    body: 'You have successfully paid 29 PHP. Thank you for using RidePay.',
    iconName: 'bus',
    iconType: 'MaterialCommunityIcons',
    status: 'Paid',
    date: '6/27/2025',
  },
  {
    id: '2',
    title: 'New Discount Promo!',
    body: 'New discount promo is ongoing. Apply now!',
    iconName: 'tag-outline',
    iconType: 'MaterialCommunityIcons',
    status: 'None',
    date: '6/20/2025',
  },
  {
    id: '3',
    title: 'Top-up Successful',
    body: 'You topped up 100 PHP to your wallet.',
    iconName: 'wallet-plus',
    iconType: 'MaterialCommunityIcons',
    status: 'Top-up',
    date: '6/15/2025',
  },
  {
    id: '4',
    title: 'Account Update',
    body: 'Your account info has been updated.',
    iconName: 'account-edit',
    iconType: 'MaterialCommunityIcons',
    status: 'Updated',
    date: '6/10/2025',
  },
];

export default function NotificationPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const [notifications, setNotifications] = useState(notificationsData);
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to get icon component based on iconType and iconName
  const getIconComponent = (iconType: string, iconName: string, color = '#0A2A54') => {
    switch (iconType) {
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={iconName as any} size={24} color={color} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={iconName as any} size={24} color={color} />;
      default:
        return null;
    }
  };

  // Search handler: filter notifications by title or date (case-insensitive)
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      // If search is empty, reset to full list
      setNotifications(notificationsData);
      return;
    }

    const filtered = notificationsData.filter((notif) => {
      const q = searchQuery.toLowerCase();
      return (
        notif.title.toLowerCase().includes(q) ||
        notif.date.toLowerCase().includes(q)
      );
    });

    setNotifications(filtered);
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1 px-4 pt-4">
      {/* Header with Back Button */}
      <View className="flex-row items-center justify-start mb-4 relative">
        <TouchableOpacity onPress={() => router.back()} className="z-10">
          <FontAwesome5 name="arrow-left" size={20} color={colors.subtext} />
        </TouchableOpacity>

        {/* Centered title using absolute position */}
        <Text style={{ color: colors.text }} className="text-2xl font-bold absolute left-1/2 -translate-x-1/2">
          Notifications
        </Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center justify-center mb-4">
        <TextInput
          placeholder="Search notifications..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 border border-gray-300 rounded-l-full px-4 py-2"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          style={{ color: colors.text }}
          placeholderTextColor={colors.placeholder}
        />
        <TouchableOpacity
          className="bg-yellow-400 px-4 py-2 rounded-r-full"
          onPress={handleSearch}
        >
          <FontAwesome5 name="search" size={18} color="#0A2A54" />
        </TouchableOpacity>
      </View>

      {/* Scrollable List with padding top and bottom */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: colors.background }} className="pt-2 pb-6">
          {notifications.length === 0 ? (
            <Text className="text-center text-gray-400 mt-10 text-lg ">
              No notifications found...
            </Text>
          ) : (
            notifications.map((notif) => (
              <View key={notif.id}  className="my-1">
                <NotificationItem
                  title={notif.title}
                  body={notif.body}
                  icon={getIconComponent(notif.iconType, notif.iconName, colors.subtext)}
                  status={notif.status}
                  date={notif.date}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
