import { fetchBusRoutes } from '@/api/fetchLocations'; // adjust path if needed
import MarkerInfoModal from '@/components/MarkerInfoModal';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import mapStyle from '../../assets/map/mapStyle.json';

type MapRoute = {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  }[];
};

export default function BusRoutes() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [routes, setRoutes] = useState<MapRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<MapRoute | null>(null);

  /* ======================================================
     GET USER LOCATION
  ====================================================== */
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

  /* ======================================================
     FETCH ROUTES FROM FIREBASE
  ====================================================== */
  useEffect(() => {
    const loadRoutes = async () => {
      console.log('📡 Fetching bus routes from Firebase...');

      const fetchedRoutes = await fetchBusRoutes();

      console.log('✅ Raw routes:', fetchedRoutes);

      if (!fetchedRoutes.length) {
        console.warn('⚠️ No bus routes found');
        return;
      }

      const formattedRoutes: MapRoute[] = fetchedRoutes.map((route) => ({
        id: route.id,
        name: route.name,
        coordinates: route.pins.map((pin) => ({
          latitude: pin.lat,
          longitude: pin.long,
        })),
      }));

      console.log('🧭 Formatted routes:', formattedRoutes);

      setRoutes(formattedRoutes);
    };

    loadRoutes();
  }, []);

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
        onPress={() => setSelectedRoute(null)}
      >
        {routes.map((route) => (
          <Polyline
            key={route.id}
            coordinates={route.coordinates}
            strokeWidth={5}
            tappable
            onPress={() => {
              console.log('🟢 Route pressed:', route);
              setSelectedRoute(route);
            }}
          />
        ))}
      </MapView>

      {/* Locate Me Button */}
      <TouchableOpacity
        className={`absolute ${
          selectedRoute ? 'bottom-[30%]' : 'bottom-5'
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

      {/* Route Info Modal */}
      {selectedRoute && (
        <MarkerInfoModal
          type="route"
          marker={{ title: selectedRoute.name }}
          onClose={() => setSelectedRoute(null)}
          routeDetails={{
            from: 'Start Point',
            to: 'End Point',
            totalDistance: (
              selectedRoute.coordinates.length * 1.5
            ).toFixed(1),
            estimatedTime: `${selectedRoute.coordinates.length * 5} mins`,
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
