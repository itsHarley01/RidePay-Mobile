// File: app/discount/apply.tsx
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCircularProgress from '@/components/AnimatedCircularProgress';

const stepsTotal = 5;

export default function DiscountApply() {
  const [step, setStep] = useState(1);

  const goBack = () => {
    if (step === 1) router.back();
    else setStep(step - 1);
  };

  const goNext = () => setStep(step + 1);

  const handleSelectType = (type: string) => {
    // Optional: Save selected type in state later
    setStep(3);
  };

  const progress = Math.round((step / stepsTotal) * 100);

  return (
    <View className="flex-1 bg-white px-6 pt-12 pb-6">
      {/* Back Button */}
      <TouchableOpacity onPress={goBack} className="absolute top-12 left-4 z-10">
        <FontAwesome5 name="arrow-left" size={20} color="#0A2A54" />
      </TouchableOpacity>

      {/* Radial Progress (Simplified) */}
      <View className="items-center mb-6">
        <AnimatedCircularProgress progress={progress} />

      </View>

      {/* Form Content */}
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View className="space-y-6">
          {step === 1 && (
            <View className="items-center">
              <Text className="text-2xl font-bold text-[#0c2340] mb-2 text-center">Privacy & Terms</Text>
              <Text className="text-center text-gray-700 mb-6 px-4">
                By continuing, you agree to our Terms of Service, Privacy Policy, and consent to data
                processing.
              </Text>
              <TouchableOpacity
                onPress={goNext}
                className="bg-[#0c2340] py-3 px-6 rounded-full w-full max-w-xs items-center"
              >
                <Text className="text-white font-semibold">Agree & Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View className="items-center">
              <Text className="text-2xl font-bold text-[#0c2340] mb-4 text-center">Select Discount Type</Text>
              {['Student', 'PWD', 'Senior'].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleSelectType(type)}
                  className="border border-[#0c2340] p-4 rounded-full w-full max-w-xs mb-3 bg-white shadow-sm"
                >
                  <Text className="text-center text-lg text-[#0c2340] font-semibold">
                    {type} Discount
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={goNext}
                className="bg-[#0c2340] py-3 px-6 rounded-full w-full max-w-xs items-center"
              >
                <Text className="text-white font-semibold">Next</Text>
              </TouchableOpacity>
              <TouchableOpacity
              onPress={goBack}
              className="mt-2 py-2 px-4 border border-gray-400 rounded-full w-full max-w-xs items-center">
              <Text className="text-gray-700 font-medium">Back</Text>
              </TouchableOpacity>
            </View>
          )}
         
          {step === 3 && (
            <View className="items-center">
              <Text className="text-2xl font-bold text-center text-[#0c2340] mb-2">Upload Proof</Text>
              <Text className="text-center text-gray-600 mb-6 px-4">
                Please upload a valid photo as proof for your selected discount.
              </Text>
              <TouchableOpacity className="bg-yellow-500 p-4 rounded-full w-full max-w-xs mb-3 items-center">
                <Text className="text-white font-semibold">Take a Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-yellow-500 p-4 rounded-full w-full max-w-xs mb-6 items-center">
                <Text className="text-white font-semibold">Upload from Device</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={goNext}
                className="bg-[#0c2340] py-3 px-6 rounded-full w-full max-w-xs items-center"
              >
                <Text className="text-white font-semibold">Next</Text>
              </TouchableOpacity>
              <TouchableOpacity
              onPress={goBack}
              className="mt-2 py-2 px-4 border border-gray-400 rounded-full w-full max-w-xs items-center">
              <Text className="text-gray-700 font-medium">Back</Text>
              </TouchableOpacity>
            </View>
          )}
          

          {step === 4 && (
            <View className="items-center">
              <Text className="text-2xl font-bold text-center text-[#0c2340] mb-2">
                Review Information
              </Text>
              <Text className="text-gray-700 text-center mb-4 px-4">
                Please confirm the details below before submitting your application.
              </Text>
              <View className="bg-gray-100 rounded-xl p-4 w-full max-w-sm mb-6">
                <Text className="text-base mb-1">Name: John Doe</Text>
                <Text className="text-base mb-1">Email: john@example.com</Text>
                <Text className="text-base">Discount Type: Student</Text>
              </View>
              <TouchableOpacity
                onPress={goNext}
                className="bg-[#0c2340] py-3 px-6 rounded-full w-full max-w-xs items-center"
              >
                <Text className="text-white font-semibold">Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
              onPress={goBack}
              className="mt-2 py-2 px-4 border border-gray-400 rounded-full w-full max-w-xs items-center">
              <Text className="text-gray-700 font-medium">Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 5 && (
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600 mb-4 text-center">Successfully Submitted!</Text>
              <Text className="text-center text-gray-700 mb-6 px-4">
                Your application has been received. You will be notified once it has been reviewed and
                approved. Thank you!
              </Text>
              <TouchableOpacity
                onPress={() => router.replace('/(tabs)/home')}
                className="bg-[#0c2340] py-3 px-6 rounded-full w-full max-w-xs items-center"
              >
                <Text className="text-white font-semibold text-lg">Go Back Home</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
