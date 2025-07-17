// components/MarkerInfoModal.tsx
import { Entypo } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MarkerInfoModal({ marker, onClose, distance }) {
  return (
    <View className="absolute bottom-0 mx-auto w-full flex-col bg-[#0A2A54] rounded-t-3xl p-6 z-20" style={{ height: SCREEN_HEIGHT * 0.3 }}>
        <View className='flex-row justify-between'>
            <Text className="text-lg text-white font-bold mb-2">{marker.title}</Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 ml-auto bg-gray-100 rounded-full items-center justify-center"
            >
              <Entypo name="cross" size={23} color="gray" />
            </TouchableOpacity>
        </View>
      <Text className="text-gray-200 mb-2">{marker.description}</Text>
      <Text className="text-gray-200">Distance: {distance} Km</Text>
    </View>
  );
}
