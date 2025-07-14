import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function TopupLocations() {
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
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 10.3157,
          longitude: 123.8854,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {markers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
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
