import TransactionItem from '@/components/TransactionItem';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Sample transactions data
const transactionsData = [
  {
    id: '1',
    refId: 'samplerefid1',
    title: 'Fare Payment',
    body: 'Paid fare to route 04L',
    date: '6/27/2025',
    time: '9:00 am',
    amount: '-₱29',
  },
  {
    id: '2',
    refId: 'samplerefid2',
    title: 'Wallet Top-up',
    body: 'Added ₱100 to wallet',
    date: '6/25/2025',
    time: '9:15 pm',
    amount: '+₱100',
  },
  {
    id: '3',
    refId: 'samplerefid3',
    title: 'Promo Discount',
    body: 'Discount applied on 06H route',
    date: '6/22/2025',
    time: '10:01 am',
    amount: '-₱10',
  },
  {
    id: '4',
    refId: 'samplerefid4',
    title: 'Fare Payment',
    body: 'Paid fare to route 12L',
    date: '6/20/2025',
    time: '7:30 am',
    amount: '-₱25',
  },
];

export default function TransactionHistoryPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const [transactions, setTransactions] = useState(transactionsData);
  const [searchQuery, setSearchQuery] = useState('');

  // Search filter
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setTransactions(transactionsData);
      return;
    }

    const q = searchQuery.toLowerCase();
    const filtered = transactionsData.filter(
      (txn) =>
        txn.title.toLowerCase().includes(q) ||
        txn.body.toLowerCase().includes(q) ||
        txn.date.toLowerCase().includes(q)
    );

    setTransactions(filtered);
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1 px-4">
      {/* Header */}
      <View className="mb-4">
        <Text style={{ color: colors.subtext }} className="text-2xl font-bold  text-left pl-2">
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
            <Text className="text-center text-gray-400 mt-10 text-lg">
              No transactions found...
            </Text>
          ) : (
            transactions.map((txn) => (
              <Pressable
                key={txn.id}
                onPress={() =>
                  router.push({
                    pathname: '/receipt',
                    params: {
                      id: txn.id,
                      refId: txn.refId,
                      title: txn.title,
                      body: txn.body,
                      date: txn.date,
                      time: txn.time,
                      amount: txn.amount,
                    },
                  })
                }
                android_ripple={{ color: '#ccc' }}
                className="mb-4 border-b border-gray-300 pb-2"
              >
                <TransactionItem
                  title={txn.title}
                  body={txn.body}
                  date={txn.date}
                  amount={txn.amount}
                />
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
