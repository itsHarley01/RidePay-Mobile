import { fetchStations } from '@/api/fetchLocations';
import MarkerInfoModal from '@/components/MarkerInfoModal';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { getDistance } from 'geolib';
import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import mapStyle from '../../assets/map/mapStyle.json';

import { getAllBusesWithLocation, getBusDetails } from '@/api/busDetails';

export default function LiveBus() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);

  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<any>(null);

  const [buses, setBuses] = useState<
    Array<{ busId: string; busName: string; lat: number | null; long: number | null }>
  >([]);
  const [busDetails, setBusDetails] = useState<any>(null);
  const [loadingBus, setLoadingBus] = useState(false);

  const busRoute = [
    { latitude: 10.3157, longitude: 123.8854 },
    { latitude: 10.3165, longitude: 123.888 },
    { latitude: 10.3172, longitude: 123.89 },
    { latitude: 10.318, longitude: 123.8925 },
  ];

  /* ---------------- USER LOCATION ---------------- */
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

  /* ---------------- FETCH ALL BUSES ---------------- */
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const allBuses = await getAllBusesWithLocation();
        setBuses(allBuses.filter((b) => b.lat != null && b.long != null));
      } catch (e) {
        console.error('🔥 Failed to fetch all buses:', e);
      }
    };

    fetchBuses();
  }, []);

  /* ---------------- FETCH SINGLE BUS DETAILS ---------------- */

const handleMarkerPress = async (busId: string) => {
  setSelectedMarker(busId);
  setLoadingBus(true);

  try {
    const data = await getBusDetails(busId);
    if (!data) {
      console.warn('⚠️ Bus not found for BUS_ID:', busId);
      return;
    }
    setBusDetails(data);

    // Animate map to bus location
    if (data.device?.lat != null && data.device?.long != null) {
      mapRef.current?.animateToRegion({
        latitude: data.device.lat,
        longitude: data.device.long,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }

    // ---------- NEW: Calculate ETA to nearest station ----------
    if (data.device?.lat != null && data.device?.long != null) {
      const stations = await fetchStations();

      if (stations.length > 0) {
        // Find nearest station
        let nearest = stations[0];
        let minDistance = getDistance(
          { latitude: data.device.lat, longitude: data.device.long },
          { latitude: nearest.lat, longitude: nearest.long }
        );

        stations.forEach((station) => {
          const dist = getDistance(
            { latitude: data.device.lat, longitude: data.device.long },
            { latitude: station.lat, longitude: station.long }
          );
          if (dist < minDistance) {
            minDistance = dist;
            nearest = station;
          }
        });

        // Distance in km
        const distanceKm = minDistance / 1000;

        // Bus speed in km/h (default 20 km/h if undefined)
        const speed = data.speed || 20; 
        const etaHours = distanceKm / speed;

        // Convert to minutes
        const etaMinutes = etaHours * 60;

        // Create range (±50%)
        const margin = 0.2;
        const etaMin = Math.floor(etaMinutes * (1 - margin));
        const etaMax = Math.ceil(etaMinutes * (1 + margin));

        const etaRange = `${etaMin} - ${etaMax} mins`;

        console.log(`🚏 Nearest station: ${nearest.name}, ETA: ${etaRange}`);

        // Save in busDetails so we can pass to MarkerInfoModal
        setBusDetails({ ...data, etaToNextStation: etaRange, nearestStation: nearest.name });
      }
    }
  } catch (e) {
    console.error('🔥 Failed to load bus details:', e);
  } finally {
    setLoadingBus(false);
  }
};


  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 left-5 bg-black/60 w-12 h-12 rounded-full z-10 justify-center items-center"
      >
        <FontAwesome5 name="arrow-left" size={20} color="white" />
      </TouchableOpacity>

      {/* Map */}
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
        onPress={() => setSelectedMarker(null)}
      >
        <Polyline coordinates={busRoute} strokeColor="#facc15" strokeWidth={4} />

        {/* All Bus Markers */}
        {buses.map((bus) => (
          <Marker
            key={bus.busId}
            coordinate={{ latitude: bus.lat!, longitude: bus.long! }}
            onPress={() => handleMarkerPress(bus.busId)}
          >
            <View className="w-10 h-10">
              <Image
                source={require('../../assets/map/bus-pin.png')}
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

      {/* BUS MODAL */}
      {selectedMarker && busDetails && (
       <MarkerInfoModal
  type="bus"
  marker={{
    title: busDetails.busName,
    description: 'Live bus location',
  }}
  busDetails={busDetails}
  routeDetails={busDetails.etaToNextStation ? {
    from: busDetails.busName,
    to: busDetails.nearestStation,
    totalDistance: '...', // optional
    estimatedTime: busDetails.etaToNextStation,
  } : undefined}
  onClose={() => setSelectedMarker(null)}
/>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
});


