// app/explore.tsx
import ModalMessage from '@/components/DiscountModal';
import Footer from '@/components/Footer';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ExplorePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [hasDiscount, setHasDiscount] = useState<boolean | null>(null);

  // ✅ Fetch discount status from API (or local storage)
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

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      className="flex-1 px-4 pt-10 pb-32"
    >
      {/* Page Title */}
      <Text
        style={{ color: colors.text }}
        className="text-2xl font-bold mb-6 text-center"
      >
        Explore More
      </Text>

      {/* SERVICES */}
      <Text style={{ color: colors.text }} className="text-xl font-bold mb-4">
        Services
      </Text>
      <View className="flex-row flex-wrap justify-between mb-8">
        {[
          { icon: <Ionicons name="wallet" size={28} color={colors.text} />, label: "Top Up", action: () => router.push('/topup') },
          { icon: <Ionicons name="pricetags" size={28} color={colors.text} />, label: "Discount", action: handleAccountDiscount },
          { icon: <Ionicons name="chatbubble-ellipses" size={28} color={colors.text} />, label: "Support", action: () => router.push('/support')},
          { icon: <MaterialIcons name="history" size={28} color={colors.text} />, label: "History", action: () => router.push('/transaction-history') },
          { icon: <MaterialIcons name="report-problem" size={28} color={colors.text} />, label: "Report", action:  () => router.push('/report')},
          { icon: <Ionicons name="thumbs-up" size={28} color={colors.text} />, label: "Feedback", action: () => router.push('/feedback') },
        ].map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={item.action}
            className="w-1/3 items-center mb-6"
          >
            <View style={{ backgroundColor: colors.accent }} className=" p-4 rounded-full mb-2">
              {item.icon}
            </View>
            <Text style={{ color: colors.text }} className="text-sm text-center">{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LOCATIONS */}
      <Text style={{ color: colors.text }} className="text-xl font-bold mb-4">Locations</Text>
      <View className="flex-row flex-wrap justify-between mb-8">
        {[
          { icon: <Entypo name="location-pin" size={28} color={colors.text} />, label: "Top-Up Spots", action: () => router.push('/locations/topup-locations') },
          { icon: <MaterialIcons name="directions-bus" size={28} color={colors.text} />, label: "Live Bus", action: () => router.push('/locations/live-bus') },
          { icon: <Ionicons name="map" size={28} color={colors.text} />, label: "Bus Routes", action: () => router.push('/locations/bus-routes') },
          { icon: <Entypo name="location" size={28} color={colors.text} />, label: "Nearby Terminals", action: () => router.push('/locations/nearby-terminals') },
        ].map((item, idx) => (
          <TouchableOpacity key={idx} onPress={item.action} className="w-1/3 items-center mb-6">
            <View style={{ backgroundColor: colors.accent }} className=" p-4 rounded-full mb-2">
              {item.icon}
            </View>
            <Text style={{ color: colors.text }} className="text-sm text-center">{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* OTHERS */}
      <Text style={{ color: colors.text }} className="text-xl font-bold mb-4">Others</Text>
      <View className="flex-row flex-wrap gap-x-4 mb-32">
        {[
  { icon: <Ionicons name="help-circle" size={28} color={colors.text} />, label: "FAQ", action: () => router.push('/faq')},
  { icon: <Ionicons name="book" size={28} color={colors.text} />, label: "App Guide", action: () => router.push('/guide')},
  { icon: <Ionicons name="information-circle" size={28} color={colors.text} />, label: "About Us", action: () => router.push('/aboutus')},
  { icon: <Ionicons name="shield-checkmark" size={28} color={colors.text} />, label: "Privacy Policy", action: () => router.push('/privacy-policy')},
  { icon: <Ionicons name="document-text" size={28} color={colors.text} />, label: "Terms & Conditions", action: () => router.push('/terms') },
].map((item, idx) => (
  <TouchableOpacity
    key={idx}
    onPress={item.action} // ✅ this enables navigation
    className="w-[30%] items-center mb-6"
  >
    <View style={{ backgroundColor: colors.accent }} className=" p-4 rounded-full mb-2">
      {item.icon}
    </View>
    <Text style={{ color: colors.text }} className="text-sm text-center">{item.label}</Text>
  </TouchableOpacity>
))}

      </View>


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

      <View className="mt-auto h-64">
        <Footer />
      </View>
    </ScrollView>
  );
}
