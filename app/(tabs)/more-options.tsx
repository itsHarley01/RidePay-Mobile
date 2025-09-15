// app/explore.tsx
import ModalMessage from '@/components/DiscountModal';
import Footer from '@/components/Footer';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExplorePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [hasDiscount, setHasDiscount] = useState<boolean | null>(null);

  // Fetch discount status from API
  useEffect(() => {
    const fetchDiscountStatus = async () => {
      try {
        // Example API call: replace with your own
        // const res = await getUserDiscountStatus(userId);
        // setHasDiscount(res.hasDiscount);

        // For now, simulate response:
        setHasDiscount(true); // or false if no discount
      } catch (error) {
        console.error("Failed to fetch discount status:", error);
        setHasDiscount(false);
      }
    };

    fetchDiscountStatus();
  }, []);

  const handleAccountDiscount = () => {
    if (hasDiscount) {
      router.push('/discount');
    } else {
      setShowDiscountModal(true);
    }
  };

  const services = [
    { 
      id: 'topup',
      icon: 'wallet-outline', 
      label: "Top Up", 
      action: () => router.push('/topup'),
      color: '#3b82f6'
    },
    { 
      id: 'discount',
      icon: 'pricetag-outline', 
      label: "Discount", 
      action: handleAccountDiscount,
      color: '#3b82f6'
    },
    { 
      id: 'support',
      icon: 'chatbubble-outline', 
      label: "Support", 
      action: () => router.push('/support'),
      color: '#3b82f6'
    },
    { 
      id: 'history',
      icon: 'time-outline', 
      label: "History", 
      action: () => router.push('/transaction-history'),
      color: '#3b82f6'
    },
    { 
      id: 'report',
      icon: 'alert-circle-outline', 
      label: "Report", 
      action: () => router.push('/report'),
      color: '#3b82f6'
    },
    { 
      id: 'feedback',
      icon: 'thumbs-up-outline', 
      label: "Feedback", 
      action: () => router.push('/feedback'),
      color: '#3b82f6'
    },
  ];

  const locations = [
    { 
      id: 'topup-spots',
      icon: 'location-outline', 
      label: "Top-Up Spots", 
      action: () => router.push('/locations/topup-locations'),
      color: '#f59e0b'
    },
    { 
      id: 'live-bus',
      icon: 'bus-outline', 
      label: "Live Bus", 
      action: () => router.push('/locations/live-bus'),
      color: '#f59e0b'
    },
    { 
      id: 'bus-routes',
      icon: 'map-outline', 
      label: "Bus Routes", 
      action: () => router.push('/locations/bus-routes'),
      color: '#f59e0b'
    },
    { 
      id: 'terminals',
      icon: 'business-outline', 
      label: "Terminals", 
      action: () => router.push('/locations/nearby-terminals'),
      color: '#f59e0b'
    },
  ];

  const others = [
    { 
      id: 'faq',
      icon: 'help-circle-outline', 
      label: "FAQ", 
      action: () => router.push('/faq'),
      color: '#6b7280'
    },
    { 
      id: 'guide',
      icon: 'book-outline', 
      label: "App Guide", 
      action: () => router.push('/guide'),
      color: '#6b7280'
    },
    { 
      id: 'about',
      icon: 'information-circle-outline', 
      label: "About Us", 
      action: () => router.push('/aboutus'),
      color: '#6b7280'
    },
    { 
      id: 'privacy',
      icon: 'shield-checkmark-outline', 
      label: "Privacy", 
      action: () => router.push('/privacy-policy'),
      color: '#6b7280'
    },
    { 
      id: 'terms',
      icon: 'document-text-outline', 
      label: "Terms", 
      action: () => router.push('/terms'),
      color: '#6b7280'
    },
  ];

  const renderSection = (title: string, items: any[], columns: number = 3) => (
    <View style={{ marginBottom: 48 }}>
      <Text style={{
        fontSize: 20,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 24,
        letterSpacing: -0.2,
      }}>
        {title}
      </Text>
      
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={item.action}
            style={{
              width: `${100 / columns - 2}%`,
              alignItems: 'center',
              marginBottom: 32,
            }}
            activeOpacity={0.7}
          >
            {/* Icon Container */}
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: item.color + '15',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
              borderWidth: 1,
              borderColor: item.color + '20',
            }}>
              <Ionicons 
                name={item.icon as any} 
                size={28} 
                color={item.color}
              />
            </View>
            
            {/* Label */}
            <Text style={{
              fontSize: 14,
              color: colors.text,
              textAlign: 'center',
              fontWeight: '500',
              lineHeight: 18,
            }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 120,
        }}
      >
        {/* Header */}
        <View style={{
          alignItems: 'center',
          marginBottom: 48,
          paddingTop: 16,
        }}>
          <Text style={{
            fontSize: 32,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: -0.8,
            marginBottom: 8,
          }}>
            Explore
          </Text>
          <Text style={{
            fontSize: 16,
            color: colors.subtext,
            textAlign: 'center',
            fontWeight: '400',
          }}>
            Discover all available services
          </Text>
        </View>

        {/* Services Section */}
        {renderSection('Services', services, 3)}

        {/* Locations Section */}
        {renderSection('Locations', locations, 2)}

        {/* Others Section */}
        {renderSection('More', others, 3)}
      </ScrollView>

      {/* Footer - Fixed at bottom */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      }}>
        <Footer />
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
    </SafeAreaView>
  );
}