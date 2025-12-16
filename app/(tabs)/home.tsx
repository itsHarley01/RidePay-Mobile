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
import { useEffect, useState, useRef } from 'react';
import {
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'; 
import MapView, { Marker, Polyline } from 'react-native-maps';
import MarkerInfoModal from '@/components/MarkerInfoModal';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Carousel from 'react-native-reanimated-carousel';
import { getDistance } from 'geolib';

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
  const mapRef = useRef<MapView | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [selectedTerminal, setSelectedTerminal] = useState<any | null>(null);
  const [selectedTopup, setSelectedTopup] = useState<any | null>(null);

  const topupStations = [
  {
    id: '1',
    title: 'Top-up Station 1',
    description: 'Ayala Center Cebu',
    coordinate: { latitude: 10.3173, longitude: 123.9058 },
  },
  {
    id: '2',
    title: 'Top-up Station 2',
    description: 'SM City Cebu',
    coordinate: { latitude: 10.3246, longitude: 123.9221 },
  },
  {
    id: '3',
    title: 'Top-up Station 3',
    description: 'IT Park Cebu',
    coordinate: { latitude: 10.3282, longitude: 123.9080 },
  },
  {
    id: '4',
    title: 'Top-up Station 4',
    description: 'Fuente Osmeña Circle',
    coordinate: { latitude: 10.3100, longitude: 123.8910 },
  },
];


  const terminals = [
  {
    id: 1,
    title: 'North Bus Terminal',
    coordinate: { latitude: 10.3284, longitude: 123.9043 },
  },
  {
    id: 2,
    title: 'South Bus Terminal',
    coordinate: { latitude: 10.3006, longitude: 123.8807 },
  },
  {
    id: 3,
    title: 'Colon Terminal',
    coordinate: { latitude: 10.2935, longitude: 123.9012 },
  },
  {
    id: 4,
    title: 'Talamban Terminal',
    coordinate: { latitude: 10.3598, longitude: 123.9132 },
  },
  {
    id: 5,
    title: 'Lahug Terminal',
    coordinate: { latitude: 10.3260, longitude: 123.8912 },
  },
  {
    id: 6,
    title: 'Ayala Terminal',
    coordinate: { latitude: 10.3170, longitude: 123.9050 },
  },
];

  useEffect(() => {
  (async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const location = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  })();
}, []);

// Bus routes definition
const routes = [
  {
    id: 'route1',
    name: 'Route 1',
    start: 'Colon St.',
    end: 'IT Park',
    coordinates: [
      { latitude: 10.3100, longitude: 123.8800 },
      { latitude: 10.3157, longitude: 123.8854 },
      { latitude: 10.3200, longitude: 123.8900 },
      { latitude: 10.3250, longitude: 123.8950 },
    ],
    strokeColor: '#1E90FF',
  },
  {
    id: 'route2',
    name: 'Route 2',
    start: 'SRP',
    end: 'Banilad',
    coordinates: [
      { latitude: 10.3000, longitude: 123.8700 },
      { latitude: 10.3050, longitude: 123.8750 },
      { latitude: 10.3100, longitude: 123.8800 },
      { latitude: 10.3150, longitude: 123.8900 },
      { latitude: 10.3200, longitude: 123.9000 },
    ],
    strokeColor: '#32CD32',
  },
];


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
        {/* Interactive Map with Bus Routes + Live Bus */}
<View className="mx-4 mb-6 rounded-xl overflow-hidden">
  <MapView
    ref={mapRef}
    
    style={{ width: '100%', height: 240 }}
    className="rounded-xl"
    initialRegion={{
      latitude: 10.3157,
      longitude: 123.8854,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    }}
    showsUserLocation
    showsMyLocationButton={false}
    loadingEnabled
    onPress={() => router.push('/locations/map')}
  >
    {/* User location marker */}
    {userLocation && (
      <Marker
        coordinate={userLocation}
        title="Your Location"
        description="You are here"
      />
    )}

    {/* Bus routes (tappable polylines) */}
    {routes.map((route) => (
      <Polyline
        key={route.id}
        coordinates={route.coordinates}
        strokeColor={route.strokeColor}
        strokeWidth={5}
        tappable
        onPress={() => setSelectedRoute(route)}
      />
    ))}

    {/* Terminals */}
{terminals.map((terminal) => (
  <Marker
    key={terminal.id}
    coordinate={terminal.coordinate}
    title={terminal.title}
    description="Bus terminal"
    onPress={() => setSelectedTerminal(terminal)}
  >
    <View className="w-10 h-10">
      <Image
        source={require('../../assets/map/terminal-pin.png')}
        className="w-full h-full"
        resizeMode="contain"
      />
    </View>
  </Marker>
))}

