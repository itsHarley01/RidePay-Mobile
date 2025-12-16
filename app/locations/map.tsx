import React, { useState, useRef, useEffect } from 'react';
import { View, Image, TouchableOpacity, Dimensions, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function MapScreen() {
  const mapRef = useRef<MapView | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Selection state - only one can be active at a time
  const [selectedItem, setSelectedItem] = useState<{
    type: 'route' | 'bus' | 'terminal' | 'topup' | null;
    data: any;
  }>({ type: null, data: null });

  // Mock data (reuse from HomeScreen)
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

  // Mock live bus
  const liveBus = { 
    id: 'bus-1', 
    title: 'Bus 301', 
    description: 'Currently en route', 
    coordinate: { latitude: 10.3157, longitude: 123.8854 } 
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    })();
  }, []);

  return (
    <View className="flex-1">
        {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 left-4 z-20 bg-white p-2 rounded-full shadow"
      >
        <Ionicons name="arrow-back" size={22} color="#333" />
      </TouchableOpacity>

      <MapView
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        initialRegion={{
          latitude: 10.3157,
          longitude: 123.8854,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        showsUserLocation
        loadingEnabled
      >
        {/* Bus Routes */}
        {routes.map((route) => (
          <Polyline
            key={route.id}
            coordinates={route.coordinates}
            strokeColor={route.strokeColor}
            strokeWidth={5}
            tappable
            onPress={() => setSelectedItem({ type: 'route', data: route })}
          />
        ))}

        {/* Terminals */}
        {terminals.map((terminal) => (
          <Marker
            key={terminal.id}
            coordinate={terminal.coordinate}
            title={terminal.title}
            onPress={() => setSelectedItem({ type: 'terminal', data: terminal })}
          >
            <Image source={require('../../assets/map/terminal-pin.png')} style={{ width: 40, height: 40 }} />
          </Marker>
        ))}

        {/* Top-up Stations */}
        {topupStations.map((station) => (
          <Marker
            key={station.id}
            coordinate={station.coordinate}
            title={station.title}
            onPress={() => setSelectedItem({ type: 'topup', data: station })}
          >
            <Image source={require('../../assets/map/station-pin.png')} style={{ width: 40, height: 40 }} />
          </Marker>
        ))}

        {/* Live Bus */}
        <Marker
          coordinate={liveBus.coordinate}
          title={liveBus.title}
          onPress={() => setSelectedItem({ type: 'bus', data: liveBus })}
        >
          <Image source={require('../../assets/map/bus-pin.png')} style={{ width: 40, height: 40 }} />
        </Marker>
      </MapView>

      {/* Locate Me Button */}
      <TouchableOpacity
        className={`absolute ${
          selectedItem.type ? 'bottom-[25%]' : 'bottom-5'
        } right-5 bg-yellow-500 p-3 rounded-full shadow z-10 w-12 h-12 justify-center items-center`}
        onPress={() => {
          if (userLocation) {
            mapRef.current?.animateToRegion({
              ...userLocation,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }}
      >
        <FontAwesome5 name="location-arrow" size={16} color="#333" />
      </TouchableOpacity>

      {/* Route Info Modal - Smaller and positioned at bottom */}
      {selectedItem.type === 'route' && (
        <View className="absolute bottom-3 left-3 right-3 bg-white rounded-xl shadow-lg border border-gray-200 p-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-bold text-base text-gray-800">{selectedItem.data.name}</Text>
            <TouchableOpacity onPress={() => setSelectedItem({ type: null, data: null })} className="p-1">
              <Ionicons name="close" size={18} color="#666" />
            </TouchableOpacity>
          </View>
          <Text className="text-sm text-gray-600 mb-2">
            {selectedItem.data.start} → {selectedItem.data.end}
          </Text>
          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="text-xs text-gray-500">Distance</Text>
              <Text className="text-sm font-medium">{(selectedItem.data.coordinates.length * 1.5).toFixed(1)} km</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500">Est. Time</Text>
              <Text className="text-sm font-medium">{selectedItem.data.coordinates.length * 5} mins</Text>
            </View>
          </View>
        </View>
      )}

      {/* Live Bus Modal - Smaller and positioned at bottom */}
      {selectedItem.type === 'bus' && (
        <View className="absolute bottom-3 left-3 right-3 bg-white rounded-xl shadow-lg border border-gray-200 p-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-bold text-base text-gray-800">{selectedItem.data.title}</Text>
            <TouchableOpacity onPress={() => setSelectedItem({ type: null, data: null })} className="p-1">
              <Ionicons name="close" size={18} color="#666" />
            </TouchableOpacity>
          </View>
          <Text className="text-sm text-gray-600 mb-2">{selectedItem.data.description}</Text>
          <View className="flex-row items-center">
            <Ionicons name="location" size={14} color="#666" />
            <Text className="text-sm text-gray-600 ml-1">1.2 km away</Text>
          </View>
        </View>
      )}

      {/* Terminal Info Modal - Smaller and positioned at bottom */}
      {selectedItem.type === 'terminal' && (
        <View className="absolute bottom-3 left-3 right-3 bg-white rounded-xl shadow-lg border border-gray-200 p-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-bold text-base text-gray-800">{selectedItem.data.title}</Text>
            <TouchableOpacity onPress={() => setSelectedItem({ type: null, data: null })} className="p-1">
              <Ionicons name="close" size={18} color="#666" />
            </TouchableOpacity>
          </View>
          <Text className="text-sm text-gray-600 mb-2">Bus terminal servicing local routes</Text>
          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="text-xs text-gray-500">Terminal Code</Text>
              <Text className="text-sm font-medium">TERM-{selectedItem.data.id.toString().padStart(3, '0')}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500">Status</Text>
              <Text className="text-sm font-medium text-green-600">Active</Text>
            </View>
          </View>
        </View>
      )}

      {/* Top-up Info Modal - Smaller and positioned at bottom */}
      {selectedItem.type === 'topup' && (
        <View className="absolute bottom-3 left-3 right-3 bg-white rounded-xl shadow-lg border border-gray-200 p-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-bold text-base text-gray-800">{selectedItem.data.title}</Text>
            <TouchableOpacity onPress={() => setSelectedItem({ type: null, data: null })} className="p-1">
              <Ionicons name="close" size={18} color="#666" />
            </TouchableOpacity>
          </View>
          <Text className="text-sm text-gray-600 mb-2">{selectedItem.data.description}</Text>
          <View className="flex-row items-center">
            <Ionicons name="location" size={14} color="#666" />
            <Text className="text-sm text-gray-600 ml-1">
              {userLocation
                ? `${(getDistance(userLocation, selectedItem.data.coordinate) / 1000).toFixed(2)} km away`
                : 'Distance calculating...'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}