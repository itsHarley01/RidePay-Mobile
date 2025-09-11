  // File: app/discount/apply.tsx
  import { submitDiscountApplication } from '@/api/applyDiscount';
<<<<<<< HEAD
  import { checkDiscountApplication } from '@/api/checkDiscountApplication';
  import { KeyboardAvoidingView, Platform } from "react-native";
  import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

  import { Modal } from 'react-native'; 
=======
import { checkDiscountApplication } from '@/api/checkDiscountApplication';
import { fetchUserDataByUid } from '@/api/userApi';
import AnimatedCircularProgress from '@/components/AnimatedCircularProgress';
import { getAuthData } from '@/utils/auth';
import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
>>>>>>> cc1adf59cb553cbe9aa3016b925b94ce429198e0

  const stepsTotal = 6;

  // Add file requirements for each category
  const fileRequirements: Record<string, string[]> = {
    student: [
      "School ID",
    ],
    pwd: [
      "PWD ID",
      "Medical Certificate"
    ],
    senior: [
      "Senior Citizen ID",
      "Birth Certificate",
    ]
  };

  export default function DiscountApply() {
    const [userId, setUserId] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState<string | null>(null);
    const [applicationData, setApplicationData] = useState<any>({});
    const [files, setFiles] = useState<Record<string, any>>({});

    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [alreadyApplied, setAlreadyApplied] = useState(false);
    const [showModal, setShowModal] = useState(false)
    const [loadingUser, setLoadingUser] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showBirthdatePicker, setShowBirthdatePicker] = useState(false);
  const [showPwdDatePicker, setShowPwdDatePicker] = useState(false);
  const [showSeniorDatePicker, setShowSeniorDatePicker] = useState(false);

  // Auto-fill grade/year level based on current year
const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;
const autoSchoolYear = `${currentYear} - ${nextYear}`;
const [errors, setErrors] = useState<{ [key: string]: string }>({});



    const goBack = () => {
      if (step === 1) router.back();
      else setStep(step - 1);
    };

    const goNext = () => {
  const errors = validateStep();
  if (errors.length > 0) {
    Alert.alert("Validation Error", errors.join("\n"));
    return;
  }

  setStep(prev => prev + 1); // ✅ only proceed if no errors
};

const validateAllFields = () => {
  let valid = true;
  const newErrors: { [key: string]: string } = {};

  if (!applicationData.firstName?.trim()) {
    newErrors.firstName = "First name is required.";
    valid = false;
  }
  if (!applicationData.lastName?.trim()) {
    newErrors.lastName = "Last name is required.";
    valid = false;
  }
  if (!applicationData.contactNumber || !/^[0-9]{11}$/.test(applicationData.contactNumber)) {
    newErrors.contactNumber = "Contact number must be 11 digits.";
    valid = false;
  }
  if (!applicationData.email || !/^\S+@\S+\.\S+$/.test(applicationData.email)) {
    newErrors.email = "Enter a valid email address.";
    valid = false;
  }

  setErrors(newErrors);
  return valid;
};

const handleNext = () => {
  if (validateAllFields()) {
    setStep(step + 1); // ✅ only go to next step if all fields valid
  }
};

const validateField = (key: string, value: string) => {
  let message = "";

  switch (key) {
    case "firstName":
    case "lastName":
      if (!value.trim()) message = "This field is required.";
      break;

    case "schoolName":
      if (!value.trim()) message = "This field is required.";
      break;

    case "schoolLocation":
    if (!value.trim()) message = "This field is required.";
    break;

    case "email":
      if (!/^\S+@\S+\.\S+$/.test(value)) {
        message = "Enter a valid email address.";
      }
      break;

    case "idNum":
      if (!value.trim()) message = "Student ID is required.";
      break;
    
    case "pwdId":
      if (!value.trim()) message = "PWD ID is required.";
      break; 

    case "seniorId":
      if (!value.trim()) message = "Senior ID is required.";
      break;
     
  }

  setErrors((prev) => ({ ...prev, [key]: message }));
  return message === "";
};