{/* Top-up Stations */}
{topupStations.map((station) => (
  <Marker
    key={station.id}
    coordinate={station.coordinate}
    title={station.title}
    description={station.description}
    onPress={() => setSelectedTopup(station)}
  >
    <View className="w-10 h-10">
      <Image
        source={require('../../assets/map/station-pin.png')}
        className="w-full h-full"
        resizeMode="contain"
      />
    </View>
  </Marker>
))}


    {/* Live Bus Route polyline */}
    <Polyline
      coordinates={[
        { latitude: 10.3157, longitude: 123.8854 },
        { latitude: 10.3165, longitude: 123.8880 },
        { latitude: 10.3172, longitude: 123.8900 },
        { latitude: 10.3180, longitude: 123.8925 },
      ]}
      strokeColor="#facc15" // yellow
      strokeWidth={4}
    />

    {/* Live Bus Marker */}
    <Marker
      coordinate={{ latitude: 10.3157, longitude: 123.8854 }}
      title="Bus 1"
      description="Current location of the bus"
      onPress={() =>
        setSelectedMarker({
          id: 'bus-1',
          title: 'Bus 301',
          description: 'Currently en route',
        })
      }
    >
      <View className="w-10 h-10">
        <Image
          source={require('../../assets/map/bus-pin.png')}
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>
    </Marker>
  </MapView>

  {/* Locate Me Button - Fixed position in top-right corner */}
  <TouchableOpacity
    className="absolute top-3 right-3 bg-yellow-500 p-3 rounded-full shadow z-10 w-12 h-12 justify-center items-center"
    onPress={() => {
      if (userLocation) {
        mapRef.current?.animateToRegion({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    }}
  >
    <FontAwesome5 name="location-arrow" size={16} color="#333" />
  </TouchableOpacity>

  {/* Route Info Modal - Smaller and positioned at bottom */}
  {selectedRoute && (
    <View className="absolute bottom-3 left-3 right-3 bg-white rounded-xl shadow-lg border border-gray-200 p-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-bold text-base text-gray-800">{selectedRoute.name}</Text>
        <TouchableOpacity onPress={() => setSelectedRoute(null)} className="p-1">
          <Ionicons name="close" size={18} color="#666" />
        </TouchableOpacity>
      </View>
      <Text className="text-sm text-gray-600 mb-2">
        {selectedRoute.start} → {selectedRoute.end}
      </Text>
      <View className="flex-row justify-between">
        <View className="flex-1">
          <Text className="text-xs text-gray-500">Distance</Text>
          <Text className="text-sm font-medium">{(selectedRoute.coordinates.length * 1.5).toFixed(1)} km</Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-gray-500">Est. Time</Text>
          <Text className="text-sm font-medium">{selectedRoute.coordinates.length * 5} mins</Text>
        </View>
      </View>
    </View>
  )}

  {/* Live Bus Modal - Smaller and positioned at bottom */}
  {selectedMarker && (
    <View className="absolute bottom-3 left-3 right-3 bg-white rounded-xl shadow-lg border border-gray-200 p-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-bold text-base text-gray-800">{selectedMarker.title}</Text>
        <TouchableOpacity onPress={() => setSelectedMarker(null)} className="p-1">
          <Ionicons name="close" size={18} color="#666" />
        </TouchableOpacity>
      </View>
      <Text className="text-sm text-gray-600 mb-2">{selectedMarker.description}</Text>
      <View className="flex-row items-center">
        <Ionicons name="location" size={14} color="#666" />
        <Text className="text-sm text-gray-600 ml-1">1.2 km away</Text>
      </View>
    </View>
  )}

  {/* Terminal Info Modal - Smaller and positioned at bottom */}
  {selectedTerminal && (
    <View className="absolute bottom-3 left-3 right-3 bg-white rounded-xl shadow-lg border border-gray-200 p-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-bold text-base text-gray-800">{selectedTerminal.title}</Text>
        <TouchableOpacity onPress={() => setSelectedTerminal(null)} className="p-1">
          <Ionicons name="close" size={18} color="#666" />
        </TouchableOpacity>
      </View>
      <Text className="text-sm text-gray-600 mb-2">Bus terminal servicing local routes</Text>
      <View className="flex-row justify-between">
        <View className="flex-1">
          <Text className="text-xs text-gray-500">Terminal Code</Text>
          <Text className="text-sm font-medium">TERM-{selectedTerminal.id.toString().padStart(3, '0')}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-gray-500">Status</Text>
          <Text className="text-sm font-medium text-green-600">Active</Text>
        </View>
      </View>
    </View>
  )}

  {/* Top-up Info Modal - Smaller and positioned at bottom */}
  {selectedTopup && (
    <View className="absolute bottom-3 left-3 right-3 bg-white rounded-xl shadow-lg border border-gray-200 p-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-bold text-base text-gray-800">{selectedTopup.title}</Text>
        <TouchableOpacity onPress={() => setSelectedTopup(null)} className="p-1">
          <Ionicons name="close" size={18} color="#666" />
        </TouchableOpacity>
      </View>
      <Text className="text-sm text-gray-600 mb-2">{selectedTopup.description}</Text>
      <View className="flex-row items-center">
        <Ionicons name="location" size={14} color="#666" />
        <Text className="text-sm text-gray-600 ml-1">
          {userLocation
            ? `${(getDistance(userLocation, selectedTopup.coordinate) / 1000).toFixed(2)} km away`
            : 'Distance calculating...'}
        </Text>
      </View>
    </View>
  )}
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