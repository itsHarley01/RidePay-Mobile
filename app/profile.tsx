// ✅ ProfilePage.tsx with minimalist design
import { fetchUserDataByUid } from '@/api/userApi';
import { getAuthData } from '@/utils/auth';
import ModalMessage from '@/components/DiscountModal';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { Entypo, FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDiscountApplications, DiscountApplication } from '@/api/applyDiscount';
import { 
  Alert, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  View, 
  ActivityIndicator, 
  RefreshControl,
} from 'react-native';

export const hasUserDiscount = async (userId: string): Promise<boolean> => {
  try {
    const apps: DiscountApplication[] = await getDiscountApplications();
    return apps.some(app => app.userId === userId && app.status.status !== 'rejected');
  } catch (error) {
    console.error("Error checking discount:", error);
    return false;
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [showFreezeConfirm, setShowFreezeConfirm] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);

  const [profile, setProfile] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    discount: boolean;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch profile function
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchDiscountStatus = async () => {
      try {
        const { uid } = await getAuthData();
        if (!uid) return;

        const hasDiscount = await hasUserDiscount(uid);
        setHasDiscount(hasDiscount);
      } catch (error) {
        console.error("Failed to fetch discount status:", error);
        setHasDiscount(false);
      }
    };

    fetchDiscountStatus();
  }, []);

  // Initial load
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Auto refresh every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadProfile(false);
    }, 2000);

    return () => clearInterval(interval);
  }, [loadProfile]);

  const handleAccountDiscount = async () => {
    const { uid } = await getAuthData();
    if (!uid) return;

    const hasDiscount = await hasUserDiscount(uid);

    if (hasDiscount) {
      router.push('/discount');
    } else {
      setShowDiscountModal(true);
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

  const menuItems = [
    {
      id: 'edit-profile',
      icon: 'person-outline',
      title: 'Edit Profile',
      onPress: () => router.push('/edit-profile'),
      color: colors.text,
    },
    {
      id: 'change-password',
      icon: 'key-outline',
      title: 'Change Password',
      onPress: () => router.push('/change-password'),
      color: colors.text,
    },
    {
      id: 'discount',
      icon: 'pricetag-outline',
      title: 'Account Discount',
      onPress: handleAccountDiscount,
      color: colors.text,
    },
    {
      id: 'freeze',
      icon: 'warning-outline',
      title: isFrozen ? 'Account Frozen' : 'Freeze Account',
      onPress: handleFreezeAccount,
      color: '#ef4444',
      disabled: isFrozen,
    },
  ];

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadProfile(true)} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 120,
        }}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 48,
          paddingTop: 8,
        }}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
            }}
          >
            <FontAwesome5 name="arrow-left" size={18} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={{
            fontSize: 28,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: -0.5,
          }}>
            Account
          </Text>
        </View>

        {/* Profile Section */}
        <View style={{
          alignItems: 'center',
          marginBottom: 56,
        }}>
          {/* Avatar */}
          <View style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
            borderWidth: 3,
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          }}>
            <Ionicons name="person" size={40} color={colors.subtext} />
          </View>

          {/* User Info */}
          {refreshing || loading ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                fontSize: 24,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8,
                letterSpacing: -0.3,
              }}>
                {profile?.firstName} {profile?.lastName}
              </Text>
              <Text style={{
                fontSize: 16,
                color: colors.subtext,
                fontWeight: '400',
              }}>
                {profile?.email}
              </Text>
              
              {isFrozen && (
                <View style={{
                  backgroundColor: '#ef444420',
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginTop: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Ionicons name="warning" size={16} color="#ef4444" />
                  <Text style={{
                    color: '#ef4444',
                    fontSize: 14,
                    fontWeight: '500',
                    marginLeft: 6,
                  }}>
                    Account Frozen
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View style={{ gap: 1 }}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.onPress}
              disabled={item.disabled}
              style={{
                backgroundColor: colors.secondaryBackground || (theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#ffffff'),
                paddingHorizontal: 20,
                paddingVertical: 20,
                flexDirection: 'row',
                alignItems: 'center',
                opacity: item.disabled ? 0.6 : 1,
                // Rounded corners for first and last items
                ...(index === 0 && { 
                  borderTopLeftRadius: 16, 
                  borderTopRightRadius: 16,
                }),
                ...(index === menuItems.length - 1 && { 
                  borderBottomLeftRadius: 16, 
                  borderBottomRightRadius: 16,
                }),
              }}
            >
              <View style={{
                width: 32,
                height: 32,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16,
              }}>
                <Ionicons 
                  name={item.icon as any} 
                  size={20} 
                  color={item.color} 
                />
              </View>
              
              <Text style={{
                fontSize: 16,
                color: item.color,
                fontWeight: '500',
                flex: 1,
              }}>
                {item.title}
              </Text>

              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={colors.subtext}
                style={{ opacity: 0.5 }}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Logout Button - Fixed at bottom */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        paddingHorizontal: 24,
        paddingBottom: 32,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      }}>
        <TouchableOpacity
          onPress={() => router.replace('/')}
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.2)',
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={{
            color: '#ef4444',
            fontSize: 16,
            fontWeight: '600',
            marginLeft: 8,
            letterSpacing: 0.3,
          }}>
            Sign Out
          </Text>
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
    </SafeAreaView>
  );
}