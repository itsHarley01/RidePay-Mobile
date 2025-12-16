import MarkerInfoModal from '@/components/MarkerInfoModal';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import mapStyle from '../../assets/map/mapStyle.json';

// 👉 IMPORT YOUR API FUNCTION
import { getBusDetails } from '@/api/busDetails';

export default function LiveBus() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);

  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<any>(null);

  // 👉 NEW STATE
  const [busDetails, setBusDetails] = useState<any>(null);
  const [loadingBus, setLoadingBus] = useState(false);

  const busRoute = [
    { latitude: 10.3157, longitude: 123.8854 },
    { latitude: 10.3165, longitude: 123.888 },
    { latitude: 10.3172, longitude: 123.89 },
    { latitude: 10.318, longitude: 123.8925 },
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

  // 👉 TEMP STATIC BUS (later this will come from Firebase list)
  const busMarker = {
    id: 'BUS_301', // 👈 THIS IS THE busId
    title: 'Bus 301',
    description: 'Current location of the bus',
    coordinate: { latitude: 10.3157, longitude: 123.8854 },
  };

  // 👉 Fetch bus details when marker is pressed
  const handleBusPress = async () => {
    setSelectedMarker(busMarker);
    setLoadingBus(true);

    try {
      const data = await getBusDetails(busMarker.id);
      setBusDetails(data);
    } catch (error) {
      console.error('Failed to fetch bus details:', error);
    } finally {
      setLoadingBus(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 left-5 bg-black/60 px-4 py-2 w-12 h-12 rounded-full z-10 justify-center items-center"
      >
        <FontAwesome5 name="arrow-left" size={20} color="white" />
      </TouchableOpacity>

      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={mapStyle}
        initialRegion={{
          latitude: 10.3157,
          longitude: 123.8854,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={() => {
          setSelectedMarker(null);
          setBusDetails(null);
        }}
      >
        <Polyline
          coordinates={busRoute}
          strokeColor="#facc15"
          strokeWidth={4}
        />

        <Marker
          coordinate={busMarker.coordinate}
          title={busMarker.title}
          description={busMarker.description}
          onPress={handleBusPress}
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

      {/* Locate Me Button */}
      <TouchableOpacity
        className={`absolute ${
          selectedMarker ? 'bottom-[35%]' : 'bottom-5'
        } right-5 bg-yellow-500 p-3 rounded-full shadow z-10 w-16 h-16 justify-center items-center`}
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
        <FontAwesome5 name="location-arrow" size={25} color="#333" />
      </TouchableOpacity>

      {/* Marker Info Modal */}
      {selectedMarker && (
        <MarkerInfoModal
          type="bus"
          marker={{
            title: busMarker.title,
            description: busMarker.description,
          }}
          distance="1.2"
          busDetails={busDetails} // 👈 HERE IT IS
          onClose={() => {
            setSelectedMarker(null);
            setBusDetails(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
