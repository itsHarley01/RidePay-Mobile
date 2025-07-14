import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';

export default function BusRoutes() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 10.3157, // Cebu City center
          longitude: 123.8854,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        {/* Example Bus Route 1 */}
        <Polyline
          coordinates={[
            { latitude: 10.3100, longitude: 123.8800 },
            { latitude: 10.3157, longitude: 123.8854 },
            { latitude: 10.3200, longitude: 123.8900 },
            { latitude: 10.3250, longitude: 123.8950 },
          ]}
          strokeColor="#1E90FF"
          strokeWidth={5}
        />

        {/* Example Bus Route 2 */}
        <Polyline
          coordinates={[
            { latitude: 10.3000, longitude: 123.8700 },
            { latitude: 10.3050, longitude: 123.8750 },
            { latitude: 10.3100, longitude: 123.8800 },
            { latitude: 10.3150, longitude: 123.8900 },
            { latitude: 10.3200, longitude: 123.9000 },
          ]}
          strokeColor="#32CD32"
          strokeWidth={5}
        />
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