useEffect(() => {
  if (category === "student") {
    setApplicationData(prev => ({
      ...prev,
      schoolYear: autoSchoolYear,
    }));
  }
}, [category]); // ✅ runs only when category changes


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
      <View className="flex-1 bg-white px-6 pt-12 pb-6">
        <Text className="text-2xl font-bold text-[#0c2340] mb-4 text-center">
          Discount Application Pending
        </Text>  

        <Text className="text-gray-600 text-center mb-6">
          Your application is currently under review. Please wait for approval.
        </Text>

        <View className="bg-gray-50 p-4 rounded-xl shadow-md mb-6">
          <Text className="text-lg font-semibold text-[#0c2340] mb-2">Submitted Details</Text>

          <Text className="text-gray-700">Name: {applicationData.firstName} {applicationData.lastName}</Text>
          <Text className="text-gray-700">Category: {category}</Text>

          {category === "student" && (
            <>
              <Text className="text-gray-700">School: {applicationData.schoolName}</Text>
              <Text className="text-gray-700">School Address: {applicationData.schoolLocation}</Text>
              <Text className="text-gray-700">Student ID: {applicationData.idNum}</Text>
              <Text className="text-gray-700">Grade Year/Level: {applicationData.schoolYear}</Text>
            </>
          )}
          {category === "pwd" && (
            <>
              <Text className="text-gray-700">PWD ID: {applicationData.pwdId}</Text>
              <Text className="text-gray-700">Issued At: {applicationData.pwdPlaceIssued}</Text>
            </>
          )}
          {category === "senior" && (
            <>
              <Text className="text-gray-700">Senior ID: {applicationData.seniorId}</Text>
              <Text className="text-gray-700">Issued At: {applicationData.seniorPlaceIssued}</Text>
            </>
          )}
        </View>

        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/home')}
          className="bg-[#0c2340] py-3 px-6 rounded-full items-center"
        >
          <Text className="text-white font-semibold">Go Back Home</Text>
        </TouchableOpacity>
      </View>
    );
  }



    useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) return;
      setLoadingUser(true);
      try {
        const data = await fetchUserDataByUid(userId);

        // ✅ Autofill email + contactNumber
        setApplicationData((prev: any) => ({
          ...prev,
          email: data.email || "",
          contactNumber: data.contactNumber || "",
        }));
      } catch (error) {
        console.error("❌ Failed to fetch user profile", error);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUserProfile();
  }, [userId]);

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

  const validateStep = () => {
  let errors: string[] = [];

  if (step === 3) {
    if (!applicationData.lastName) errors.push("Last Name is required");
    if (!applicationData.firstName) errors.push("First Name is required");
    if (!applicationData.middleName) errors.push("Middle Name is required");
    if (!applicationData.birthDate) {
      errors.push("Birthdate is required");
    } else {
      const today = new Date();
      const birthDate = new Date(applicationData.birthDate);

      // ❌ Future date not allowed
      if (birthDate > today) {
        errors.push("Birthdate cannot be in the future.");
      }

      // ❌ Year check
      const currentYear = today.getFullYear();
      if (birthDate.getFullYear() > currentYear) {
        errors.push("Birth year cannot exceed the current year.");
      }
    }

    if (category === "pwd") {
      if (!applicationData.pwdId) errors.push("PWD ID is required");
      if (!applicationData.pwdPlaceIssued) errors.push("Place of Issuance is required");
    }

    if (category === "student") {
      if (!applicationData.schoolName) errors.push("School Name is required");
      if (!applicationData.schoolLocation) errors.push("School Address is required");
      if (!applicationData.idNum) errors.push("Student ID is required");
      if (!applicationData.schoolYear) {
  errors.push("Year & Level is required");
} else {
  const expected = `${currentYear} - ${nextYear}`;
  if (applicationData.schoolYear !== expected) {
    errors.push(`Year & Level must be ${expected}`);
  }
}
    }

    if (category === "senior") {
      if (!applicationData.seniorId) errors.push("Senior ID is required");
      if (!applicationData.seniorPlaceIssued) errors.push("Place of Issuance is required");
    }
  }

  return errors;
};


  const handleSubmitWithLoading = async () => {
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);
    try {
      await handleSubmit();
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };



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


  const handleChange = (key: string, value: string) => {
  setApplicationData((prev) => {
    let updated = { ...prev, [key]: value };

    // ✅ Birthdate handling
    if (key === "birthDate") {
      const today = new Date();
      const birthDate = new Date(value);

      if (birthDate > today) {
        setErrors((prev) => ({
          ...prev,
          birthDate: "Birthdate cannot be in the future.",
        }));
        updated.age = "";
      } else {
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        updated.age = age.toString();

        setErrors((prev) => ({ ...prev, birthDate: "" }));
      }
    }

    // ✅ Date of Issuance handling
    if (key === "dateOfIssuance") {
      const today = new Date();
      const issuanceDate = new Date(value);

      if (issuanceDate > today) {
        setErrors((prev) => ({
          ...prev,
          dateOfIssuance: "Date of Issuance cannot be in the future.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, dateOfIssuance: "" }));
      }
    }

    return updated;
  });

  // Run validation for other fields
  if (key !== "birthDate" && key !== "dateOfIssuance") {
    validateField(key, value);
  }
};



  const pickImage = async (fieldName: string) => {
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
      const camelKey = toCamelCase(fieldName);

      setFiles((prev) => ({
        ...prev,
        [camelKey]: { uri, name: `${camelKey}.jpg`, type: 'image/jpeg' },
      }));
    }
  };

    const takePhoto = async (fieldName: string) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'You need to allow access to camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 1 });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const camelKey = toCamelCase(fieldName);

      setFiles((prev) => ({
        ...prev,
        [camelKey]: { uri, name: `${camelKey}.jpg`, type: 'image/jpeg' },
      }));
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

    function submitApplication(applicationData: any) {
      throw new Error('Function not implemented.');
    }

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
    disabled={!hasScrolledToBottom || isSubmitting}
    onPress={goNext}
    activeOpacity={0.7}
    className={`py-3 px-6 rounded-full w-full max-w-xs items-center ${
      hasScrolledToBottom && !isSubmitting ? 'bg-[#0c2340]' : 'bg-gray-400'
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
          <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : undefined}
    keyboardVerticalOffset={100} // adjust if needed for header/navbar
  >
    <KeyboardAwareScrollView
      enableOnAndroid
      extraScrollHeight={20} // pushes up a bit when focused
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
    <View className="items-center w-full px-4">
      <Text className="text-xl font-bold text-[#0c2340] mb-4 text-center">
        Fill Out Your Details
      </Text>

      {/* Common Fields */}
      <View className="w-full max-w-sm mb-4">
        {/* First Name */}
        <View className="flex-row items-center bg-gray-50 px-3 py-2 rounded-xl shadow-sm mb-2">
          <FontAwesome5 name="user" size={16} color="#6B7280" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="First Name"
            placeholderTextColor="#9CA3AF"
            onChangeText={(v) => handleChange("firstName", v)}
            className="flex-1 text-gray-800 text-sm"
          />
        </View>

        {/* Last Name */}
        <View className="flex-row items-center bg-gray-50 px-3 py-2 rounded-xl shadow-sm mb-2">
          <FontAwesome5 name="user" size={16} color="#6B7280" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Last Name"
            placeholderTextColor="#9CA3AF"
            onChangeText={(v) => handleChange("lastName", v)}
            className="flex-1 text-gray-800 text-sm"
          />
        </View>

        {/* Middle Name */}
        <View className="flex-row items-center bg-gray-50 px-3 py-2 rounded-xl shadow-sm mb-2">
          <FontAwesome5 name="user" size={16} color="#6B7280" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Middle Name"
            placeholderTextColor="#9CA3AF"
            onChangeText={(v) => handleChange("middleName", v)}
            className="flex-1 text-gray-800 text-sm"
          />
        </View>

  {/* Birthdate Picker */}
    <TouchableOpacity
      onPress={() => setShowBirthdatePicker(true)}
      className="flex-row items-center bg-gray-50 px-3 py-3 rounded-xl shadow-sm mb-2"
    >
      <FontAwesome5 name="calendar" size={16} color="#6B7280" style={{ marginRight: 8 }} />
      <Text className="flex-1 text-gray-800 text-sm">
        {applicationData.birthDate
          ? new Date(applicationData.birthDate).toLocaleDateString()
          : "Birthdate"}
      </Text>
    </TouchableOpacity>
    {errors.birthDate ? (
  <Text className="text-red-500 text-xs mt-1">{errors.birthDate}</Text>
) : null}

  {showBirthdatePicker && (
    <DateTimePicker
      value={applicationData.birthDate ? new Date(applicationData.birthDate) : new Date()}
      mode="date"
      display="default"
      onChange={(event: any, selectedDate?: Date) => {
        setShowBirthdatePicker(false);
        if (selectedDate) {
          const formatted = selectedDate.toISOString().split("T")[0];
          handleChange("birthDate", formatted);
        }
      }}
    />
  )}

        {/* Auto Age Display */}
        <View className="flex-row items-center bg-gray-50 px-3 py-2 rounded-xl shadow-sm mb-2">
          <FontAwesome5 name="birthday-cake" size={16} color="#6B7280" style={{ marginRight: 8 }} />
          <Text className="flex-1 text-gray-800 text-sm">
            {applicationData.age ? `${applicationData.age} years old` : "Age will appear here"}
          </Text>
        </View>

        
      {/* Gender */}
  <View className="flex-row items-center bg-gray-50 px-3 py-2 rounded-xl shadow-sm mb-2">
    <FontAwesome5 name="venus-mars" size={16} color="#6B7280" style={{ marginRight: 8 }} />
    
    <Picker
      selectedValue={applicationData.gender || ""}
      style={{ flex: 1, color: "#374151" }} // gray-700
      onValueChange={(value) => handleChange("gender", value)}
    >
      <Picker.Item label="Select Gender" value="" />
      <Picker.Item label="Male" value="Male" />
      <Picker.Item label="Female" value="Female" />
      <Picker.Item label="Other" value="Other" />
    </Picker>
  </View>


        {/* Contact Number */}
<View className="flex-row items-center bg-gray-50 px-3 py-2 rounded-xl shadow-sm mb-2">
  <FontAwesome5 name="phone" size={16} color="#6B7280" style={{ marginRight: 8 }} />
  <TextInput
    placeholder="Contact Number"
    keyboardType="phone-pad"
    placeholderTextColor="#9CA3AF"
    value={applicationData.contactNumber || ""}   // ✅ auto-filled
    editable={false}  // 🔒 make read-only
    className="flex-1 text-gray-800 text-sm"
  />
</View>

{/* Email */}
<View className="flex-row items-center bg-gray-50 px-3 py-2 rounded-xl shadow-sm mb-2">
  <FontAwesome5 name="envelope" size={16} color="#6B7280" style={{ marginRight: 8 }} />
  <TextInput
    placeholder="Email"
    keyboardType="email-address"
    placeholderTextColor="#9CA3AF"
    value={applicationData.email || ""}   // ✅ auto-filled
    editable={false}  // 🔒 make read-only
    className="flex-1 text-gray-800 text-sm"
  />
</View>

      </View>

      
      {/* Student Extra Fields */}
{category === "student" && (
  <View className="w-full max-w-sm mb-4">
    {[
      { placeholder: "School Name", key: "schoolName", icon: "school", editable: true },
      { placeholder: "School Address", key: "schoolLocation", icon: "map-marker-alt", editable: true },
      { placeholder: "Student #ID", key: "idNum", icon: "id-card", editable: true,  },
      { placeholder: "Year & Level", key: "schoolYear", icon: "graduation-cap", editable: false }, // auto-filled
    ].map((field, idx) => (
      <View key={idx} className="mb-2">
        <View className="flex-row items-center bg-gray-50 px-3 py-2 rounded-xl shadow-sm">
          <FontAwesome5 name={field.icon as any} size={16} color="#6B7280" style={{ marginRight: 8 }} />
          <TextInput
  placeholder={field.placeholder}
  placeholderTextColor="#9CA3AF"
  value={applicationData[field.key] || ""}
  onChangeText={(v) =>
    handleChange(
      field.key,
      field.key === "idNum" ? v.replace(/[^0-9]/g, "") : v
    )
  }
  editable={field.editable}
  keyboardType={field.key === "idNum" ? "numeric" : "default"} // ✅ digits only for Student ID
  className="flex-1 text-gray-800 text-sm"
/>
        </View>
        {errors[field.key] ? (
          <Text className="text-red-500 text-xs mt-1">{errors[field.key]}</Text>
        ) : null}
      </View>
    ))}
  </View>
)}

      {/* PWD Extra Fields */}
      {category === 'pwd' && (
  <View className="w-full max-w-sm mb-4">
    {[
      { placeholder: "PWD ID #", key: "pwdId", icon: "id-card" },
      { placeholder: "Place of Issuance", key: "pwdPlaceIssued", icon: "map-marker-alt" },
    ].map((field, idx) => (
      <View key={idx} className="mb-3">
        
        {/* Input container */}
        <View className="flex-row items-center bg-gray-50 px-3 py-2 rounded-xl shadow-sm">
          <FontAwesome5
            name={field.icon as any}
            size={16}
            color="#6B7280"
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder={field.placeholder}
            placeholderTextColor="#9CA3AF"
            value={applicationData[field.key] || ""}
            onChangeText={(v) =>
              handleChange(
                field.key,
                field.key === "pwdId" ? v.replace(/[^0-9]/g, "") : v
              )
            }
            editable={field.editable}
            keyboardType={field.key === "pwdId" ? "numeric" : "default"}
            className="flex-1 text-gray-800 text-sm"
          />
        </View>
        {errors[field.key] ? (
          <Text className="text-red-500 text-xs mt-1">{errors[field.key]}</Text>
        ) : null}
            </View> 
          ))}

          {/* Date of Issuance */}
          <TouchableOpacity
    onPress={() => setShowPwdDatePicker(true)}
    className="flex-row items-center bg-gray-50 px-3 py-3 rounded-xl shadow-sm mb-2"
  >
    <FontAwesome5 name="calendar" size={16} color="#6B7280" style={{ marginRight: 8 }} />
    <Text className="flex-1 text-gray-800 text-sm">
      {applicationData.pwdDateIssued
        ? new Date(applicationData.pwdDateIssued).toLocaleDateString()
        : "Date of Issuance"}
    </Text>
  </TouchableOpacity>

  {showPwdDatePicker && (
    <DateTimePicker
      value={applicationData.pwdDateIssued ? new Date(applicationData.pwdDateIssued) : new Date()}
      mode="date"
      display="default"
      onChange={(event: any, selectedDate?: Date) => {
        setShowPwdDatePicker(false);
        if (selectedDate) {
          const formatted = selectedDate.toISOString().split("T")[0];
          handleChange("pwdDateIssued", formatted);
          validateField("pwdDateIssued", formatted);
        }
        {errors.pwdDateIssued ? (
  <Text className="text-red-500 text-xs mt-1">{errors.pwdDateIssued}</Text>
) : null}
      }}
      
    />
  )}
        </View>  
      )}

      {/* Senior Extra Fields */}
     {category === 'senior' && (
  <View className="w-full max-w-sm mb-4">
    {[
      { placeholder: "Senior ID #", key: "seniorId", icon: "id-card" },
      { placeholder: "Place of Issuance", key: "seniorPlaceIssued", icon: "map-marker-alt" },
    ].map((field, idx) => (
      <View key={idx} className="mb-3">
        
        {/* Input container */}
        <View className="flex-row items-center bg-gray-50 px-3 py-2 rounded-xl shadow-sm">
          <FontAwesome5
            name={field.icon as any}
            size={16}
            color="#6B7280"
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder={field.placeholder}
            placeholderTextColor="#9CA3AF"
            value={applicationData[field.key] || ""}
            onChangeText={(v) =>
              handleChange(
                field.key,
                field.key === "seniorId" ? v.replace(/[^0-9]/g, "") : v
              )
            }
            editable={field.editable}
            keyboardType={field.key === "seniorId" ? "numeric" : "default"} 
            className="flex-1 text-gray-800 text-sm"
          />
        </View>
          {errors[field.key] ? (
          <Text className="text-red-500 text-xs mt-1">{errors[field.key]}</Text>
        ) : null}
            </View>
          ))}

          {/* Date of Issuance */}
          <TouchableOpacity
    onPress={() => setShowSeniorDatePicker(true)}
    className="flex-row items-center bg-gray-50 px-3 py-3 rounded-xl shadow-sm mb-2"
  >
    <FontAwesome5 name="calendar" size={16} color="#6B7280" style={{ marginRight: 8 }} />
    <Text className="flex-1 text-gray-800 text-sm">
      {applicationData.seniorDateIssued
        ? new Date(applicationData.seniorDateIssued).toLocaleDateString()
        : "Date of Issuance"}
    </Text>
  </TouchableOpacity>

  {showSeniorDatePicker && (
    <DateTimePicker
      value={applicationData.seniorDateIssued ? new Date(applicationData.seniorDateIssued) : new Date()}
      mode="date"
      display="default"
      onChange={(event: any, selectedDate?: Date) => {
        setShowSeniorDatePicker(false);
        if (selectedDate) {
          const formatted = selectedDate.toISOString().split("T")[0];
          handleChange("seniorDateIssued", formatted);
          validateField("seniorDateIssued", formatted);
        }
        {errors.pwdDateIssued ? (
  <Text className="text-red-500 text-xs mt-1">{errors.pwdDateIssued}</Text>
) : null}
      }}
    />
  )}

        </View>
      )}
      


      {/* Buttons */}
      <View className="flex-row w-full max-w-sm justify-between mt-2">
    <TouchableOpacity
      onPress={goBack}
      disabled={isSubmitting}
      activeOpacity={0.7}
      className={`flex-1 py-2 mr-2 border border-gray-300 rounded-full items-center ${
        isSubmitting ? 'opacity-50' : ''
      }`}
    >
      <Text className="text-gray-700 font-medium text-sm">Back</Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={goNext}
      disabled={isSubmitting}
      activeOpacity={0.7}
      className={`flex-1 py-2 ml-2 bg-[#0c2340] rounded-full items-center shadow-md ${
        isSubmitting ? 'opacity-50' : ''
      }`}
    >
      {isSubmitting ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text className="text-white font-semibold text-sm">Next</Text>
      )}
    </TouchableOpacity>
  </View>
    </View>
    </KeyboardAwareScrollView>
  </KeyboardAvoidingView>
  )}

  {/* STEP 4 – File Upload */}
  {step === 4 && (
    <View className="items-center w-full px-4">
      <Text className="text-xl font-bold text-[#0c2340] mb-4 text-center">
        Upload Required Documents
      </Text>

      {fileRequirements[category]?.map((label, index) => {
        const camelKey = toCamelCase(label);

        return (
          <View key={index} className="w-full mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>

            {/* Preview uploaded file */}
            {files[camelKey]?.uri ? (
              <Image
                source={{ uri: files[camelKey].uri }}
                className="w-full h-40 rounded-lg mb-3"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-40 border border-dashed border-gray-400 rounded-lg flex items-center justify-center mb-3">
                <Text className="text-gray-400 text-sm">No file selected</Text>
              </View>
            )}

            {/* Buttons */}
            <TouchableOpacity
              onPress={() => takePhoto(label)}
              className="bg-yellow-500 p-3 rounded-lg mb-2"
            >
              <Text className="text-white text-center">📷 Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => pickImage(label)}
              className="bg-blue-500 p-3 rounded-lg"
            >
              <Text className="text-white text-center">📂 Upload from Gallery</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      {/* Navigation Buttons */}
      <View className="flex-row justify-between w-full mt-4">
    <TouchableOpacity
      onPress={goBack}
      disabled={isSubmitting}
      activeOpacity={0.7}
      className={`bg-gray-400 p-3 rounded-lg flex-1 mr-2 ${
        isSubmitting ? 'opacity-50' : ''
      }`}
    >
      <Text className="text-white text-center font-semibold">Back</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={goNext}
      disabled={isSubmitting}
      activeOpacity={0.7}
      className={`bg-green-600 p-3 rounded-lg flex-1 ml-2 ${
        isSubmitting ? 'opacity-50' : ''
      }`}
    >
      {isSubmitting ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text className="text-white text-center font-semibold">Next</Text>
      )}
    </TouchableOpacity>
  </View>
    </View>
  )}


            {/* STEP 5 – Review Information */}
  {step === 5 && (
    <View className="items-center w-full px-4">
      <Text className="text-xl font-bold text-[#0c2340] mb-4 text-center">
        Review Your Information
      </Text>

      {/* Common Fields */}
      <View className="w-full mb-3">
        <Text className="text-gray-700 font-medium">First Name:</Text>
        <Text className="text-gray-900">{applicationData.firstName}</Text>
      </View>
      <View className="w-full mb-3">
        <Text className="text-gray-700 font-medium">Middle Name:</Text>
        <Text className="text-gray-900">{applicationData.middleName}</Text>
      </View>
      <View className="w-full mb-3">
        <Text className="text-gray-700 font-medium">Last Name:</Text>
        <Text className="text-gray-900">{applicationData.lastName}</Text>
      </View>
      <View className="w-full mb-3">
        <Text className="text-gray-700 font-medium">Contact Number:</Text>
        <Text className="text-gray-900">{applicationData.contactNumber}</Text>
      </View>
      <View className="w-full mb-3">
        <Text className="text-gray-700 font-medium">Email:</Text>
        <Text className="text-gray-900">{applicationData.email}</Text>
      </View>
      <View className="w-full mb-3">
        <Text className="text-gray-700 font-medium">Birthdate:</Text>
        <Text className="text-gray-900">{applicationData.birthDate}</Text>
      </View>
      <View className="w-full mb-3">
        <Text className="text-gray-700 font-medium">Age:</Text>
        <Text className="text-gray-900">{applicationData.age}</Text>
      </View>
    

      {/* Student-Specific Fields */}
      {category === "student" && (
        <>
          <View className="w-full mb-3">
            <Text className="text-gray-700 font-medium">School Name:</Text>
            <Text className="text-gray-900">{applicationData.schoolName}</Text>
          </View>
          <View className="w-full mb-3">
            <Text className="text-gray-700 font-medium">School Address:</Text>
            <Text className="text-gray-900">{applicationData.schoolLocation}</Text>
          </View>
          <View className="w-full mb-3">
            <Text className="text-gray-700 font-medium">Student ID:</Text>
            <Text className="text-gray-900">{applicationData.idNum}</Text>
          </View>
          <View className="w-full mb-3">
            <Text className="text-gray-700 font-medium">Grade/Year Level:</Text>
            <Text className="text-gray-900">{applicationData.schoolYear}</Text>
          </View>
        </>
      )}

      {/* File Preview */}
      {fileRequirements[category]?.map((label, index) => {
        const camelKey = toCamelCase(label);
        return (
          <View key={index} className="w-full mb-3">
            <Text className="text-gray-700 font-medium">{label}:</Text>
            {files[camelKey]?.uri ? (
              <Image
                source={{ uri: files[camelKey].uri }}
                className="w-full h-40 rounded-lg mt-2"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-gray-500 text-sm">No file uploaded</Text>
            )}
          </View>
        );
      })}

      {/* Navigation Buttons */}
    <View className="flex-row justify-between w-full mt-4">
    <TouchableOpacity
      onPress={goBack}
      disabled={isSubmitting}
      activeOpacity={0.7}
      className={`bg-gray-400 p-3 rounded-lg flex-1 mr-2 ${
        isSubmitting ? 'opacity-50' : ''
      }`}
    >
      <Text className="text-white text-center font-semibold">Back</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={handleSubmitWithLoading}
      disabled={isSubmitting}
      activeOpacity={0.7}
      className={`bg-green-600 p-3 rounded-lg flex-1 ml-2 ${
        isSubmitting ? 'opacity-50' : ''
      }`}
    >
      {isSubmitting ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text className="text-white text-center font-semibold">Submit</Text>
      )}
    </TouchableOpacity>
  </View>

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