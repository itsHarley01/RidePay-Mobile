// components/SuccessModal.tsx
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  message?: string;
  buttonText?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  message = 'Account created successfully!',
  buttonText = 'Continue',
}) => {
  if (!visible) return null;

  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 bg-white z-50 justify-center items-center px-6">
      <View className="items-center">
        <View className="bg-green-100 p-6 rounded-full mb-6">
          <FontAwesome5 name="user-check" size={48} color="#22c55e" />
        </View>
        <Text className="text-2xl font-bold text-center mb-2 text-gray-800">
          Success!
        </Text>
        <Text className="text-base text-gray-600 text-center mb-6">{message}</Text>
        <TouchableOpacity
          onPress={onClose}
          className="bg-blue-700 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold text-base">{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SuccessModal;
