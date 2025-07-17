import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    TextInput,
    TextInputProps,
    View
} from 'react-native';

interface FloatingLabelInputProps extends TextInputProps {
  label: string;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChangeText,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: 'absolute' as const,
    left: 12,
    paddingHorizontal: 4,
    backgroundColor: 'white',
    color: '#1D4ED8', // blue-700
    zIndex: 10,
    transform: [
      {
        translateY: animatedIsFocused.interpolate({
          inputRange: [0, 1],
          outputRange: [16, -10], // from center to top
        }),
      },
    ],
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12], // larger to smaller
    }),
  };

  return (
    <View className="relative w-full mb-6">
      <Animated.Text style={labelStyle}>
        {label}
      </Animated.Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder=""
        className="border border-gray-300 rounded-xl px-4 pt-5 pb-2 text-base text-gray-900"
        {...rest}
      />
    </View>
  );
};

export default FloatingLabelInput;
