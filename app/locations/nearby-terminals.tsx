import { fetchStations } from '@/api/fetchLocations';
import MarkerInfoModal from '@/components/MarkerInfoModal';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import mapStyle from '../../assets/map/mapStyle.json';

type MapTerminal = {
  id: string;
  title: string;
  description?: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
};

export default function NearbyTerminals() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [terminals, setTerminals] = useState<MapTerminal[]>([]);
  const [selectedTerminal, setSelectedTerminal] = useState<MapTerminal | null>(null);

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
     FETCH STATIONS (USED AS TERMINALS)
  ====================================================== */
  useEffect(() => {
    const loadStationsAsTerminals = async () => {
      try {
        console.log("📡 Fetching stations (used as terminals)...");

        const stations = await fetchStations();

        console.log("✅ Raw station data:", stations);

        if (!stations.length) {
          console.warn("⚠️ No stations found");
          return;
        }

        const formatted: MapTerminal[] = stations.map((station) => ({
          id: station.id,
          title: station.name,
          description: station.address,
          coordinate: {
            latitude: station.lat,
            longitude: station.long,
          },
        }));

        console.log("📍 Terminal markers (from stations):", formatted);

        setTerminals(formatted);
      } catch (error) {
        console.error("❌ Failed to load terminals:", error);
      }
    };

    loadStationsAsTerminals();
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

      {/* Map */}
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
        onPress={() => setSelectedTerminal(null)}
      >
        {terminals.map((terminal) => (
          <Marker
            key={terminal.id}
            coordinate={terminal.coordinate}
            onPress={() => {
              console.log("🏁 Terminal pressed:", terminal);
              setSelectedTerminal(terminal);
            }}
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
      </MapView>

      {/* Locate Me Button */}
      <TouchableOpacity
        className={`absolute ${
          selectedTerminal ? 'bottom-[30%]' : 'bottom-5'
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
      {selectedTerminal && selectedTerminal.title && (
        <MarkerInfoModal
          type="terminal"
          marker={{
            title: selectedTerminal.title,
            description: selectedTerminal.description,
          }}
          onClose={() => setSelectedTerminal(null)}
          terminalDetails={{
            terminalCode: `TERM-${selectedTerminal.id.slice(0, 5).toUpperCase()}`,
            location: selectedTerminal.title,
            description:
              selectedTerminal.description ||
              'Bus terminal servicing local routes.',
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
