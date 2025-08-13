// File: app/discount/apply.tsx
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Image,
} from 'react-native';
import AnimatedCircularProgress from '@/components/AnimatedCircularProgress';

const stepsTotal = 5;


export default function DiscountApply() {
  const [step, setStep] = useState(1);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const goBack = () => {
    if (step === 1) router.back();
    else setStep(step - 1);
  };

  const goNext = () => setStep(step + 1);

  const handleSelectType = (type: string) => {
    // Optional: Save selected type in state later
    setStep(3);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'You need to allow access to photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'You need to allow access to camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const progress = Math.round((step / stepsTotal) * 100);

  return (
    <View className="flex-1 bg-white px-6 pt-12 pb-6">
      {/* Back Button */}
      <TouchableOpacity onPress={goBack} className="absolute top-12 left-4 z-10">
        <FontAwesome5 name="arrow-left" size={20} color="#0A2A54" />
      </TouchableOpacity>

      {/* Radial Progress */}
      <View className="items-center mb-6">
        <AnimatedCircularProgress progress={progress} />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View className="space-y-6">
          {step === 1 && (
  <View className="items-center flex-1">
    <Text className="text-2xl font-bold text-[#0c2340] mb-4 text-center">
      Privacy & Terms
    </Text>

    <ScrollView
      style={{
        maxHeight: 300,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        backgroundColor: "#f9f9f9",
        marginBottom: 16,
      }}
      onScroll={(e) => {
        const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
        const isScrolledToBottom =
          contentOffset.y + layoutMeasurement.height >= contentSize.height - 10;
        if (isScrolledToBottom) setHasScrolledToBottom(true);
      }}
      scrollEventThrottle={16}
    >
      <Text className="text-gray-700 text-sm leading-relaxed">
        By using this application, you agree to the collection, processing,
        and storage of your personal information for the purpose of verifying
        your eligibility for transportation fare discounts.  
        {"\n\n"}
        We may collect details such as your name, email address, date of birth,
        contact information, and identification documents. This information will
        be used solely for validation purposes and will not be shared with third
        parties, except where required by law.  
        {"\n\n"}
        All data will be stored securely and processed in accordance with
        applicable privacy laws. You may request the deletion of your data by
        contacting our support team. However, deleting your data will revoke any
        active discount privileges.  
        {"\n\n"}
        By continuing, you confirm that you have read, understood, and agreed to
        our Terms of Service and Privacy Policy.
      </Text>
    </ScrollView>

    <TouchableOpacity
      disabled={!hasScrolledToBottom}
      onPress={goNext}
      className={`py-3 px-6 rounded-full w-full max-w-xs items-center ${
        hasScrolledToBottom ? "bg-[#0c2340]" : "bg-gray-400"
      }`}
    >
      <Text className="text-white font-semibold">
        {hasScrolledToBottom ? "Agree & Continue" : "Scroll to Read All"}
      </Text>
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

              <TouchableOpacity
                onPress={takePhoto}
                className="bg-yellow-500 p-4 rounded-full w-full max-w-xs mb-3 items-center"
              >
                <Text className="text-white font-semibold">Take a Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={pickImage}
                className="bg-yellow-500 p-4 rounded-full w-full max-w-xs mb-3 items-center"
              >
                <Text className="text-white font-semibold">Upload from Device</Text>
              </TouchableOpacity>

              {imageUri && (
                <Image
                  source={{ uri: imageUri }}
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 12,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: '#ccc',
                  }}
                />
              )}

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
