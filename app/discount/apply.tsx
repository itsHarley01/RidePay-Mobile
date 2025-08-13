// File: app/discount/apply.tsx
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import AnimatedCircularProgress from '@/components/AnimatedCircularProgress';
import { getAuthData } from '@/utils/auth';
import { submitDiscountApplication } from '@/api/applyDiscount';

const stepsTotal = 6;

export default function DiscountApply() {
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<any>({});
  const [files, setFiles] = useState<Record<string, any>>({});
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      const { uid } = await getAuthData();
      setUserId(uid || null);
    };
    fetchUserId();
  }, []);

  const toCamelCase = (str: string) => {
  return str
    .replace(/[^a-zA-Z0-9 ]/g, '') // remove special chars
    .split(' ')
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toLowerCase() + word.slice(1)
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');
};


  const goBack = () => {
    if (step === 1) router.back();
    else setStep(step - 1);
  };

  const goNext = () => setStep(step + 1);

  const handleSelectType = (type: string) => {
    setCategory(type.toLowerCase()); // 'student', 'pwd', or 'senior'
    setStep(3);
  };

const handleFileSelect = async (fieldName: string, fromCamera: boolean = false) => {
  let permissionResult;
  if (fromCamera) {
    permissionResult = await ImagePicker.requestCameraPermissionsAsync();
  } else {
    permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  }

  if (!permissionResult.granted) {
    Alert.alert('Permission required', `You need to allow access to ${fromCamera ? 'camera' : 'photo library'}`);
    return;
  }

  const result = fromCamera
    ? await ImagePicker.launchCameraAsync({ quality: 1 })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });

  if (!result.canceled) {
    const uri = result.assets[0].uri;

    // force camelCase key
    const camelKey = toCamelCase(fieldName);

    setFiles((prev) => ({
      ...prev,
      [camelKey]: { uri, name: `${camelKey}.jpg`, type: 'image/jpeg' },
    }));
  }
};


  const handleChange = (field: string, value: string) => {
    setApplicationData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
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
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setFiles([{ uri, name: 'proof.jpg', type: 'image/jpeg' }]);
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
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setFiles([{ uri, name: 'proof.jpg', type: 'image/jpeg' }]);
    }
  };

