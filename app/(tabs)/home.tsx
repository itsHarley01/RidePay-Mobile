import { fetchUserDataByUid } from '@/api/fetchUserDataApi';
import { getTransactions } from '@/api/fetchUserTransactions';
import Footer from '@/components/Footer';
import TransactionItem from '@/components/TransactionItem';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { getAuthData } from '@/utils/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
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
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [userData, setUserData] = useState<{ firstName: string, lastName: string, balance: number } | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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


  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
  };

  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1">
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={colors.highlight ? [colors.highlight] : undefined}
          />
        }
      >
        {/* Balance Container */}
        <View className="bg-[#0A2A54] rounded-xl p-4 mb-6 elevation-lg">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-col">
              <Text className="text-white text-4xl font-bold">
                {showBalance
                  ? `₱${(userData?.balance ?? 0).toFixed(2)}`
                  : '***.**'}
              </Text>
              <Text className="text-white text-base font-semibold">RidePay Balance</Text>
            </View>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)} className="mb-auto">
              <Ionicons name={showBalance ? 'eye' : 'eye-off'} size={21} color="white" />
            </TouchableOpacity>
          </View>

          <View className="flex-row mb-2">
            <Text className="text-white text-2xl font-semibold text-center mt-auto">
              {userData
                ? `${userData.firstName} ${userData.lastName}`
                : 'Loading...'}
            </Text>
            <TouchableOpacity
              className="bg-yellow-500 px-4 py-2 rounded ml-auto"
              onPress={() => router.push('/topup')}
            >
              <Text className="text-[#0A2A54] font-semibold text-lg">Top-up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Interactive Map */}
        <View className="mx-4 mb-6 rounded-xl overflow-hidden">
          <MapView
            style={{ width: '100%', height: 240 }}
            className="rounded-xl"
            initialRegion={{
              latitude: 14.5995,
              longitude: 120.9842,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation
            showsMyLocationButton
            loadingEnabled
            onPress={() => router.push('/locations/map')}
          >
            <Marker
              coordinate={{ latitude: 14.5995, longitude: 120.9842 }}
              title="Your Location"
              description="You are here"
            />
          </MapView>
        </View>

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
            <Text style={{ color: colors.subtext }} className="text-xl font-bold">
              Transactions
            </Text>
            <TouchableOpacity onPress={() => router.push('/transaction-history')}>
              <Text style={{ color: colors.highlight ?? '#FFD700' }} className="text-lg font-medium">
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {/* Render Transactions */}
          {transactions.length === 0 ? (
  <Text style={{ color: colors.text }} className="text-center text-base italic">
    No recent transactions.
  </Text>
) : (
  transactions
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  .slice(0, 5) // optional: get the latest 5
  .map((txn, idx) => (
    <View key={txn._id || idx}>
      <TransactionItem
        title={txn.type}
        body={
          txn.type === 'topup'
            ? `Added ₱${txn.amount} to wallet`
            : txn.type === 'bus'
            ? 'Paid fare for bus'
            : txn.type === 'card'
            ? 'Successfully bought card'
            : 'Transaction'
        }
        date={new Date(txn.timestamp).toLocaleString()}
        amount={`${txn.type === 'topup' ? '+' : '-'}₱${txn.amount}`}
      />
      {idx < Math.min(transactions.length, 5) - 1 && (
        <View className="border border-gray-200 my-2" />
      )}
    </View>
  ))
)}
        </View>

        <View className="mb-32">
          <Footer />
        </View>
      </ScrollView>
    </View>
  );
}