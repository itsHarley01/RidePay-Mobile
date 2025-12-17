import { fetchStations } from '@/api/fetchLocations'; // 👈 adjust path if needed
import MarkerInfoModal from '@/components/MarkerInfoModal';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { getDistance } from 'geolib';
import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import mapStyle from '../../assets/map/mapStyle.json';

type MapMarker = {
  id: string;
  title: string;
  description?: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
};

export default function TopupLocations() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);

  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [markers, setMarkers] = useState<MapMarker[]>([]);

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
     FETCH STATIONS FROM FIREBASE
  ====================================================== */
  useEffect(() => {
  const loadStations = async () => {
    try {
      console.log("📡 Fetching stations from Firebase...");

      const stations = await fetchStations();

      console.log("✅ Raw stations data:", stations);

      if (!stations || stations.length === 0) {
        console.warn("⚠️ No stations found in database");
      }

      const formattedMarkers: MapMarker[] = stations.map((station) => ({
        id: station.id,
        title: station.name,
        description: station.address,
        coordinate: {
          latitude: station.lat,
          longitude: station.long,
        },
      }));

      console.log("📍 Formatted station markers:", formattedMarkers);

      setMarkers(formattedMarkers);
    } catch (error) {
      console.error("❌ Error fetching stations:", error);
    }
  };

  loadStations();
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
          latitude: 10.3185,
          longitude: 123.9075,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={() => setSelectedMarker(null)}
      >
        {markers.map((marker) => (
<Marker
  key={marker.id}
  coordinate={marker.coordinate}
  onPress={() => {
    console.log("📍 Marker pressed:", marker);
    setSelectedMarker(marker);
  }}
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

      {/* Marker Modal */}
     {selectedMarker && selectedMarker.title && (
  <MarkerInfoModal
    type="topup"
    marker={{
      title: selectedMarker.title,
      description: selectedMarker.description,
    }}
    distance={
      userLocation
        ? (
            getDistance(userLocation, selectedMarker.coordinate) / 1000
          ).toFixed(2)
        : undefined
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
