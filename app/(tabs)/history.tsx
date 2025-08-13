import TransactionItem from '@/components/TransactionItem';
import { fetchUserDataByUid } from '@/api/fetchUserDataApi';
import { getTransactions } from '@/api/fetchUserTransactions';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { FontAwesome5 } from '@expo/vector-icons';
import { getAuthData } from '@/utils/auth';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function TransactionHistoryPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const [userData, setUserData] = useState<{ firstName: string, lastName: string, balance: number } | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch transactions from API
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
  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
  }, []);

  // Search filter
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      fetchUser(); // Reset to all data
      return;
    }
    const q = searchQuery.toLowerCase();
    setTransactions((prev) =>
      prev.filter(
        (txn) =>
          txn.title?.toLowerCase().includes(q) ||
          txn.body?.toLowerCase().includes(q) ||
          new Date(txn.timestamp).toLocaleDateString().includes(q)
      )
    );
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1 px-4">
      {/* Header */}
      <View className="mb-4">
        <Text style={{ color: colors.subtext }} className="text-2xl font-bold text-left pl-2">
          History Transactions
        </Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center justify-center mb-4">
        <TextInput
          placeholder="Search transactions..."
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

      {/* Transaction List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="pt-2 pb-6">
          {transactions.length === 0 ? (
            <Text className="text-center text-gray-400 mt-10 text-lg">
              No transactions found...
            </Text>
          ) : (
            transactions.map((txn) => (
              <Pressable
                key={txn._id}
                onPress={() =>
                  router.push({
                    pathname: '/receipt',
                    params: {
                      id: txn._id,
                      refId: txn.refId,
                      title: txn.title,
                      body: txn.body,
                      date: new Date(txn.timestamp).toLocaleDateString(),
                      time: new Date(txn.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                      amount: `${txn.type === 'topup' ? '+' : '-'}₱${txn.amount}`,
                    },
                  })
                }
                android_ripple={{ color: '#ccc' }}
                className="mb-4 border-b border-gray-300 pb-2"
              >
                <TransactionItem
                  title={txn.title || txn.type}
                  body={
                    txn.body ||
                    (txn.type === 'topup'
                      ? `Added ₱${txn.amount} to wallet`
                      : txn.type === 'bus'
                      ? 'Paid fare for bus'
                      : txn.type === 'card'
                      ? 'Successfully bought card'
                      : 'Transaction')
                  }
                  date={`${new Date(txn.timestamp).toLocaleDateString()} ${new Date(
                    txn.timestamp
                  ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  amount={`${txn.type === 'topup' ? '+' : '-'}₱${txn.amount}`}
                />
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
