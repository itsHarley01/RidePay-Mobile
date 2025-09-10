// File: app/discount/index.tsx
import { getDiscountApplications } from '@/api/applyDiscount';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { getAuthData } from '@/utils/auth';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function DiscountIndex() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { uid } = await getAuthData();
        if (!uid) return;

        setUserId(uid);

        const data = await getDiscountApplications();
        if (data && Array.isArray(data)) {
          const userApps = data.filter((app) => app.userId === uid);
          setApplications(userApps);
        }
      } catch (err) {
        console.error('Error fetching discount applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <View
      style={{ backgroundColor: colors.background }}
      className="flex-1 px-4 pt-12 pb-6"
    >
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 left-4 z-10"
      >
        <FontAwesome5 name="arrow-left" size={20} color={colors.subtext} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="mt-20">
          <Text
            style={{ color: colors.subtext }}
            className="text-3xl font-bold text-center mb-8"
          >
            Account Discount
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color={colors.placeholder} />
          ) : applications.length > 0 ? (
            applications.map((app) => (
              <View
                key={app.id}
                className="bg-[#0c2340] p-6 mb-6 rounded-2xl shadow-lg"
              >
                <Text className="text-white text-xl font-bold mb-2">
                  Discount Type: {app.category.toUpperCase()}
                </Text>
                <Text style={{ color: colors.text }} className="text-base mb-1">
                  Discount ID:{' '}
                  <Text className="font-semibold text-white">{app.id}</Text>
                </Text>
                <Text style={{ color: colors.text }} className="text-base mb-1">
                  Status:{' '}
                  <Text
                    className={`font-bold ${
                      app.status.status === 'approved'
                        ? 'text-green-400'
                        : app.status.status === 'rejected'
                        ? 'text-red-400'
                        : 'text-yellow-400'
                    }`}
                  >
                    {app.status.status.toUpperCase()}
                  </Text>
                </Text>
                <Text style={{ color: colors.text }} className="text-base">
                  Applied On:{' '}
                  <Text className="font-semibold text-white">
                    {new Date(app.status.dateOfApplication).toLocaleDateString()}
                  </Text>
                </Text>
              </View>
            ))
          ) : (
            <View className="items-center mt-10">
              <Text
                style={{ color: colors.placeholder }}
                className="text-base mb-6 text-center"
              >
                You don’t currently have any discount applications.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/discount/apply')}
                className="bg-[#0c2340] px-6 py-3 rounded-full shadow-md"
              >
                <Text className="text-white font-semibold text-base">
                  Apply for Discount
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
