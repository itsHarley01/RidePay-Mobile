import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function LiveBus() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 10.3157, // Cebu
          longitude: 123.8854,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Bus Marker with custom icon */}
        <Marker
          coordinate={{ latitude: 10.3157, longitude: 123.8854 }}
          title="Bus Location"
          image={require('../../assets/map/bus-pin.png')}
        >
          {/* <Image
            source={require('../../assets/map/bus-pin.png')}
            style={{ width: 40, height: 40, resizeMode: 'contain',}}
            resizeMode="contain"
          /> */}
        </Marker>
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
