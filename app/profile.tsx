import ModalMessage from '@/components/DiscountModal';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { Entypo, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function ProfilePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [showFreezeConfirm, setShowFreezeConfirm] = useState(false);


  const handleAccountDiscount = () => {
    const hasDiscount = false; // 🔁 Replace with real logic later

    if (!hasDiscount) {
      setShowDiscountModal(true);
    } else {
      router.push('/discount');
    }
  };

  const handleFreezeAccount = () => {
    setShowFreezeConfirm(true); // show confirmation modal
  };

 const confirmFreeze = async () => {
  setIsFrozen(true);
  setShowFreezeConfirm(false);

  Alert.alert("Account Frozen", "Your account has been frozen. Contact support to reactivate.");

  // Optional: remove token/profile info
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('userProfile');

  // Redirect to login or splash screen
  router.replace('/'); // or replace with your actual login route
};
  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1 ">
      {/* Back Button */}
      <View className="absolute top-12 left-4 z-10">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center space-x-2">
          <FontAwesome5 name="arrow-left" size={20} color={colors.subtext} />
          
        
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={{ paddingTop: 80, paddingHorizontal: 16, paddingBottom: 80 }}
        className="flex-1"
      >
        <Text style={{ color: colors.subtext }} className="text-center text-2xl font-bold mb-3">Account</Text>

        {/* Profile Card */}
        <View className="bg-[#0c2340] rounded-lg p-4 mb-6 shadow-md">
          <View className="items-center mb-4">
            <View className="w-20 h-20 rounded-full bg-gray-300 justify-center items-center">
              <FontAwesome5 name="user" size={36} color="#ffffff" />
            </View>
          </View>
         <Text className="text-white text-base mb-1">
            Name: <Text className="font-bold">helloworld</Text>
          </Text>
          <Text className="text-white text-base">Email: mcalon@gmail.com</Text>

          {isFrozen && (
            <Text className="text-red-400 mt-2 text-center font-semibold">Account is Frozen</Text>
          )}
        </View>

        {/* Settings Title */}
        <Text style={{ color: colors.text }} className="text-xl font-bold mb-2">Account Settings</Text>

        {/* Settings Items */}
        <View className="space-y-2">
          <TouchableOpacity
            style={{ backgroundColor: colors.secondaryBackground }}
            className="flex-row items-center p-3 border border-gray-200 rounded"
            onPress={() => router.push('/edit-profile')}
          >
            <MaterialIcons name="edit" size={20} color={colors.subtext} />
            <Text style={{ color: colors.text }} className="text-base ml-2">Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ backgroundColor: colors.secondaryBackground }}
            className="flex-row items-center p-3 border border-gray-200 rounded"
            onPress={() => router.push('/change-password')}
          >
            <FontAwesome5 name="key" size={18} color={colors.subtext} />
            <Text style={{ color: colors.text }} className="text-base ml-3">Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ backgroundColor: colors.secondaryBackground }}
            className="flex-row items-center p-3 border border-gray-200 rounded"
            onPress={handleAccountDiscount}
          >
            <MaterialIcons name="discount" size={20} color={colors.subtext} />
            <Text style={{ color: colors.text }} className="text-base ml-2">Account Discount</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isFrozen}
            style={{
              backgroundColor: colors.secondaryBackground,
              opacity: isFrozen ? 0.6 : 1,
            }}
            className="flex-row items-center p-3 border border-gray-200 rounded"
            onPress={handleFreezeAccount}
          >
            <Entypo name="warning" size={20} color="red" />
            <Text className="text-base ml-3 text-red-600">
              {isFrozen ? 'Account Frozen' : 'Freeze Account'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Button */}
      <View className="absolute bottom-6 left-4 right-4">
        <TouchableOpacity
          className="bg-[#0c2340] p-3 rounded items-center"
          onPress={() => router.replace('/')}
        >
          <Text className="text-red-500 text-xl font-bold">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Discount Modal */}
      <ModalMessage
        visible={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        onPrimaryAction={() => {
          setShowDiscountModal(false);
          router.push('/discount');
        }}
        title="No Discount Found"
        message="You haven't applied for an account discount yet."
        primaryButtonText="Apply for Discount"
      />

      {/* Freeze Confirmation Modal */}
      <ModalMessage
        visible={showFreezeConfirm}
        onClose={() => setShowFreezeConfirm(false)}
        onPrimaryAction={confirmFreeze}
        title="Freeze Account?"
        message="Are you sure you want to freeze your account? You will be logged out and need to contact support to reactivate."
        primaryButtonText="Confirm Freeze"
      />
    </View>
  );
}
