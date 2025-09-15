import TransactionItem from '@/components/TransactionItem';
import { fetchUserDataByUid } from '@/api/fetchUserDataApi';
import { getTransactions } from '@/api/fetchUserTransactions';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
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
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
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
        const txns = await getTransactions({ fromUser: uid });

        setUserData({
          firstName: user.firstName,
          lastName: user.lastName,
          balance: user.balance ?? 0,
        });

        setTransactions(txns);
        setAllTransactions(txns);
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
      setTransactions(allTransactions);
      return;
    }
    
    const q = searchQuery.toLowerCase();
    const filtered = allTransactions.filter(
      (txn) =>
        txn.type?.toLowerCase().includes(q) ||
        String(txn.amount).toLowerCase().includes(q) ||
        new Date(txn.timestamp).toLocaleDateString().includes(q)
    );
    
    setTransactions(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setTransactions(allTransactions);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const groupTransactionsByDate = (transactions: any[]) => {
    const grouped = transactions.reduce((groups: { [key: string]: any[] }, transaction) => {
      const date = new Date(transaction.timestamp);
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
      groups[dateKey].push(transaction);
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
      transactions: grouped[date].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    }));
  };

  const groupedTransactions = groupTransactionsByDate(transactions);

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
            Transaction History
          </Text>
          
          <View className="w-10" />
        </View>

        {/* Stats Summary */}
        {userData && !loading && (
          <View 
            className="rounded-2xl p-4 mb-6 border border-gray-100"
            style={{ backgroundColor: colors.secondaryBackground }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text style={{ color: colors.subtext }} className="text-sm font-medium">
                  Current Balance
                </Text>
                <Text style={{ color: colors.text }} className="text-2xl font-bold mt-1">
                  ₱{userData.balance.toFixed(2)}
                </Text>
              </View>
              <View className="items-end">
                <Text style={{ color: colors.subtext }} className="text-sm font-medium">
                  Total Transactions
                </Text>
                <Text style={{ color: colors.text }} className="text-2xl font-bold mt-1">
                  {allTransactions.length}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View 
          className="flex-row items-center rounded-2xl px-4 py-3 border border-gray-200"
          style={{ backgroundColor: colors.secondaryBackground }}
        >
          <Ionicons name="search" size={20} color={colors.subtext} />
          <TextInput
            placeholder="Search transactions..."
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

      {/* Transaction List */}
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
              Loading transactions...
            </Text>
          </View>
        ) : groupedTransactions.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-6">
              <Ionicons name="receipt-outline" size={40} color="#6b7280" />
            </View>
            <Text style={{ color: colors.text }} className="text-lg font-medium mb-2">
              {searchQuery ? 'No results found' : 'No transactions yet'}
            </Text>
            <Text style={{ color: colors.subtext }} className="text-base text-center">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Your transaction history will appear here'
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
            {groupedTransactions.map((group, groupIdx) => (
              <View key={group.date} className="mb-8">
                {/* Date Header */}
                <Text 
                  style={{ color: colors.text }} 
                  className="text-sm font-semibold mb-4 opacity-70"
                >
                  {group.date}
                </Text>

                {/* Transactions for this date */}
                <View 
                  className="rounded-2xl overflow-hidden border border-gray-100"
                  style={{ backgroundColor: colors.secondaryBackground }}
                >
                  {group.transactions.map((txn, idx) => {
                    const title = txn.title || 
                      (txn.type === 'topup' ? 'Wallet Top-up' :
                       txn.type === 'bus' ? 'Bus Fare Payment' :
                       txn.type === 'card' ? 'Card Purchase' : 'Transaction');

                    const body = txn.body ||
                      (txn.type === 'topup' ? `Added ₱${txn.amount} to wallet` :
                       txn.type === 'bus' ? 'Paid fare for bus ride' :
                       txn.type === 'card' ? 'Successfully purchased card' : 'Transaction completed');

                    const amount = `${txn.type === 'topup' ? '+' : '-'}₱${txn.amount}`;

                    return (
                      <View key={txn._id || `${txn.refId}-${idx}`}>
                        <Pressable
                          onPress={() =>
                            router.push({
                              pathname: '/receipt',
                              params: {
                                id: txn._id,
                                refId: txn.refId,
                                title,
                                body,
                                date: new Date(txn.timestamp).toLocaleDateString(),
                                time: new Date(txn.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }),
                                amount,
                              },
                            })
                          }
                          className="p-4"
                          android_ripple={{ color: '#f3f4f6' }}
                        >
                          <View className="flex-row items-center">
                            {/* Transaction Icon */}
                            <View 
                              className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                                txn.type === 'topup' ? 'bg-green-100' : 
                                txn.type === 'bus' ? 'bg-blue-100' :
                                txn.type === 'card' ? 'bg-purple-100' : 'bg-gray-100'
                              }`}
                            >
                              <Ionicons 
                                name={
                                  txn.type === 'topup' ? 'add' : 
                                  txn.type === 'bus' ? 'bus' :
                                  txn.type === 'card' ? 'card' : 'receipt'
                                }
                                size={20} 
                                color={
                                  txn.type === 'topup' ? '#16a34a' : 
                                  txn.type === 'bus' ? '#2563eb' :
                                  txn.type === 'card' ? '#7c3aed' : '#6b7280'
                                } 
                              />
                            </View>

                            {/* Transaction Details */}
                            <View className="flex-1">
                              <Text style={{ color: colors.text }} className="font-semibold text-base mb-1">
                                {title}
                              </Text>
                              <Text style={{ color: colors.subtext }} className="text-sm mb-1">
                                {body}
                              </Text>
                              <Text style={{ color: colors.subtext }} className="text-xs">
                                {new Date(txn.timestamp).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </Text>
                            </View>

                            {/* Amount and Arrow */}
                            <View className="items-end">
                              <Text 
                                className={`font-bold text-lg ${
                                  txn.type === 'topup' ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {amount}
                              </Text>
                              <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
                            </View>
                          </View>
                        </Pressable>

                        {/* Divider */}
                        {idx < group.transactions.length - 1 && (
                          <View className="border-b border-gray-100 mx-4" />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}