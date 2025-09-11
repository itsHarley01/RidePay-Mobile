import MarkerInfoModal from '@/components/MarkerInfoModal';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import mapStyle from '../../assets/map/mapStyle.json';

export default function BusRoutes() {
  const router = useRouter();
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

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
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
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
      </MapView>

      {/* Locate Me Button */}
      <TouchableOpacity
        className={`absolute ${selectedRoute ? 'bottom-[30%]' : 'bottom-5'} right-5 bg-yellow-500 p-3 rounded-full shadow z-10 w-16 h-16 justify-center items-center`}
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

      {/* Route Info Modal */}
      {selectedRoute && (
  <MarkerInfoModal
    type="route"
    marker={{ title: selectedRoute.name }}
    onClose={() => setSelectedRoute(null)}
    routeDetails={{
      from: selectedRoute.start,
      to: selectedRoute.end,
      totalDistance: (
        selectedRoute.coordinates.length * 1.5 // Simulate distance (adjust as needed)
      ).toFixed(1),
      estimatedTime: `${selectedRoute.coordinates.length * 5} mins`, // Simulate ETA
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
