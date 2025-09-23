import TransactionItem from '@/components/TransactionItem';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { getAuthData } from '@/utils/auth';
import { getTransactions } from '@/api/fetchUserTransactions';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransactionHistoryPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [transactions, setTransactions] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUserTransactions = async () => {
    try {
      setLoading(true);
      const { uid } = await getAuthData();
      if (!uid) return;

      const txns = await getTransactions({ fromUser: uid });
      setTransactions(txns);
      setAllTransactions(txns);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setTransactions(allTransactions);
      return;
    }

    const q = query.toLowerCase().trim();
    const filtered = allTransactions.filter((txn) => {
      // Get transaction title for search
      const title = txn.type === 'topup'
        ? 'Wallet Top-up'
        : txn.type === 'bus'
        ? 'Bus Fare Payment'
        : txn.type === 'card'
        ? 'Card Purchase'
        : 'Transaction';

      // Get transaction description for search
      const description = txn.type === 'topup'
        ? `Added ₱${txn.amount} to wallet`
        : txn.type === 'bus'
        ? 'Paid fare for bus ride'
        : txn.type === 'card'
        ? 'Successfully purchased card'
        : 'Transaction completed';

      // Format date for search
      const dateString = new Date(txn.timestamp).toLocaleDateString();
      const timeString = new Date(txn.timestamp).toLocaleTimeString();

      // Search in multiple fields
      return (
        title.toLowerCase().includes(q) ||
        description.toLowerCase().includes(q) ||
        txn.type.toLowerCase().includes(q) ||
        String(txn.amount).includes(q) ||
        dateString.includes(q) ||
        timeString.toLowerCase().includes(q) ||
        (txn.refId && txn.refId.toLowerCase().includes(q)) ||
        (txn.referenceId && txn.referenceId.toLowerCase().includes(q))
      );
    });

    setTransactions(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setTransactions(allTransactions);
  };

  const groupTransactionsByDate = (transactions: any[]) => {
    const grouped = transactions.reduce((groups: { [key: string]: any[] }, transaction) => {
      const date = new Date(transaction.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {});

    // Sort dates in descending order
    const sortedDates = Object.keys(grouped).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    return sortedDates.map(date => ({
      date,
      transactions: grouped[date].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    }));
  };

  useEffect(() => {
    fetchUserTransactions();
  }, []);

  // Real-time search effect
  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, allTransactions]);

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

      {/* Search Results Info */}
      {searchQuery.length > 0 && (
        <View className="px-6 pb-2">
          <Text style={{ color: colors.subtext }} className="text-sm">
            {transactions.length} result{transactions.length !== 1 ? 's' : ''} found for "{searchQuery}"
          </Text>
        </View>
      )}

      {/* Transaction List */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6"
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
                    const title =
                      txn.type === 'topup'
                        ? 'Wallet Top-up'
                        : txn.type === 'bus'
                        ? 'Bus Fare Payment'
                        : txn.type === 'card'
                        ? 'Card Purchase'
                        : 'Transaction';

                    const body =
                      txn.type === 'topup'
                        ? `Added ₱${txn.amount} to wallet`
                        : txn.type === 'bus'
                        ? 'Paid fare for bus ride'
                        : txn.type === 'card'
                        ? 'Successfully purchased card'
                        : 'Transaction completed';

                    const amount = `${txn.type === 'topup' ? '+' : '-'}₱${txn.amount}`;

                    return (
                      <View key={txn.id || txn._id || `${txn.refId || txn.referenceId}-${idx}`}>
                        <Pressable
                          onPress={() =>
                            router.push({
                              pathname: '/receipt',
                              params: {
                                id: txn.id || txn._id,
                                refId: txn.refId || txn.referenceId || '',
                                title,
                                body,
                                date: new Date(txn.timestamp).toLocaleDateString(),
                                time: new Date(txn.timestamp).toLocaleTimeString(),
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
                                txn.type === 'topup' ? 'bg-green-100' : 'bg-red-100'
                              }`}
                            >
                              <Ionicons 
                                name={
                                  txn.type === 'topup' ? 'wallet' : 
                                  txn.type === 'bus' ? 'bus' :
                                  txn.type === 'card' ? 'card' : 'receipt'
                                }
                                size={20} 
                                color={txn.type === 'topup' ? '#16a34a' : '#dc2626'} 
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

                            {/* Amount */}
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