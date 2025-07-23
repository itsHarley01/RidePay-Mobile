// components/AnimatedCircularProgress.tsx
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { interpolate } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  progress: number; // value from 0 to 100
}

export default function AnimatedCircularProgress({ progress }: Props) {
  const animatedProgress = useSharedValue(0);
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 800 });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - animatedProgress.value / 100);
    return {
      strokeDashoffset,
    };
  });

  return (
    <View className="items-center justify-center mb-6">
      <Svg width={150} height={150} viewBox="0 0 150 150">
        <Circle
          cx={75}
          cy={75}
          r={radius}
          stroke="#E0E0E0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={75}
          cy={75}
          r={radius}
          stroke="#0c2340"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference}, ${circumference}`}
          animatedProps={animatedProps}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="text-xl font-bold text-[#0c2340]">{Math.round(progress)}%</Text>
        <Text className="text-sm text-gray-600">Progress</Text>
      </View>
    </View>
  );
}
