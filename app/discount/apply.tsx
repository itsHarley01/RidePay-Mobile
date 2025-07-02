// File: app/discount/apply.tsx
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

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

  return (
    <View className="flex-1 bg-white px-4 pt-12 pb-6">
      <TouchableOpacity onPress={goBack} className="mb-4">
        <FontAwesome5 name="arrow-left" size={20} color="#0A2A54" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {step === 1 && (
          <View>
            <Text className="text-xl font-bold mb-4 text-center text-[#0c2340]">
              Privacy & Terms
            </Text>
            <Text className="mb-6 text-gray-700">
              By continuing, you agree to our Terms of Service, Privacy Policy, and consent to data
              processing.
            </Text>
            <TouchableOpacity
              onPress={goNext}
              className="bg-[#0c2340] py-3 rounded items-center"
            >
              <Text className="text-white font-semibold">Agree & Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text className="text-xl font-bold mb-6 text-center text-[#0c2340]">
              Select Discount Type
            </Text>
            {['Student', 'PWD', 'Senior'].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => handleSelectType(type)}
                className="border border-[#0c2340] p-4 rounded mb-3 bg-white shadow-md"
              >
                <Text className="text-center text-lg text-[#0c2340] font-semibold">
                  {type} Discount
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 3 && (
          <View>
            <Text className="text-xl font-bold mb-4 text-center text-[#0c2340]">
              Upload Proof
            </Text>
            <Text className="text-center text-gray-600 mb-6">
              Please upload a valid photo as proof for your selected discount.
            </Text>
            <TouchableOpacity className="bg-yellow-500 p-4 rounded mb-3 items-center">
              <Text className="text-white font-semibold">Take a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-yellow-500 p-4 rounded mb-6 items-center">
              <Text className="text-white font-semibold">Upload from Device</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goNext}
              className="bg-[#0c2340] py-3 rounded items-center"
            >
              <Text className="text-white font-semibold">Next</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 4 && (
          <View>
            <Text className="text-xl font-bold mb-4 text-center text-[#0c2340]">
              Review Information
            </Text>
            <Text className="text-gray-700 mb-4 text-center">
              Please confirm the details below before submitting your application.
            </Text>
            <View className="bg-gray-100 rounded p-4 mb-6">
              <Text className="text-base mb-2">Name: John Doe</Text>
              <Text className="text-base mb-2">Email: john@example.com</Text>
              <Text className="text-base mb-2">Discount Type: Student</Text>
            </View>
            <TouchableOpacity
              onPress={goNext}
              className="bg-[#0c2340] py-3 rounded items-center"
            >
              <Text className="text-white font-semibold">Submit</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 5 && (
          <View className="justify-center items-center mt-20">
            <Text className="text-2xl font-bold text-green-600 mb-4">Successfully Submitted!</Text>
            <Text className="text-center text-gray-700 px-4 mb-6">
              Your application has been received. You will be notified once it has been reviewed and
              approved. Thank you!
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/home')}
              className="bg-[#0c2340] py-3 px-6 rounded"
            >
              <Text className="text-white font-semibold text-lg">Go Back Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
