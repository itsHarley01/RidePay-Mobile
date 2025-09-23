import { fetchUserDataByUid } from '@/api/fetchUserDataApi';
import { getTransactions } from '@/api/fetchUserTransactions';
import { getPromos, Promo } from '@/api/promoApi';
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

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [userData, setUserData] = useState<{ firstName: string, middleName: string, lastName: string, balance: number } | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [banners, setBanners] = useState<string[]>([]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const { uid } = await getAuthData();

      if (uid) {
        const user = await fetchUserDataByUid(uid);
        const txns = await getTransactions({ fromUser: uid });

        setUserData({
          firstName: user.firstName,
          middleName: user.middleName,
          lastName: user.lastName,
          balance: user.balance ?? 0,
        });

        setTransactions(txns);
      }
    } catch (err) {
      console.error('Failed to fetch user or transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPromos = async () => {
    try {
      const promos: Promo[] = await getPromos();
      const photos = promos
        .map((promo) => promo.photo)
        .filter((photo): photo is string => !!photo);
      setBanners(photos);
    } catch (err) {
      console.error('Failed to fetch promos:', err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchPromos();
    const interval = setInterval(async () => {
      try {
        const { uid } = await getAuthData();
        if (uid) {
          const txns = await getTransactions({ fromUser: uid });
          setTransactions(txns);
          const user = await fetchUserDataByUid(uid);
          setUserData({
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            balance: user.balance ?? 0,
          });
        }
      } catch (err) {
        console.error('Error fetching latest transactions:', err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUser(), fetchPromos()]);
    setRefreshing(false);
  };

  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={colors.highlight ? [colors.highlight] : undefined}
          />
        }
      >
        {/* Header Spacing */}
        <View className="h-4" />

        {/* Balance Card - Cleaner Design */}
        <View className="mx-6 mb-8">
          <View 
            style={{ backgroundColor: '#0A2A54' }}
            className="rounded-2xl p-6 border border-gray-700 shadow-lg"
          >
           {/* User Greeting */}
            <View className="mb-6">
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="text-lg font-medium">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
              </Text>
              <Text style={{ color: 'white' }} className="text-2xl font-bold mt-1">
                {userData ? `${userData.firstName} ${userData.middleName} ${userData.lastName}` : 'Welcome back'}
              </Text>
            </View>

             {/* Balance Section */}
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-1">
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="text-sm font-medium mb-2">
                  Available Balance
                </Text>
                <Text style={{ color: 'white' }} className="text-3xl font-bold">
                  {showBalance
                    ? `₱${(userData?.balance ?? 0).toFixed(2)}`
                    : '₱••••••'}
                </Text>
              </View>
              
              <TouchableOpacity 
                onPress={() => setShowBalance(!showBalance)}
                className="p-3 rounded-xl"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <Ionicons 
                  name={showBalance ? 'eye' : 'eye-off'} 
                  size={20} 
                  color="rgba(255, 255, 255, 0.7)" 
                />
              </TouchableOpacity>
            </View>

            {/* Top-up Button */}
            <TouchableOpacity
              onPress={() => router.push('/topup')}
              className="bg-yellow-400 rounded-xl p-4 flex-row items-center justify-center"   
            >
              <Ionicons name="add" size={20} color="black" />
              <Text className="text-black font-semibold text-lg ml-2">Top up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mx-6 mb-8">
          <View className="flex-row justify-between">
            <TouchableOpacity 
              onPress={() => router.push('/locations/map')}
              className="flex-1 mr-3 p-4 rounded-xl border border-gray-200"
              style={{ backgroundColor: colors.secondaryBackground }}
            >
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-3">
                  <Ionicons name="location" size={24} color="#2563eb" />
                </View>
                <Text style={{ color: colors.text }} className="font-medium">Find Routes</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/transaction-history')}
              className="flex-1 ml-3 p-4 rounded-xl border border-gray-200"
              style={{ backgroundColor: colors.secondaryBackground }}
            >
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mb-3">
                  <Ionicons name="receipt" size={24} color="#16a34a" />
                </View>
                <Text style={{ color: colors.text }} className="font-medium">History</Text>
              </View>
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

        {/* Promotions Carousel */}
        {banners.length > 0 && (
          <View className="mb-8">
            <View className="mx-6 mb-4">
              <Text style={{ color: colors.text }} className="text-xl font-bold">
                Promotions
              </Text>
            </View>
            <Carousel
              loop
              width={width - 48}
              height={140}
              autoPlay
              autoPlayInterval={4000}
              data={banners}
              scrollAnimationDuration={800}
              style={{ marginLeft: 24 }}
              renderItem={({ item }) => (
                <View className="rounded-2xl overflow-hidden mr-4 border border-gray-200">
                  <Image
                    source={typeof item === 'string' ? { uri: item } : item}
                    resizeMode="cover"
                    className="w-full h-full"
                  />
                </View>
              )}
            />
          </View>
        )}

        {/* Recent Transactions */}
        <View className="mx-6 mb-8">
          <View className="flex-row justify-between items-center mb-6">
            <Text style={{ color: colors.text }} className="text-xl font-bold">
              Recent Activity
            </Text>
            <TouchableOpacity onPress={() => router.push('/transaction-history')}>
              <Text className="text-blue-600 font-medium">View all</Text>
            </TouchableOpacity>
          </View>

          <View 
            style={{ backgroundColor: colors.secondaryBackground }}
            className="rounded-2xl p-4 border border-gray-100"
          >
            {transactions.length === 0 ? (
              <View className="items-center py-8">
                <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                  <Ionicons name="receipt-outline" size={32} color="#6b7280" />
                </View>
                <Text style={{ color: colors.subtext }} className="text-base text-center">
                  No recent transactions
                </Text>
                <Text style={{ color: colors.subtext }} className="text-sm text-center opacity-70 mt-1">
                  Your transaction history will appear here
                </Text>
              </View>
            ) : (
              <View>
                {transactions
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .slice(0, 4)
                  .map((txn, idx) => (
                    <View key={txn._id || idx}>
                      <View className="flex-row items-center py-4">
                        <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
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
                        
                        <View className="flex-1">
                          <Text style={{ color: colors.text }} className="font-medium text-base">
                            {txn.type === 'topup' ? 'Wallet Top-up' :
                             txn.type === 'bus' ? 'Bus Fare Payment' :
                             txn.type === 'card' ? 'Card Purchase' : 'Transaction'}
                          </Text>
                          <Text style={{ color: colors.subtext }} className="text-sm mt-1">
                            {new Date(txn.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </Text>
                        </View>
                        
                        <Text 
                          className={`font-bold text-base ${
                            txn.type === 'topup' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {txn.type === 'topup' ? '+' : '-'}₱{txn.amount}
                        </Text>
                      </View>
                      
                      {idx < Math.min(transactions.length, 4) - 1 && (
                        <View className="border-b border-gray-100" />
                      )}
                    </View>
                  ))
                }
              </View>
            )}
          </View>
        </View>

        <View className="mx-6">
          <Footer />
        </View>
      </ScrollView>
    </View>
  );
}