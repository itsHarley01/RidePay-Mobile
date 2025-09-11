// File: app/discount/index.tsx
import { getDiscountApplications } from '@/api/applyDiscount';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { getAuthData } from '@/utils/auth';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return '#22c55e';
      case 'rejected':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'pending':
        return 'time';
      default:
        return 'help-circle';
    }
  };

  const isExpiringSoon = (expirationDate: string) => {
    if (!expirationDate) return false;
    const expiry = new Date(expirationDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (expirationDate: string) => {
    if (!expirationDate) return false;
    const expiry = new Date(expirationDate);
    const today = new Date();
    return expiry < today;
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 40,
        }}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 40,
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
          
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 28,
              fontWeight: '700',
              color: colors.text,
              letterSpacing: -0.5,
              marginBottom: 8,
            }}>
              Account Discounts
            </Text>
            <Text style={{
              fontSize: 16,
              color: colors.subtext,
              fontWeight: '400',
              lineHeight: 22,
            }}>
              Manage your discount applications
            </Text>
          </View>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 80,
          }}>
            <ActivityIndicator size="large" color="#0c2340" />
            <Text style={{
              color: colors.subtext,
              marginTop: 16,
              fontSize: 16,
              fontWeight: '400',
            }}>
              Loading your discounts...
            </Text>
          </View>
        ) : applications.length > 0 ? (
          // Applications List
          <View>
            {/* Summary Card */}
            <View style={{
              backgroundColor: theme === 'dark' ? 'rgba(12, 35, 64, 0.1)' : 'rgba(12, 35, 64, 0.05)',
              borderRadius: 16,
              padding: 20,
              marginBottom: 32,
              borderWidth: 1,
              borderColor: theme === 'dark' ? 'rgba(12, 35, 64, 0.2)' : 'rgba(12, 35, 64, 0.1)',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="stats-chart" size={24} color="#0c2340" />
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.text,
                  marginLeft: 12,
                }}>
                  Summary
                </Text>
              </View>
              <Text style={{
                fontSize: 14,
                color: colors.subtext,
                lineHeight: 20,
              }}>
                You have {applications.length} discount application{applications.length !== 1 ? 's' : ''}
              </Text>
            </View>

            {/* Applications */}
            {applications.map((app, index) => {
              const statusColor = getStatusColor(app.status.status);
              const statusIcon = getStatusIcon(app.status.status);
              const expiring = app.status.discountExpiration && isExpiringSoon(app.status.discountExpiration);
              const expired = app.status.discountExpiration && isExpired(app.status.discountExpiration);

              return (
                <View
                  key={app.id}
                  style={{
                    backgroundColor: colors.secondaryBackground || (theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff'),
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  }}
                >
                  {/* Header */}
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: '#0c2340',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                      }}>
                        <FontAwesome5 name="ticket-alt" size={18} color="white" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 18,
                          fontWeight: '700',
                          color: colors.text,
                          marginBottom: 2,
                        }}>
                          {app.category.charAt(0).toUpperCase() + app.category.slice(1)} Discount
                        </Text>
                        <Text style={{
                          fontSize: 12,
                          color: colors.subtext,
                          fontWeight: '500',
                        }}>
                          ID: {app.id}
                        </Text>
                      </View>
                    </View>

                    {/* Status Badge */}
                    <View style={{
                      backgroundColor: statusColor + '20',
                      borderRadius: 20,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                      <Ionicons name={statusIcon as any} size={14} color={statusColor} />
                      <Text style={{
                        color: statusColor,
                        fontSize: 12,
                        fontWeight: '600',
                        marginLeft: 6,
                        textTransform: 'capitalize',
                      }}>
                        {app.status.status}
                      </Text>
                    </View>
                  </View>

                  {/* Details */}
                  <View style={{ gap: 12 }}>
                    {/* Application Date */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="calendar" size={16} color={colors.subtext} />
                      <Text style={{
                        fontSize: 14,
                        color: colors.subtext,
                        marginLeft: 8,
                      }}>
                        Applied: {new Date(app.status.dateOfApplication).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>

                    {/* Expiration Date */}
                    {app.status.discountExpiration && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons 
                          name="alarm" 
                          size={16} 
                          color={expired ? '#ef4444' : expiring ? '#f59e0b' : colors.subtext} 
                        />
                        <Text style={{
                          fontSize: 14,
                          color: expired ? '#ef4444' : expiring ? '#f59e0b' : colors.subtext,
                          marginLeft: 8,
                          fontWeight: expired || expiring ? '600' : '400',
                        }}>
                          {expired ? 'Expired: ' : 'Expires: '}
                          {new Date(app.status.discountExpiration).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                          {expiring && !expired && ' (Soon)'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Warning for expiring/expired */}
                  {(expiring || expired) && (
                    <View style={{
                      backgroundColor: (expired ? '#ef4444' : '#f59e0b') + '15',
                      borderRadius: 8,
                      padding: 12,
                      marginTop: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                      <Ionicons 
                        name="warning" 
                        size={16} 
                        color={expired ? '#ef4444' : '#f59e0b'} 
                      />
                      <Text style={{
                        fontSize: 13,
                        color: expired ? '#ef4444' : '#f59e0b',
                        marginLeft: 8,
                        fontWeight: '500',
                        flex: 1,
                      }}>
                        {expired 
                          ? 'This discount has expired' 
                          : 'This discount expires soon. Consider renewing your application.'
                        }
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}


          </View>
        ) : (
          // Empty State
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 80,
            paddingHorizontal: 32,
          }}>
            {/* Empty State Icon */}
            <View style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 32,
              borderWidth: 2,
              borderColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
              borderStyle: 'dashed',
            }}>
              <FontAwesome5 name="ticket-alt" size={48} color="#f59e0b" />
            </View>

            {/* Empty State Text */}
            <Text style={{
              fontSize: 24,
              fontWeight: '700',
              color: colors.text,
              textAlign: 'center',
              marginBottom: 12,
              letterSpacing: -0.3,
            }}>
              No Discount Applications
            </Text>

            <Text style={{
              fontSize: 16,
              color: colors.subtext,
              textAlign: 'center',
              lineHeight: 24,
              marginBottom: 40,
            }}>
              You haven't applied for any discounts yet.{'\n'}Start saving money today!
            </Text>

            {/* Apply Button */}
            <TouchableOpacity
              onPress={() => router.push('/discount/apply')}
              style={{
                backgroundColor: '#0c2340',
                borderRadius: 16,
                paddingVertical: 18,
                paddingHorizontal: 32,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#0c2340',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <FontAwesome5 name="plus" size={16} color="white" />
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '600',
                marginLeft: 12,
                letterSpacing: 0.3,
              }}>
                Apply for Discount
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}