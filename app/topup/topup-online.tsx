import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TopUpOnline() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const accountName = 'John Harley Aparece';
  const accountNumber = '1234-5678-9012';
  const [selectedMethod, setSelectedMethod] = useState('');


  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1 pt-16">
      {/* Back Button */}
      <View className="absolute top-12 left-4 z-10">
        <TouchableOpacity
          onPress={() => {
            if (step === 1) {
              router.back();
            } else {
              setStep(prev => prev - 1);
            }
          }}
          className="flex-row items-center space-x-2"
        >
          <FontAwesome5 name="arrow-left" size={20} color={colors.subtext} />
        </TouchableOpacity>
      </View>

      {/* Step 1: Amount Selection */}
      {step === 1 && (
        <>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 120 }}
          >
            <Text style={{ color: colors.text }} className="text-2xl font-bold mb-2">
              Top-Up Online
            </Text>

            {/* Account Info */}
            <View className="space-y-1">
              <Text style={{ color: colors.text }} className="text-lg font-semibold">
                Account Name:
              </Text>
              <Text style={{ color: colors.subtext }} className="text-base">
                {accountName}
              </Text>
              <Text style={{ color: colors.subtext }} className="text-base">
                {accountNumber}
              </Text>
            </View>

            {/* Divider */}
            <View className="border-t border-gray-400 my-4" />

            <View className="flex-row justify-between">
              <Text style={{ color: colors.text }} className="text-lg font-semibold">
                Current Balance:
              </Text>
              <Text style={{ color: colors.text }} className="text-lg font-semibold">
                ₱56.00
              </Text>
            </View>

            {/* Divider */}
            <View className="border-t border-gray-400 my-4" />

            {/* Amount Buttons */}
            <View>
              <Text style={{ color: colors.text }} className="text-lg font-semibold mb-2">
                Choose Amount
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {[50, 100, 200, 500, 1000].map((amt) => {
                  const isSelected = amount === String(amt);
                  return (
                    <TouchableOpacity
                      key={amt}
                      onPress={() => setAmount(String(amt))}
                      className={`px-5 py-3 rounded-lg ${
                        isSelected ? 'border-2' : 'border'
                      }`}
                      style={{
                        backgroundColor: isSelected
                          ? colors.accent
                          : theme === 'dark'
                          ? '#1e1e1e'
                          : '#f0f0f0',
                        borderColor: isSelected ? colors.accent : '#ccc',
                      }}
                    >
                      <Text
                        style={{
                          color: colors.text,
                          fontWeight: '600',
                        }}
                      >
                        ₱{amt.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Sticky Continue Button */}
          <View className="absolute bottom-4 left-6 right-6">
            <TouchableOpacity
              onPress={() => setStep(2)}
              className={`p-4 rounded-lg items-center ${
                amount ? 'bg-[#0c2340]' : 'bg-gray-400'
              }`}
              disabled={!amount}
            >
              <Text className="text-white text-lg font-semibold">Continue</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

     {step === 2 && (
  <>
    <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
      <Text style={{ color: colors.text }} className="text-2xl font-bold mb-6">
        Select Payment Method
      </Text>

      {/* E-Wallet Section */}
      <View className="mb-6">
        <Text style={{ color: colors.subtext }} className="text-lg font-semibold mb-3">
          E-Wallet
        </Text>

        <TouchableOpacity
          onPress={() => setSelectedMethod('gcash')}
          style={{
            backgroundColor: colors.background,
            elevation: 3,
            borderColor: selectedMethod === 'gcash' ? colors.accent : 'transparent',
            borderWidth: 2,
          }}
          className="p-5 rounded-xl shadow flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <Image source={require('@/assets/images/gcash-logo.png')} style={styles.logo} />
            <View className="ml-4">
              <Text style={{ color: colors.text }} className="text-lg font-semibold">
                GCash
              </Text>
              <Text style={{ color: colors.subtext }} className="text-sm">
                Pay via mobile wallet
              </Text>
            </View>
          </View>
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: colors.accent,
              backgroundColor: selectedMethod === 'gcash' ? colors.accent : 'transparent',
            }}
          />
        </TouchableOpacity>
      </View>

      {/* Bank / Card Section */}
      <View>
        <Text style={{ color: colors.subtext }} className="text-lg font-semibold mb-3">
          Bank / Card
        </Text>

        <View className="space-y-4">
          {/* Visa */}
          <TouchableOpacity
            onPress={() => setSelectedMethod('visa')}
            style={{
              backgroundColor: colors.background,
              elevation: 3,
              borderColor: selectedMethod === 'visa' ? colors.accent : 'transparent',
              borderWidth: 2,
            }}
            className="p-5 rounded-xl shadow flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Image source={require('@/assets/images/visa-logo.png')} style={styles.logo} />
              <View className="ml-4">
                <Text style={{ color: colors.text }} className="text-lg font-semibold">
                  Visa
                </Text>
                <Text style={{ color: colors.subtext }} className="text-sm">
                  Debit or Credit Card
                </Text>
              </View>
            </View>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: colors.accent,
                backgroundColor: selectedMethod === 'visa' ? colors.accent : 'transparent',
              }}
            />
          </TouchableOpacity>

          {/* Mastercard */}
          <TouchableOpacity
            onPress={() => setSelectedMethod('mastercard')}
            style={{
              backgroundColor: colors.background,
              elevation: 3,
              borderColor: selectedMethod === 'mastercard' ? colors.accent : 'transparent',
              borderWidth: 2,
            }}
            className="p-5 rounded-xl shadow flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Image source={require('@/assets/images/master-card.png')} style={styles.logo} />
              <View className="ml-4">
                <Text style={{ color: colors.text }} className="text-lg font-semibold">
                  Mastercard
                </Text>
                <Text style={{ color: colors.subtext }} className="text-sm">
                  Debit or Credit Card
                </Text>
              </View>
            </View>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: colors.accent,
                backgroundColor: selectedMethod === 'mastercard' ? colors.accent : 'transparent',
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>

    {/* Sticky Proceed Button */}
    <View className="absolute bottom-4 left-6 right-6">
      <TouchableOpacity
        onPress={() => setStep(3)}
        disabled={!selectedMethod}
        className={`p-4 rounded-lg items-center ${
          selectedMethod ? 'bg-[#0c2340]' : 'bg-gray-400'
        }`}
      >
        <Text className="text-white text-lg font-semibold">Proceed to Payment</Text>
      </TouchableOpacity>
    </View>
  </>
)}
      {/* Step 3: Receipt - keep unchanged for now */}
      {step === 3 && (
        <View className="flex-1 justify-center items-center px-6">
          <View style={{ backgroundColor: colors.background, elevation: 5  }} className=" p-6 rounded-2xl w-full max-w-md">
            <View className="items-center mb-4">
              <FontAwesome5 name="receipt" size={36} color={colors.subtext} />
              <Text style={{ color: colors.text }} className="text-xl font-bold mt-2">
                Payment Successful
              </Text>
              <Text style={{ color: colors.subtext }} className="text-center mt-1">
                Your top-up was completed.
              </Text>
            </View>

            <View className="mt-4 space-y-2">
              <View className="flex-row justify-between">
                <Text style={{ color: colors.subtext }}>Name:</Text>
                <Text style={{ color: colors.text }}>{accountName}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.subtext }}>Account #:</Text>
                <Text style={{ color: colors.text }}>{accountNumber}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.subtext }}>Amount:</Text>
                <Text style={{ color: colors.text }}>₱{amount}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.subtext }}>Ref #:</Text>
                <Text style={{ color: colors.text }}>TUP-20250712</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.replace('/home')}
              className="bg-[#0c2340] p-3 rounded-lg items-center mt-6"
            >
              <Text className="text-white font-semibold text-base">Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
});
