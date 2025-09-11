import MarkerInfoModal from '@/components/MarkerInfoModal';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import mapStyle from '../../assets/map/mapStyle.json';

export default function NearbyTerminals() {
  const router = useRouter();
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedTerminal, setSelectedTerminal] = useState(null);

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
      >
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
      </MapView>

      {/* Locate Me Button */}
      <TouchableOpacity
        className={`absolute ${selectedTerminal ? 'bottom-[30%]' : 'bottom-5'} right-5 bg-yellow-500 p-3 rounded-full shadow z-10 w-16 h-16 justify-center items-center`}
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
      {selectedTerminal && (
        <MarkerInfoModal
  type="terminal"
  marker={{ title: selectedTerminal.title }}
  onClose={() => setSelectedTerminal(null)}
  terminalDetails={{
    location: selectedTerminal.title,
    description: 'Bus terminal servicing local routes.',
    terminalCode: `TERM-${selectedTerminal.id.toString().padStart(3, '0')}`,
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
