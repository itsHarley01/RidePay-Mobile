import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import NotificationItem from '../components/NotificationItem';
import { getTransactions } from '@/api/fetchUserTransactions';
import { fetchUserDataByUid } from '@/api/fetchUserDataApi';
import { getAuthData } from '@/utils/auth';

export default function NotificationPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<{ firstName: string; lastName: string; balance: number } | null>(null);
  
  type Transaction = {
    _id?: string;
    type: string;
    amount: number;
    timestamp: string | number | Date;
  };

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered] = useState<Transaction[]>([]);

  const getIconName = (type: string) => {
    switch (type) {
      case 'topup':
        return 'wallet';
      case 'bus':
        return 'bus';
      case 'card':
        return 'card';
      default:
        return 'notifications';
    }
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      const { uid } = await getAuthData();

      if (uid) {
        const user = await fetchUserDataByUid(uid);
        const txns = await getTransactions({ fromUser: uid });

        setUserData({
          firstName: user.firstName,
          lastName: user.lastName,
          balance: user.balance ?? 0,
        });

        setTransactions(txns);
        setFiltered(txns);
      }
    } catch (err) {
      console.error('Failed to fetch user or transactions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSearch = () => {
    const q = searchQuery.toLowerCase();
    if (!q.trim()) {
      setFiltered(transactions);
      return;
    }

    const result = transactions.filter(
      (t) =>
        t.type.toLowerCase().includes(q) ||
        new Date(t.timestamp).toLocaleDateString().includes(q)
    );
    setFiltered(result);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFiltered(transactions);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUser();
  };

  const getBodyText = (type: string, amount: number) => {
    switch (type) {
      case 'topup':
        return `Successfully added ₱${amount} to your wallet`;
      case 'bus':
        return `Bus fare payment of ₱${amount} completed`;
      case 'card':
        return `Card purchase of ₱${amount} successful`;
      default:
        return `Transaction of ₱${amount} completed`;
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'topup':
        return 'Wallet Top-up';
      case 'bus':
        return 'Fare Payment';
      case 'card':
        return 'Card Purchase';
      default:
        return 'Transaction';
    }
  };

  const groupNotificationsByDate = (notifications: Transaction[]) => {
    const grouped = notifications.reduce((groups: { [key: string]: Transaction[] }, notification) => {
      const date = new Date(notification.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey: string;
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday';
      } else {
        dateKey = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(notification);
      return groups;
    }, {});

    // Sort dates with Today first, Yesterday second, then chronological
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      if (a === 'Today') return -1;
      if (b === 'Today') return 1;
      if (a === 'Yesterday') return -1;
      if (b === 'Yesterday') return 1;
      return new Date(b).getTime() - new Date(a).getTime();
    });

    return sortedDates.map(date => ({
      date,
      notifications: grouped[date].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    }));
  };

  const groupedNotifications = groupNotificationsByDate(filtered);

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
      {/* Header */}
      <View className="px-6 py-4">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.secondaryBackground }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={{ color: colors.text }} className="text-xl font-bold">
            Notifications
          </Text>
          
          <TouchableOpacity 
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.secondaryBackground }}
          >
            <Ionicons name="notifications" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View 
          className="flex-row items-center rounded-2xl px-4 py-3 border border-gray-200"
          style={{ backgroundColor: colors.secondaryBackground }}
        >
          <Ionicons name="search" size={20} color={colors.subtext} />
          <TextInput
            placeholder="Search notifications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-base"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            style={{ color: colors.text }}
            placeholderTextColor={colors.subtext}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} className="ml-2">
              <Ionicons name="close-circle" size={20} color={colors.subtext} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={colors.highlight ? [colors.highlight] : undefined}
          />
        }
      >
        {loading ? (
          <View className="items-center justify-center py-20">
            <Text style={{ color: colors.subtext }} className="text-base">
              Loading notifications...
            </Text>
          </View>
        ) : groupedNotifications.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-6">
              <Ionicons name="notifications-outline" size={40} color="#6b7280" />
            </View>
            <Text style={{ color: colors.text }} className="text-lg font-medium mb-2">
              {searchQuery ? 'No results found' : 'No notifications yet'}
            </Text>
            <Text style={{ color: colors.subtext }} className="text-base text-center">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Transaction notifications will appear here'
              }
            </Text>
            {searchQuery && (
              <TouchableOpacity 
                onPress={clearSearch}
                className="mt-4 px-6 py-3 rounded-xl bg-blue-600"
              >
                <Text className="text-white font-medium">Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="pb-6">
            {groupedNotifications.map((group, groupIdx) => (
              <View key={group.date} className="mb-8">
                {/* Date Header */}
                <Text 
                  style={{ color: colors.text }} 
                  className="text-sm font-semibold mb-4 opacity-70"
                >
                  {group.date}
                </Text>

                {/* Notifications for this date */}
                <View 
                  className="rounded-2xl overflow-hidden border border-gray-100"
                  style={{ backgroundColor: colors.secondaryBackground }}
                >
                  {group.notifications.map((txn, idx) => (
                    <View key={txn._id ? txn._id : `${txn.type}-${txn.timestamp}-${idx}`}>
                      <View className="p-4">
                        <View className="flex-row items-start">
                          {/* Notification Icon */}
                          <View 
                            className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                              txn.type === 'topup' ? 'bg-green-100' : 
                              txn.type === 'bus' ? 'bg-blue-100' :
                              txn.type === 'card' ? 'bg-purple-100' : 'bg-gray-100'
                            }`}
                          >
                            <Ionicons 
                              name={getIconName(txn.type) as any}
                              size={20} 
                              color={
                                txn.type === 'topup' ? '#16a34a' : 
                                txn.type === 'bus' ? '#2563eb' :
                                txn.type === 'card' ? '#7c3aed' : '#6b7280'
                              } 
                            />
                          </View>

                          {/* Notification Content */}
                          <View className="flex-1">
                            <View className="flex-row items-center justify-between mb-2">
                              <Text style={{ color: colors.text }} className="font-semibold text-base">
                                {getNotificationTitle(txn.type)}
                              </Text>
                              <Text 
                                className={`text-sm font-medium ${
                                  txn.type === 'topup' ? 'text-green-600' : 'text-blue-600'
                                }`}
                              >
                                {txn.type === 'topup' ? '+' : ''}₱{txn.amount}
                              </Text>
                            </View>
                            
                            <Text style={{ color: colors.subtext }} className="text-sm mb-2">
                              {getBodyText(txn.type, txn.amount)}
                            </Text>
                            
                            <Text style={{ color: colors.subtext }} className="text-xs">
                              {new Date(txn.timestamp).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </Text>
                          </View>

                          {/* Status Indicator */}
                          <View className="ml-3">
                            <View className="w-3 h-3 rounded-full bg-green-500" />
                          </View>
                        </View>
                      </View>

                      {/* Divider */}
                      {idx < group.notifications.length - 1 && (
                        <View className="border-b border-gray-100 mx-4" />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}