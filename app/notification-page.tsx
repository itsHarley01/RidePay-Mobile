import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import NotificationItem from '../components/NotificationItem';
import { getTransactions } from '@/api/fetchUserTransactions'; // make sure this exists
import { fetchUserDataByUid } from '@/api/fetchUserDataApi';
import { getAuthData } from '@/utils/auth';

export default function NotificationPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{ firstName: string, lastName: string, balance: number } | null>(null);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered] = useState([]);

  const getIconComponent = (type: string) => {
    switch (type) {
      case 'topup':
        return <MaterialCommunityIcons name="wallet-plus" size={24} color={colors.subtext} />;
      case 'bus':
        return <MaterialCommunityIcons name="bus" size={24} color={colors.subtext} />;
      case 'card':
        return <MaterialCommunityIcons name="credit-card" size={24} color={colors.subtext} />;
      default:
        return <MaterialCommunityIcons name="information" size={24} color={colors.subtext} />;
    }
  };
  const fetchUser = async () => {
  try {
    setLoading(true);
    const { uid } = await getAuthData();

    if (uid) {
      const user = await fetchUserDataByUid(uid);
      const txns = await getTransactions({ fromUser: uid }); // ✅ this line

      setUserData({
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance ?? 0,
      });

      setTransactions(txns); // ✅ store fetched transactions
    }
  } catch (err) {
    console.error('Failed to fetch user or transactions:', err);
  } finally {
    setLoading(false);
  }
};


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

  

  const getBodyText = (type: string, amount: number) => {
    switch (type) {
      case 'topup':
        return `You added ₱${amount} to your wallet.`;
      case 'bus':
        return `You paid ₱${amount} for bus fare.`;
      case 'card':
        return `You purchased a card for ₱${amount}.`;
      default:
        return `You made a transaction of ₱${amount}.`;
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1 px-4 pt-4">
      {/* Header */}
      <View className="flex-row items-center justify-start mb-4 relative">
        <TouchableOpacity onPress={() => router.back()} className="z-10">
          <FontAwesome5 name="arrow-left" size={20} color={colors.subtext} />
        </TouchableOpacity>
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
          onSubmitEditing={handleSearch}
          className="flex-1 border border-gray-300 rounded-l-full px-4 py-2"
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

      {/* Notifications List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: colors.background }} className="pt-2 pb-6">
          {filtered.length === 0 ? (
            <Text className="text-center text-gray-400 mt-10 text-lg">
              No notifications found...
            </Text>
          ) : (
            (transactions as Transactions[]).map((txn) => (
  <View key={txn._id} className="my-1">
    <NotificationItem
      title={
        txn.type === 'topup'
          ? 'Top-up Successful'
          : txn.type === 'bus'
          ? 'Fare Paid'
          : txn.type === 'card'
          ? 'Card Purchased'
          : 'Transaction'
      }
      body={getBodyText(txn.type, txn.amount)}
      icon={getIconComponent(txn.type)}
      status={txn.type}
      date={new Date(txn.timestamp).toLocaleDateString()}
    />
  </View>
))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}