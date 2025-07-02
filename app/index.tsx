import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const logoSource =
  theme === 'dark'
    ? require('../assets/images/dark-logo.png')
    : require('../assets/images/ridepay-logo2.png');

  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1 justify-center items-center px-4">
 
    <View className="flex-row items-center justify-center mb-28">
      {/* Logo */}
      <Image
        source={logoSource} // ✅ Update to your actual logo path
        className="w-20 h-20 mr-3"
        resizeMode="contain"
      />

      {/* RidePay Title */}
      <Text className="text-5xl font-bold">
        <Text style={{ color: colors.subtext }} className="">Ride</Text>
        <Text className="text-yellow-500 ">Pay</Text>
      </Text>
    </View>


      {/* Form Container (narrower width) */}
      <View className="w-[85%]">
        {/* Email Input */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          className="border border-gray-300 rounded px-4 py-3 mb-4"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.placeholder}
        />

        {/* Password Input */}
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          className="border border-gray-300 rounded px-4 py-3 mb-2"
          secureTextEntry
          placeholderTextColor={colors.placeholder}
        />

        {/* Remember me & Forgot password */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} className="flex-row items-center">
            <View className={`w-4 h-4 mr-2 border ${rememberMe ? 'bg-blue-600' : 'border-gray-400'}`} />
            <Text style={{color: colors.placeholder}} className="text-sm ">Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {/* handle forgot password */}}>
            <Text className="text-sm text-blue-600">Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/home')}
          className="bg-[#0A2A54] py-3 rounded-xl mb-4 mt-10"
        >
          <Text className="text-white text-center text-base font-semibold">Login</Text>
        </TouchableOpacity>

        {/* Sign Up */}
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={{ color: colors.placeholder }} className="text-center text-sm ">
            Don't have an account? <Text className="text-blue-600 font-semibold">Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
