// File: /components/ThemeToggleSwitch.tsx
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';

export default function ThemeToggleSwitch() {
  const { theme, toggleTheme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const animation = useRef(new Animated.Value(theme === 'dark' ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: theme === 'dark' ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [theme]);

  const interpolatedBackground = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#d1d5db', colors.accent], 
  });

  const knobPosition = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 28],
  });

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      activeOpacity={0.9}
      className="flex-row justify-between w-full items-center space-x-4 px-5"
    >
      <Text style={{ color: colors.text }} className='text-xl font-semibold'>
        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
      </Text>

      <Animated.View
        style={{
          width: 50,
          height: 28,
          borderRadius: 14,
          backgroundColor: interpolatedBackground,
          padding: 2,
        }}
      >
        <Animated.View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: '#fff',
            transform: [{ translateX: knobPosition }],
          }}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}
