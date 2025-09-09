import { fetchUserDataByUid } from '@/api/userApi';
import { getAuthData } from '@/utils/auth';
import ModalMessage from '@/components/DiscountModal';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { Entypo, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { 
  Alert, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  View, 
  ActivityIndicator, 
  RefreshControl,
  SafeAreaView // Import SafeAreaView
} from 'react-native';

export default function ProfilePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [showFreezeConfirm, setShowFreezeConfirm] = useState(false);

  const [profile, setProfile] = useState<{ firstName: string; lastName: string; email: string; discount: boolean} | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🔄 Fetch profile function (reusable)
  const loadProfile = useCallback(async (manual = false) => {
    try {
      if (manual) setRefreshing(true);

      const { uid } = await getAuthData();
      if (!uid) {
        Alert.alert("Error", "No UID found. Please log in again.");
        return;
      }

      const data = await fetchUserDataByUid(uid);
      setProfile(data);

    } catch (err: any) {
      Alert.alert("Error", err.error || "Failed to fetch user profile.");
    } finally {
      if (manual) setRefreshing(false);
    }
  }, []);

  // 📌 Initial load
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ⏱️ Auto refresh every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadProfile(false); // manual = false => silent refresh
    }, 2000);

    return () => clearInterval(interval);
  }, [loadProfile]);

  const handleAccountDiscount = () => {
    const hasDiscount = profile?.discount;
    if (!hasDiscount) {
      setShowDiscountModal(true);
    } else {
      router.push('/discount');
    }
  };

  const handleFreezeAccount = () => {
    setShowFreezeConfirm(true);
  };

  const confirmFreeze = () => {
    setIsFrozen(true);
    setShowFreezeConfirm(false);
    Alert.alert("Account Frozen", "Your account has been frozen. Contact support to reactivate.");
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
      <View style={{ backgroundColor: colors.background }} className="flex-1 px-4 pt-4">
        {/* Back Button - Properly styled */}
        <View className="mb-6">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="flex-row items-center p-2 -ml-2 w-10 h-20 justify-center"
            activeOpacity={0.7}
          >
            <FontAwesome5 name="arrow-left" size={24} color={colors.subtext} />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadProfile(true)} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }} // Add padding for logout button
        >
          <Text style={{ color: colors.subtext }} className="text-center text-2xl font-bold mb-6">Account</Text>

          <View className="bg-[#0c2340] rounded-lg p-4 mb-6 shadow-md">
            <View className="items-center mb-4">
              <View className="w-20 h-20 rounded-full bg-gray-300 justify-center items-center">
                <FontAwesome5 name="user" size={36} color="#ffffff" />
              </View>
            </View>
            
            {refreshing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text className="text-white text-base mb-1">
                  Name: <Text className="font-bold">{profile?.firstName} {profile?.lastName}</Text>
                </Text>
                <Text className="text-white text-base">Email: {profile?.email}</Text>
              </>
            )}

            {isFrozen && (
              <Text className="text-red-400 mt-2 text-center font-semibold">Account is Frozen</Text>
            )}
          </View>

          {/* Settings Title */}
          <Text style={{ color: colors.text }} className="text-xl font-bold mb-4">Account Settings</Text>

          {/* Settings Items */}
          <View className="space-y-3">
            <TouchableOpacity
              style={{ backgroundColor: colors.secondaryBackground }}
              className="flex-row items-center p-4 border border-gray-200 rounded-lg"
              onPress={() => router.push('/edit-profile')}
            >
              <MaterialIcons name="edit" size={20} color={colors.subtext} />
              <Text style={{ color: colors.text }} className="text-base ml-3">Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ backgroundColor: colors.secondaryBackground }}
              className="flex-row items-center p-4 border border-gray-200 rounded-lg"
              onPress={() => router.push('/change-password')}
            >
              <FontAwesome5 name="key" size={18} color={colors.subtext} />
              <Text style={{ color: colors.text }} className="text-base ml-3">Change Password</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ backgroundColor: colors.secondaryBackground }}
              className="flex-row items-center p-4 border border-gray-200 rounded-lg"
              onPress={handleAccountDiscount}
            >
              <MaterialIcons name="discount" size={20} color={colors.subtext} />
              <Text style={{ color: colors.text }} className="text-base ml-3">Account Discount</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isFrozen}
              style={{
                backgroundColor: colors.secondaryBackground,
                opacity: isFrozen ? 0.6 : 1,
              }}
              className="flex-row items-center p-4 border border-gray-200 rounded-lg"
              onPress={handleFreezeAccount}
            >
              <Entypo name="warning" size={20} color="red" />
              <Text className="text-base ml-3 text-red-600">
                {isFrozen ? 'Account Frozen' : 'Freeze Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Logout Button - Fixed positioning */}
        <View className="absolute bottom-6 left-4 right-4">
          <TouchableOpacity
            className="bg-[#0c2340] p-4 rounded-lg items-center shadow-lg"
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
    </SafeAreaView>
  );
}