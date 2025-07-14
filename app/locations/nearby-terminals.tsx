import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function NearbyTerminals() {
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
  ];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 10.3157,
          longitude: 123.8854,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        {terminals.map((terminal) => (
          <Marker
            key={terminal.id}
            coordinate={terminal.coordinate}
            title={terminal.title}
            description="Bus terminal"
          />
        ))}
      </MapView>
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
