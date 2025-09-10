import { loginPassenger } from '@/api/loginApi';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { saveAuthData } from '@/utils/auth';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // ✅ for eye icon

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ✅ state for toggling password

  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const logoSource =
    theme === 'dark'
      ? require('../assets/images/dark-logo.png')
      : require('../assets/images/ridepay-logo2.png');

  const handleLogin = async () => {
    setErrors({ email: '', password: '' });

    if (!email || !password) {
      setErrors({
        email: !email ? 'Email is required' : '',
        password: !password ? 'Password is required' : '',
      });
      return;
    }

    try {
      setLoading(true);
      const res = await loginPassenger({ email, password });
      await saveAuthData(res.uid, res.token);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      const message = error?.error || error?.message || '';
      if (message.toLowerCase().includes('not registered')) {
        setErrors({ email: "Account hasn't been registered", password: '' });
      } else if (message.toLowerCase().includes('invalid password')) {
        setErrors({ email: '', password: 'Invalid password' });
      } else {
        setErrors({ email: '', password: 'Invalid email or password' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1 justify-center items-center px-4">
      {/* Logo */}
      <View className="flex-row items-center justify-center mb-28">
        <Image
          source={logoSource}
          className="w-20 h-20 mr-3"
          resizeMode="contain"
        />
        <Text className="text-5xl font-bold">
          <Text style={{ color: colors.subtext }}>Ride</Text>
          <Text className="text-yellow-500">Pay</Text>
        </Text>
      </View>

      {/* Inputs */}
      <View className="w-[85%]">
        {/* Email */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          className="border border-gray-300 rounded px-4 py-3 mb-1"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.placeholder}
        />
        {errors.email ? (
          <Text className="text-red-500 text-xs mb-2">{errors.email}</Text>
        ) : (
          <View className="mb-2" />
        )}

        {/* Password with toggle */}
        <View className="flex-row items-center border border-gray-300 rounded px-4 mb-1">
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            className="flex-1 py-3"
            secureTextEntry={!showPassword} // ✅ toggle here
            placeholderTextColor={colors.placeholder}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={colors.placeholder}
            />
          </TouchableOpacity>
        </View>
        {errors.password ? (
          <Text className="text-red-500 text-xs mb-2">{errors.password}</Text>
        ) : (
          <View className="mb-2" />
        )}

        {/* Remember me + Forgot password */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} className="flex-row items-center">
            <View className={`w-4 h-4 mr-2 border ${rememberMe ? 'bg-blue-600' : 'border-gray-400'}`} />
            <Text style={{ color: colors.placeholder }} className="text-sm">Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/forgot-password')}>
            <Text className="text-sm text-blue-600">Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login button */}
        <TouchableOpacity
          onPress={handleLogin}
          className={`py-3 rounded-xl mb-4 mt-10 ${loading ? 'bg-gray-400' : 'bg-[#0A2A54]'}`}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center text-base font-semibold">Login</Text>
          )}
        </TouchableOpacity>

        {/* Sign up */}
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={{ color: colors.placeholder }} className="text-center text-sm">
            Don't have an account? <Text className="text-blue-600 font-semibold">Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
