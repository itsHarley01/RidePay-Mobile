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
  Linking
} from 'react-native';
import AnimatedCircularProgress from '@/components/AnimatedCircularProgress';
import { getAuthData } from '@/utils/auth';
import { submitDiscountApplication } from '@/api/applyDiscount';
import { checkDiscountApplication } from '@/api/checkDiscountApplication';
import { Modal } from 'react-native'; 

const stepsTotal = 6;

export default function DiscountApply() {
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<any>({});
  const [files, setFiles] = useState<Record<string, any>>({});
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
   const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [showModal, setShowModal] = useState(false)
  

useEffect(() => {
  const init = async () => {
    const { uid } = await getAuthData();
    if (!uid) return;

    setUserId(uid); 

    try {
      const status = await checkDiscountApplication(uid);
      if (status?.applied) {
        setAlreadyApplied(true);
        setShowModal(true);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No application found → proceed normally
        console.log("No discount application found for user.");
      } else {
        console.error('Error checking discount status:', err);
      }
    }
  };
  init();
}, []);

  if (alreadyApplied) {
  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-2xl w-80 items-center">
            <Text className="text-xl font-bold text-[#0c2340] mb-2">
              Discount Already Applied
            </Text>
            <Text className="text-gray-600 text-center mb-4">
              You have already submitted a discount application. Please wait for approval or check your status in the app.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                router.replace('/(tabs)/home'); // go back home
              }}
              className="bg-[#0c2340] py-3 px-6 rounded-full w-full items-center"
            >
              <Text className="text-white font-semibold">Go Back Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


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
  <View className="flex-1 items-center">
    <Text className="text-2xl font-bold text-[#0c2340] mb-4 text-center">
      Privacy & Terms
    </Text>

    <ScrollView
      style={{ maxHeight: 400 }}
      contentContainerStyle={{ paddingBottom: 20 }}
      onScroll={(e) => {
        const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
        const isScrolledToBottom =
          contentOffset.y + layoutMeasurement.height >= contentSize.height - 10;
        if (isScrolledToBottom) setHasScrolledToBottom(true);
      }}
      scrollEventThrottle={16}
    >
     <Text className="text-2xl font-bold mb-1 text-[#0c2340]">Privacy Policy</Text>
      <Text className="text-gray-500 mb-4">Last updated: August 14, 2025</Text>
       <Text className="text-gray-700 mb-4">
        This Privacy Policy describes Our policies and procedures on the collection, use and disclosure
        of Your information when You use the Service and tells You about Your privacy rightns and how the law protects You.
        We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and
        use of information in accordance with this Privacy Policy.
      </Text>

       {/* Section heading */}
      <Text className="text-xl font-semibold mt-6 mb-2">Interpretation and Definitions</Text>
      <Text className="text-lg font-semibold mb-1">Interpretation</Text>
      <Text className="text-gray-700 mb-4">
        The words of which the initial letter is capitalized have meanings defined under the following
        conditions. The following definitions shall have the same meaning regardless of whether they
        appear in singular or in plural.
      </Text>

      {/* Definitions */}
      <Text className="text-lg font-semibold mb-1">Definitions</Text>
      <Text className="text-gray-700 mb-2">For the purposes of this Privacy Policy:</Text>
      <View className="pl-4 mb-4">
        <Text className="text-gray-700 mb-1">• <Text className="font-semibold">Account</Text> means a unique account created for You to access our Service or parts of our Service.</Text>
        <Text className="text-gray-700 mb-1">• <Text className="font-semibold">Affiliate</Text> means an entity that controls, is controlled by or is under common control with a party...</Text>
        <Text className="text-gray-700 mb-1">• <Text className="font-semibold">Application</Text> refers to RidePay, the software program provided by the Company.</Text>
        <Text className="text-gray-700">• <Text className="font-semibold">Company</Text> refers to RidePay, Cebu City.</Text>
        <Text className="text-gray-700">• <Text className="font-semibold">Country</Text> refers to: Philippines.</Text>
        <Text className="text-gray-700">• <Text className="font-semibold">Device</Text> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</Text>
        <Text className="text-gray-700">• <Text className="font-semibold">Personal Data</Text> is any information that relates to an identified or identifiable individual.</Text>
        <Text className="text-gray-700">• <Text className="font-semibold">Service</Text> refers to the Application.</Text>
        <Text className="text-gray-700">• <Text className="font-semibold">Service Provider</Text> means any natural or legal person who processes the data on behalf of the Company...</Text>
        <Text className="text-gray-700">• <Text className="font-semibold">Usage Data</Text> refers to data collected automatically...</Text>
        <Text className="text-gray-700">• <Text className="font-semibold">You</Text> means the individual accessing or using the Service...</Text>
        {/* Continue the rest of the list in the same pattern */}
      </View>
      
      {/* Section: Collecting and Using Your Personal Data */}
      <Text className="text-xl font-semibold mt-6 mb-2">Collecting and Using Your Personal Data</Text>
      <Text className="text-lg font-semibold mb-1">Types of Data Collected</Text>

      <Text className="text-lg font-semibold mt-4 mb-1">Personal Data</Text>
      <Text className="text-gray-700 mb-2">
        While using Our Service, We may ask You to provide Us with certain personally identifiable
        information that can be used to contact or identify You. Personally identifiable information may
        include, but is not limited to:
      </Text>
      <View className="pl-4 mb-4 space-y-1">
        <Text className="text-gray-700">• Email address</Text>
        <Text className="text-gray-700">• First name and last name</Text>
        <Text className="text-gray-700">• Phone number</Text>
        <Text className="text-gray-700">• Address, State, Province, ZIP/Postal code, City</Text>
        <Text className="text-gray-700">• Usage Data</Text>
      </View>

       <Text className="text-lg font-semibold mb-1">Usage Data</Text>
      <Text className="text-gray-700 mb-4">
        Usage Data is collected automatically when using the Service. Usage Data may include
        information such as Your Device's IP address, browser type, browser version, the pages You
        visit, and other diagnostic data...
      </Text>

      
      <Text className="text-lg font-semibold mb-1">Information Collected while Using the Application</Text>
      <Text className="text-gray-700 mb-2">
        While using Our Application, in order to provide features of Our Application, We may collect,
        with Your prior permission:
      </Text>
      <View className="pl-4 mb-4 space-y-1">
        <Text className="text-gray-700">• Information regarding your location</Text>
        <Text className="text-gray-700">• Information from your Device's phone book (contacts list)</Text>
        <Text className="text-gray-700">• Pictures and other information from your Device's camera and photo library</Text>
      </View>

       {/* Section: Use of Your Personal Data */}
      <Text className="text-lg font-semibold mt-6 mb-1">Use of Your Personal Data</Text>
      <Text className="text-gray-700 mb-2">The Company may use Personal Data for the following purposes:</Text>
      <View className="pl-4 mb-4 space-y-1">
        <Text className="text-gray-700">• <Text className="font-semibold">To provide and maintain our Service</Text>, including monitoring usage.</Text>
        <Text className="text-gray-700">• <Text className="font-semibold">To manage Your Account</Text>: registration and account features.</Text>
        <Text className="text-gray-700">• <Text className="font-semibold">For the performance of a contract</Text>: processing purchases and agreements.</Text>
        <Text className="text-gray-700">• <Text className="font-semibold">To contact You</Text>: via email, calls, SMS, or push notifications.</Text>
        <Text className="text-gray-700">• <Text className="font-semibold">To provide You</Text> with news, offers, and updates.</Text>
        <Text className="text-gray-700">• <Text className="font-semibold">To manage Your requests</Text>.</Text>
        <Text className="text-gray-700">• <Text className="font-semibold">For business transfers</Text>.</Text>
        <Text className="text-gray-700">• <Text className="font-semibold">For other purposes</Text>: analytics, trends, and improvements.</Text>
      </View>

       {/* Section: Retention */}
      <Text className="text-lg font-semibold mt-6 mb-1">Retention of Your Personal Data</Text>
      <Text className="text-gray-700 mb-4">
        The Company will retain Your Personal Data only for as long as necessary...
      </Text>

      {/* Section: Transfer */}
      <Text className="text-lg font-semibold mb-1">Transfer of Your Personal Data</Text>
      <Text className="text-gray-700 mb-4">
        Your information may be transferred and maintained outside your jurisdiction...
      </Text>

      {/* Section: Delete */}
      <Text className="text-lg font-semibold mb-1">Delete Your Personal Data</Text>
      <Text className="text-gray-700 mb-4">
        You have the right to delete or request deletion of your personal data...
      </Text>

       {/* Section: Disclosure */}
      <Text className="text-lg font-semibold mb-1">Disclosure of Your Personal Data</Text>
      <Text className="text-gray-700 mb-4">Includes business transactions, law enforcement, and legal requirements...</Text>

      {/* Section: Security */}
      <Text className="text-lg font-semibold mb-1">Security of Your Personal Data</Text>
      <Text className="text-gray-700 mb-4">While we strive to protect your data, no method is 100% secure...</Text>

      {/* Section: Children's Privacy */}
      <Text className="text-xl font-semibold mt-6 mb-2">Children's Privacy</Text>
      <Text className="text-gray-700 mb-4">
        We do not knowingly collect data from anyone under 13...
      </Text>

      {/* Section: Links */}
      <Text className="text-xl font-semibold mt-6 mb-2">Links to Other Websites</Text>
      <Text className="text-gray-700 mb-4">
        Our Service may contain links to other websites...
      </Text>

      {/* Section: Changes */}
      <Text className="text-xl font-semibold mt-6 mb-2">Changes to this Privacy Policy</Text>
      <Text className="text-gray-700 mb-4">
        We may update this Privacy Policy from time to time...
      </Text>

      {/* Section: Contact */}
      <Text className="text-xl font-semibold mt-6 mb-2">Contact Us</Text>
      <View className="pl-4 mb-8">
        <Text
          className="text-blue-500 underline"
          onPress={() => Linking.openURL('mailto:ridepaymobile@gmail.com')}
        >
          ridepaymobile@gmail.com
        </Text>
      </View>
      
    </ScrollView>

    {/* Continue Button */}
    <TouchableOpacity
      disabled={!hasScrolledToBottom}
      onPress={goNext}
      className={`py-3 px-6 rounded-full w-full max-w-xs items-center ${
        hasScrolledToBottom ? 'bg-[#0c2340]' : 'bg-gray-400'
      }`}
    >
      <Text className="text-white font-semibold">
        {hasScrolledToBottom ? 'Agree & Continue' : 'Scroll to Read All'}
      </Text>
    </TouchableOpacity>
  </View>
)}

          {step === 2 && (
  <View className="items-center w-full px-4">
    <Text className="text-2xl font-bold text-[#0c2340] mb-6 text-center">
      Select Discount Type
    </Text>

    {[
      {
        type: 'student',
        label: 'Student Discount',
        desc: 'For enrolled students with valid school ID',
        icon: 'graduation-cap',
        color: '#2563EB',
      },
      {
        type: 'pwd',
        label: 'PWD Discount',
        desc: 'For persons with disabilities with valid PWD ID',
        icon: 'wheelchair',
        color: '#D97706',
      },
      {
        type: 'senior',
        label: 'Senior Citizen Discount',
        desc: 'For senior citizens with valid senior ID',
        icon: 'id-card',
        color: '#059669',
      },
    ].map((item) => (
      <TouchableOpacity
        key={item.type}
        onPress={() => handleSelectType(item.type)}
        className="bg-white w-full max-w-sm p-5 rounded-2xl mb-4 shadow-md flex-row items-center"
        activeOpacity={0.85}
      >
        <View
          className="w-14 h-14 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: item.color + '20' }}
        >
          <FontAwesome5 name={item.icon as any} size={22} color={item.color} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-[#0c2340]">{item.label}</Text>
          <Text className="text-gray-500 text-sm">{item.desc}</Text>
        </View>
      </TouchableOpacity>
    ))}
  </View>
)}

          {/* Step 3: Application Form */}
       {step === 3 && (
  <View className="items-center w-full px-4">
    <Text className="text-xl font-bold text-[#0c2340] mb-4 text-center">
      Fill Out Your Details
    </Text>

    {/* Common Fields */}
    <View className="w-full max-w-sm mb-4">
      {[
        { placeholder: "First Name", key: "firstName", icon: "user" },
        { placeholder: "Last Name", key: "lastName", icon: "user" },
        { placeholder: "Middle Name", key: "middleName", icon: "user" },
        { placeholder: "Age", key: "age", keyboardType: "numeric", icon: "calendar" },
        { placeholder: "Gender", key: "gender", icon: "venus-mars" },
        { placeholder: "Contact Number", key: "contactNumber", keyboardType: "phone-pad", icon: "phone" },
        { placeholder: "Email", key: "email", keyboardType: "email-address", icon: "envelope" },
      ].map((field, idx) => (
        <View
          key={idx}
          className="flex-row items-center bg-gray-50 px-3 py-2 rounded-xl shadow-sm mb-2"
        >
          <FontAwesome5
            name={field.icon as any}
            size={16}
            color="#6B7280"
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder={field.placeholder}
            keyboardType={field.keyboardType || "default"}
            placeholderTextColor="#9CA3AF"
            onChangeText={(v) => handleChange(field.key, v)}
            className="flex-1 text-gray-800 text-sm"
          />
        </View>
      ))}
    </View>

    {/* Student Extra Fields */}
    {category === 'student' && (
      <View className="w-full max-w-sm mb-4">
        {[
          { placeholder: "School Name", key: "schoolName", icon: "school" },
          { placeholder: "School Location", key: "schoolLocation", icon: "map-marker-alt" },
          { placeholder: "School Year", key: "schoolYear", icon: "calendar-alt" },
        ].map((field, idx) => (
          <View
            key={idx}
            className="flex-row items-center bg-gray-50 px-3 py-2 rounded-xl shadow-sm mb-2"
          >
            <FontAwesome5
              name={field.icon as any}
              size={16}
              color="#6B7280"
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder={field.placeholder}
              placeholderTextColor="#9CA3AF"
              onChangeText={(v) => handleChange(field.key, v)}
              className="flex-1 text-gray-800 text-sm"
            />
          </View>
        ))}
      </View>
    )}

    {/* Buttons */}
    <View className="flex-row w-full max-w-sm justify-between mt-2">
      <TouchableOpacity
        onPress={goBack}
        className="flex-1 py-2 mr-2 border borde  r-gray-300 rounded-full items-center"
      >
        <Text className="text-gray-700 font-medium text-sm">Back</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={goNext}
        className="flex-1 py-2 ml-2 bg-[#0c2340] rounded-full items-center shadow-md"
      >
        <Text className="text-white font-semibold text-sm">Next</Text>
      </TouchableOpacity>
    </View>
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