const handleSubmit = async () => {
  if (!userId || !category) {
    Alert.alert('Error', 'Missing required information.');
    return;
  }

  try {
    await submitDiscountApplication({
      userId,
      category,
      data: applicationData,
      files // ✅ keep files as a nested object
    });

    setStep(6);
  } catch (error) {
    console.error('Submit error:', error);
    Alert.alert('Error', 'Failed to submit application.');
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
          {/* Step 1: Privacy & Terms */}
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
                  By using this application, you agree to the collection...
                </Text>
              </ScrollView>
              <TouchableOpacity
                // disabled={!hasScrolledToBottom}
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

          {/* Step 2: Category */}
          {step === 2 && (
            <View className="items-center">
              <Text className="text-2xl font-bold text-[#0c2340] mb-4 text-center">Select Discount Type</Text>
              {['student', 'pwd', 'senior'].map((type) => (
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
            </View>
          )}

          {/* Step 3: Application Form */}
          {step === 3 && (
            <View className="items-center w-full px-4">
              {/* Common fields */}
              <View className="space-y-4 w-full max-w-xs mb-6">
                <TextInput placeholder="First Name" onChangeText={(v) => handleChange('firstName', v)} className="border border-gray-300 rounded-lg px-4 py-2" />
                <TextInput placeholder="Last Name" onChangeText={(v) => handleChange('lastName', v)} className="border border-gray-300 rounded-lg px-4 py-2" />
                <TextInput placeholder="Middle Name" onChangeText={(v) => handleChange('middleName', v)} className="border border-gray-300 rounded-lg px-4 py-2" />
                <TextInput placeholder="Age" keyboardType="numeric" onChangeText={(v) => handleChange('age', v)} className="border border-gray-300 rounded-lg px-4 py-2" />
                <TextInput placeholder="Gender" onChangeText={(v) => handleChange('gender', v)} className="border border-gray-300 rounded-lg px-4 py-2" />
                <TextInput placeholder="Contact Number" keyboardType="phone-pad" onChangeText={(v) => handleChange('contactNumber', v)} className="border border-gray-300 rounded-lg px-4 py-2" />
                <TextInput placeholder="Email" keyboardType="email-address" onChangeText={(v) => handleChange('email', v)} className="border border-gray-300 rounded-lg px-4 py-2" />
              </View>

              {/* Student extra fields */}
              {category === 'student' && (
                <View className="space-y-4 w-full max-w-xs mb-6">
                  <TextInput placeholder="School Name" onChangeText={(v) => handleChange('schoolName', v)} className="border border-gray-300 rounded-lg px-4 py-2" />
                  <TextInput placeholder="School Location" onChangeText={(v) => handleChange('schoolLocation', v)} className="border border-gray-300 rounded-lg px-4 py-2" />
                  <TextInput placeholder="School Year" onChangeText={(v) => handleChange('schoolYear', v)} className="border border-gray-300 rounded-lg px-4 py-2" />
                </View>
              )}

              <TouchableOpacity
                onPress={goNext}
                className="bg-[#0c2340] py-3 px-6 rounded-full w-full max-w-xs items-center"
              >
                <Text className="text-white font-semibold">Next</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={goBack}
                className="mt-2 py-2 px-4 border border-gray-400 rounded-full w-full max-w-xs items-center"
              >
                <Text className="text-gray-700 font-medium">Back</Text>
              </TouchableOpacity>
            </View>
          )}

{step === 4 && (
  <View className="items-center">
    {(() => {
      const categoryFields: Record<string, string[]> = {
        student: ['Proof of Enrollment'],
        pwd: ['PWD ID Front'],
        senior: ['Senior ID Front'],
      };

      const fields = categoryFields[category] || [];

      return fields.map((label) => {
        const fieldName = label
          .replace(/\s+/g, '') 
          .replace(/[^a-zA-Z0-9]/g, '') 
          .replace(/^[A-Z]/, (m) => m.toLowerCase());

        return (
          <View key={label} className="mb-6 w-full max-w-xs">
            <Text className="font-semibold mb-2">{label}</Text>

            {/* Image preview */}
            {files[fieldName]?.uri && (
              <Image
                source={{ uri: files[fieldName].uri }}
                style={{ width: '100%', height: 200, borderRadius: 8, marginBottom: 10 }}
                resizeMode="cover"
              />
            )}

<TouchableOpacity
  onPress={() => handleFileSelect(label, true)}
  className="bg-yellow-500 p-4 rounded-full mb-3"
>
  <Text className="text-white text-center">Take Photo</Text>
</TouchableOpacity>

<TouchableOpacity
  onPress={() => handleFileSelect(label)}
  className="bg-yellow-500 p-4 rounded-full mb-3"
>
  <Text className="text-white text-center">Upload from Device</Text>
</TouchableOpacity>

          </View>
        );
      });
    })()}

    {/* Step navigation */}
    <TouchableOpacity
      onPress={() => {
        const categoryFields: Record<string, string[]> = {
          student: ['Proof of Enrollment'],
          pwd: ['PWD ID Front'],
          senior: ['Senior ID Front'],
        };
        const fields = categoryFields[category] || [];
        const hasAllImages = fields.every((label) => {
          const fieldName = label
            .replace(/\s+/g, '') 
            .replace(/[^a-zA-Z0-9]/g, '') 
            .replace(/^[A-Z]/, (m) => m.toLowerCase());
          return !!files[fieldName]?.uri;
        });

        // if (!hasAllImages) {
        //   Alert.alert('Missing File', 'Please upload all required images before continuing.');
        //   return;
        // }
        goNext();
      }}
      className="bg-[#0c2340] py-3 px-6 rounded-full w-full max-w-xs items-center"
    >
      <Text className="text-white font-semibold">Next</Text>
    </TouchableOpacity>
  </View>
)}

          {/* Step 5: Review & Submit */}
          {step === 5 && (
            <View className="items-center">
              <Text className="text-2xl font-bold text-center text-[#0c2340] mb-2">Review Information</Text>
              <View className="bg-gray-100 rounded-xl p-4 w-full max-w-sm mb-6">
                {Object.entries(applicationData).map(([key, value]) => (
                  <Text key={key} className="text-base mb-1">
                    {key}: {value}
                  </Text>
                ))}
              </View>
              <TouchableOpacity onPress={handleSubmit} className="bg-[#0c2340] py-3 px-6 rounded-full w-full max-w-xs items-center">
                <Text className="text-white font-semibold">Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={goBack} className="mt-2 py-2 px-4 border border-gray-400 rounded-full w-full max-w-xs items-center">
                <Text className="text-gray-700 font-medium">Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 6: Success */}
          {step === 6 && (
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600 mb-4 text-center">Successfully Submitted!</Text>
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
