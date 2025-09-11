import MarkerInfoModal from '@/components/MarkerInfoModal'; // Adjust path as needed
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { getDistance } from 'geolib';
import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import mapStyle from '../../assets/map/mapStyle.json';

export default function TopupLocations() {
  const router = useRouter();
  const mapRef = useRef(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

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

  const markers = [
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
          latitude: 10.3185,
          longitude: 123.9075,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={() => setSelectedMarker(null)} // Dismiss  on map tap
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            onPress={() => setSelectedMarker(marker)}
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
      </MapView>

      {/* Locate Me Button */}
      <TouchableOpacity
        className={`absolute ${
          selectedMarker ? 'bottom-[30%]' : 'bottom-5'
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

      {/* Modal */}
      {selectedMarker && (
        <MarkerInfoModal
          type="topup"
          marker={selectedMarker}
          distance={
            userLocation
              ? (getDistance(userLocation, selectedMarker.coordinate) / 1000).toFixed(2)
              : '...'
          }
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
