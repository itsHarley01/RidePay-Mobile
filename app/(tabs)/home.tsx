import Footer from '@/components/Footer';
import TransactionItem from '@/components/TransactionItem';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');

const banners = [
  require('@/assets/images/banner1.png'),
  require('@/assets/images/banner2.png'),
  require('@/assets/images/banner3.png'),
];

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const [showBalance, setShowBalance] = useState(true);
  const balance = 1234.56;
  

  const sampleTransactions = [
    {
      title: 'Fare',
      body: 'Successfully paid bus fare',
      date: '6/27/2025',
      amount: '-₱50',
    },
    {
      title: 'Top-up',
      body: 'Added funds to RidePay wallet',
      date: '6/25/2025',
      amount: '+₱200',
    },
    {
      title: 'Fare',
      body: 'Successfully paid jeepney fare',
      date: '6/24/2025',
      amount: '-₱20',
    },
    {
      title: 'Fare',
      body: 'Successfully paid tricycle fare',
      date: '6/23/2025',
      amount: '-₱30',
    },
    {
      title: 'Top-up',
      body: 'Added funds to RidePay wallet',
      date: '6/22/2025',
      amount: '+₱150',
    },
  ];

  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Balance Container */}
        <View className="bg-[#0A2A54] rounded-xl p-4 mb-6 elevation-lg  ">
          {/* Top Row: Balance + Eye */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-col">
              <Text className="text-white text-4xl font-bold">
                {showBalance ? `₱${balance.toFixed(2)}` : '***.**'}
              </Text>
              <Text className="text-white text-base font-semibold">RidePay Balance</Text>
            </View>

            <TouchableOpacity onPress={() => setShowBalance(!showBalance)} className='mb-auto'>
              <Ionicons name={showBalance ? 'eye' : 'eye-off'} size={21} color="white" />
            </TouchableOpacity>
          </View>

          {/* Top-up Button */}
          <View className="flex-row mb-2">
            <Text className="text-white text-2xl font-semibold text-center mt-auto">John Harley Aparece</Text>
              <TouchableOpacity
                className="bg-yellow-500 px-4 py-2 rounded ml-auto"
                onPress={() => router.push('/topup')}
              >
                <Text className="text-[#0A2A54] font-semibold text-lg">Top-up</Text>
              </TouchableOpacity>
          </View>
        </View>

        {/* Map Placeholder */}
        <TouchableOpacity
           onPress={() => router.push('/locations/map')}
           activeOpacity={0.9}
           className="mx-4 mb-6 rounded-xl overflow-hidden"
         >
           <View className="flex h-60 bg-gray-200 items-center justify-center shadow-md elevation-lg">
             <Image
               source={require('@/assets/images/map1.jpg')}
               className="w-full h-full"
               resizeMode="cover"
             />
           </View>
        </TouchableOpacity>

        {/* Carousel Section */}
        <View className="mb-6">
          <Carousel
            loop
            width={width - 32}
            height={120}
            autoPlay
            autoPlayInterval={3000}
            data={banners}
            scrollAnimationDuration={1000}
            renderItem={({ item }) => (
              <View className="rounded-xl overflow-hidden w-full h-full">
                <Image
                  source={item}
                  resizeMode="cover"
                  className="w-full h-full"
                />
              </View>
            )}
          />
        </View>

        {/* Transactions Section */}
        <View style={{ backgroundColor: colors.secondaryBackground }} className="p-4 elevation-md shadow-sm mx-5 rounded-lg mb-20">
          <View className="flex-row justify-between items-center mb-6">
            <Text style={{ color: colors.subtext }} className="text-xl font-bold">Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/transaction-history')}>
              <Text style={{ color: colors.highlight }} className="text-lg font-medium">See all</Text>
            </TouchableOpacity>
          </View>

          {/* Last 5 Transactions */}
          {sampleTransactions.map((txn, idx) => (
            <View key={idx}>
              <TransactionItem
                title={txn.title}
                body={txn.body}
                date={txn.date}
                amount={txn.amount}
              />
              {idx < sampleTransactions.length - 1 && (
                <View className="border border-gray-200 my-2" />
              )}
            </View>
          ))}
        </View>

        <View className='mb-32'>
          <Footer/>
        </View>
      </ScrollView>
    </View>
  );
}
