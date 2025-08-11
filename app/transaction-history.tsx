import TransactionItem from '@/components/TransactionItem';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { getAuthData } from '@/utils/auth';
import { getTransactions } from '@/api/fetchUserTransactions';
import { FontAwesome5 } from '@expo/vector-icons';
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

  const fetchUserTransactions = async () => {
    try {
      const { uid } = await getAuthData();
      if (!uid) return;

      const txns = await getTransactions({ fromUser: uid });
      setTransactions(txns);
      setAllTransactions(txns);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setTransactions(allTransactions);
      return;
    }

    const q = searchQuery.toLowerCase();
    const filtered = allTransactions.filter(
      (txn) =>
        txn.type.toLowerCase().includes(q) ||
        String(txn.amount).toLowerCase().includes(q) ||
        new Date(txn.timestamp).toLocaleDateString().includes(q)
    );

    setTransactions(filtered);
  };

  useEffect(() => {
    fetchUserTransactions();
  }, []);

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1 px-4 pt-4">
      {/* Header */}
      <View className="flex-row items-center justify-start mb-4 relative">
        <TouchableOpacity onPress={() => router.back()} className="z-10">
          <FontAwesome5 name="arrow-left" size={20} color={colors.highlight} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-2xl font-bold absolute left-1/2 -translate-x-1/2">
          Transactions
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="pt-2 pb-6">
          {transactions.length === 0 ? (
            <Text style={{ color: colors.text }} className="text-center mt-10 text-lg">
              No transactions found...
            </Text>
          ) : (
            transactions.map((txn, idx) => (
              <Pressable
                key={idx}
                onPress={() =>
                  router.push({
                    pathname: '/receipt',
                    params: {
                      id: txn.id || txn._id,
                      refId: txn.refId || txn.referenceId || '',
                      title: txn.type === 'topup' ? 'Wallet Top-up' : txn.type === 'bus' ? 'Fare Payment' : 'Card Payment',
                      body:
                        txn.type === 'topup'
                          ? `Added ₱${txn.amount} to wallet`
                          : txn.type === 'bus'
                          ? 'Paid fare'
                          : 'Paid for card',
                      date: new Date(txn.timestamp).toLocaleDateString(),
                      time: new Date(txn.timestamp).toLocaleTimeString(),
                      amount: `${txn.type === 'topup' ? '+' : '-'}₱${txn.amount}`,
                    },
                  })
                }
                android_ripple={{ color: '#ccc' }}
                className="mb-4 border-b border-gray-300 pb-2"
              >
                <TransactionItem
                  title={
                    txn.type === 'topup'
                      ? 'Wallet Top-up'
                      : txn.type === 'bus'
                      ? 'Fare Payment'
                      : 'Card Payment'
                  }
                  body={
                    txn.type === 'topup'
                      ? `Added ₱${txn.amount} to wallet`
                      : txn.type === 'bus'
                      ? 'Paid fare'
                      : 'Paid for card'
                  }
                  date={new Date(txn.timestamp).toLocaleDateString()}
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
