import MarkerInfoModal from '@/components/MarkerInfoModal'; // Adjust path if needed
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import mapStyle from '../../assets/map/mapStyle.json';

export default function LiveBus() {
  const router = useRouter();
  const mapRef = useRef(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const busRoute = [
  { latitude: 10.3157, longitude: 123.8854 }, // Starting point (e.g., Bus 1 location)
  { latitude: 10.3165, longitude: 123.8880 }, // Intermediate stop
  { latitude: 10.3172, longitude: 123.8900 }, // Intermediate stop
  { latitude: 10.3180, longitude: 123.8925 }, // Destination or station
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

  const busMarker = {
    id: 'bus-1',
    title: 'Bus 1',
    description: 'Current location of the bus',
    coordinate: { latitude: 10.3157, longitude: 123.8854 },
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
        onPress={() => setSelectedMarker(null)} // Dismiss on map tap
      >

        <Polyline
          coordinates={busRoute}
          strokeColor="#facc15" // Tailwind yellow-400
          strokeWidth={4}
        />
              
        <Marker
          coordinate={busMarker.coordinate}
          title={busMarker.title}
          description={busMarker.description}
          onPress={() => setSelectedMarker(busMarker)}
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
        className={`absolute ${selectedMarker ? 'bottom-[30%]' : 'bottom-5'} right-5 bg-yellow-500 p-3 rounded-full shadow z-10 w-16 h-16 justify-center items-center`}
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
            title: 'Bus 301',
            description: 'Currently en route',
          }}
          distance="1.2"
          onClose={() => setSelectedMarker(null)}
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
