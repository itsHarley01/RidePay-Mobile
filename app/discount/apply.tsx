
import { submitDiscountApplication } from '@/api/applyDiscount';
import { KeyboardAvoidingView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Modal } from 'react-native'; 
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

const stepsTotal = 6;

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
    setStep(prev => prev + 1);
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

    if (!applicationData.gender) {
      newErrors.gender = "Gender is required.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleNext = () => {
    if (validateAllFields()) {
      setStep(step + 1);
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

      case "gender":
        if (!value || value === "") message = "Gender is required.";
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
  }, [category]);

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
      <View style={{ flex: 1, backgroundColor: '#ffffff', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 16, textAlign: 'center' }}>
          Application Pending
        </Text>  

        <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 32, fontSize: 16 }}>
          Your application is under review. You'll be notified once it's approved.
        </Text>

        <View style={{ backgroundColor: '#F9FAFB', padding: 24, borderRadius: 12, marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>Application Details</Text>

          <View style={{ gap: 8 }}>
            <Text style={{ color: '#374151' }}>Name: {applicationData.firstName} {applicationData.middleName} {applicationData.lastName}</Text>
            <Text style={{ color: '#374151' }}>Category: {category}</Text>

            {category === "student" && (
              <>
                <Text style={{ color: '#374151' }}>School: {applicationData.schoolName}</Text>
                <Text style={{ color: '#374151' }}>School Address: {applicationData.schoolLocation}</Text>
                <Text style={{ color: '#374151' }}>Student ID: {applicationData.idNum}</Text>
                <Text style={{ color: '#374151' }}>Grade Year/Level: {applicationData.schoolYear}</Text>
              </>
            )}
            {category === "pwd" && (
              <>
                <Text style={{ color: '#374151' }}>PWD ID: {applicationData.pwdId}</Text>
                <Text style={{ color: '#374151' }}>Issued At: {applicationData.pwdPlaceIssued}</Text>
              </>
            )}
            {category === "senior" && (
              <>
                <Text style={{ color: '#374151' }}>Senior ID: {applicationData.seniorId}</Text>
                <Text style={{ color: '#374151' }}>Issued At: {applicationData.seniorPlaceIssued}</Text>
              </>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/home')}
          style={{ backgroundColor: '#111827', paddingVertical: 16, borderRadius: 8, alignItems: 'center' }}
        >
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Return Home</Text>
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

        setApplicationData((prev: any) => ({
          ...prev,
          email: data.email || "",
          contactNumber: data.contactNumber || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          middleName: data.middleName || "",
        }));
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUserProfile();
  }, [userId]);

  const toCamelCase = (str: string) => {
    return str
      .replace(/[^a-zA-Z0-9 ]/g, '')
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
      if (!applicationData.birthDate) {
        errors.push("Birthdate is required");
      } else {
        const today = new Date();
        const birthDate = new Date(applicationData.birthDate);

        if (birthDate > today) {
          errors.push("Birthdate cannot be in the future.");
        }

        const currentYear = today.getFullYear();
        if (birthDate.getFullYear() > currentYear) {
          errors.push("Birth year cannot exceed the current year.");
        }
      }

      if (!applicationData.gender) {
        errors.push("Gender is required");
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
    if (isSubmitting) return;
    
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
    setCategory(type.toLowerCase());
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
        files
      });

      setStep(6);
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to submit application.');
    }
  };

  const progress = Math.round((step / stepsTotal) * 100);

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Header */}
      <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
        <TouchableOpacity 
          onPress={goBack} 
          style={{ position: 'absolute', left: 24, top: 60, zIndex: 10, padding: 8 }}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#6B7280" />
        </TouchableOpacity>

        <Text style={{ fontSize: 20, fontWeight: '600', color: '#111827', textAlign: 'center', marginBottom: 16 }}>
          Discount Application
        </Text>

        {/* Simple Progress Bar */}
        <View style={{ height: 4, backgroundColor: '#F3F4F6', borderRadius: 2 }}>
          <View 
            style={{ 
              height: 4, 
              backgroundColor: '#111827', 
              borderRadius: 2, 
              width: `${progress}%` 
            }} 
          />
        </View>
        <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 8 }}>
          Step {step} of {stepsTotal}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}>
        {/* Step 1: Privacy & Terms */}
        {step === 1 && (
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 16, textAlign: 'center' }}>
              Privacy & Terms
            </Text>

            <ScrollView
              style={{ maxHeight: 400, backgroundColor: '#F9FAFB', borderRadius: 8, padding: 16 }}
              contentContainerStyle={{ paddingBottom: 20 }}
              onScroll={(e) => {
                const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
                const isScrolledToBottom =
                  contentOffset.y + layoutMeasurement.height >= contentSize.height - 10;
                if (isScrolledToBottom) setHasScrolledToBottom(true);
              }}
              scrollEventThrottle={16}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#111827' }}>Privacy Policy</Text>
              <Text style={{ color: '#6B7280', marginBottom: 16, fontSize: 14 }}>Last updated: August 14, 2025</Text>
              <Text style={{ color: '#374151', marginBottom: 16, lineHeight: 22 }}>
                This Privacy Policy describes Our policies and procedures on the collection, use and disclosure
                of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
                We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and
                use of information in accordance with this Privacy Policy.
              </Text>

              <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#111827' }}>Interpretation and Definitions</Text>
              <Text style={{ color: '#374151', marginBottom: 12, lineHeight: 22 }}>
                The words of which the initial letter is capitalized have meanings defined under the following
                conditions. The following definitions shall have the same meaning regardless of whether they
                appear in singular or in plural.
              </Text>

              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#111827' }}>Definitions</Text>
              <Text style={{ color: '#374151', marginBottom: 12 }}>For the purposes of this Privacy Policy:</Text>
              
              <View style={{ paddingLeft: 16, gap: 8 }}>
                <Text style={{ color: '#374151', lineHeight: 20 }}>• Account means a unique account created for You to access our Service</Text>
                <Text style={{ color: '#374151', lineHeight: 20 }}>• Application refers to RidePay, the software program provided by the Company</Text>
                <Text style={{ color: '#374151', lineHeight: 20 }}>• Company refers to RidePay, Cebu City</Text>
                <Text style={{ color: '#374151', lineHeight: 20 }}>• Country refers to: Philippines</Text>
                <Text style={{ color: '#374151', lineHeight: 20 }}>• Personal Data is any information that relates to an identified or identifiable individual</Text>
                <Text style={{ color: '#374151', lineHeight: 20 }}>• Service refers to the Application</Text>
              </View>

              <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#111827' }}>Data Collection</Text>
              <Text style={{ color: '#374151', marginBottom: 12, lineHeight: 22 }}>
                While using Our Service, We may ask You to provide Us with certain personally identifiable
                information that can be used to contact or identify You, including:
              </Text>
              
              <View style={{ paddingLeft: 16, gap: 6 }}>
                <Text style={{ color: '#374151' }}>• Email address</Text>
                <Text style={{ color: '#374151' }}>• First name and last name</Text>
                <Text style={{ color: '#374151' }}>• Phone number</Text>
                <Text style={{ color: '#374151' }}>• Address information</Text>
                <Text style={{ color: '#374151' }}>• Usage data</Text>
              </View>

              <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#111827' }}>Contact Us</Text>
              <TouchableOpacity onPress={() => Linking.openURL('mailto:ridepaymobile@gmail.com')}>
                <Text style={{ color: '#2563EB' }}>ridepaymobile@gmail.com</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              disabled={!hasScrolledToBottom || isSubmitting}
              onPress={goNext}
              style={{
                marginTop: 24,
                paddingVertical: 16,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: hasScrolledToBottom && !isSubmitting ? '#111827' : '#D1D5DB'
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                {hasScrolledToBottom ? 'Agree & Continue' : 'Scroll to Read All'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Select Discount Type */}
        {step === 2 && (
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 32, textAlign: 'center' }}>
              Select Discount Type
            </Text>

            <View style={{ gap: 16 }}>
              {[
                {
                  type: 'student',
                  label: 'Student Discount',
                  desc: 'For enrolled students with valid school ID',
                  icon: 'graduation-cap',
                },
                {
                  type: 'pwd',
                  label: 'PWD Discount',
                  desc: 'For persons with disabilities with valid PWD ID',
                  icon: 'wheelchair',
                },
                {
                  type: 'senior',
                  label: 'Senior Citizen Discount',
                  desc: 'For senior citizens with valid senior ID',
                  icon: 'id-card',
                },
              ].map((item) => (
                <TouchableOpacity
                  key={item.type}
                  onPress={() => handleSelectType(item.type)}
                  style={{
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 12,
                    padding: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'white'
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: '#F3F4F6',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16
                    }}
                  >
                    <FontAwesome5 name={item.icon as any} size={20} color="#374151" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 }}>{item.label}</Text>
                    <Text style={{ color: '#6B7280', fontSize: 14 }}>{item.desc}</Text>
                  </View>
                  <FontAwesome5 name="chevron-right" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Application Form */}
        {step === 3 && (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <KeyboardAwareScrollView enableOnAndroid extraScrollHeight={20} keyboardShouldPersistTaps="handled">
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 32, textAlign: 'center' }}>
                Personal Details
              </Text>

              <View style={{ gap: 16 }}>
                {/* Name Fields */}
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>First Name</Text>
                  <View style={{ 
                    borderWidth: 1, 
                    borderColor: '#E5E7EB', 
                    borderRadius: 8, 
                    paddingHorizontal: 16, 
                    paddingVertical: 12,
                    backgroundColor: '#F9FAFB'
                  }}>
                    <Text style={{ color: '#6B7280', fontSize: 16 }}>{applicationData.firstName || 'Not available'}</Text>
                  </View>
                </View>

                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Last Name</Text>
                  <View style={{ 
                    borderWidth: 1, 
                    borderColor: '#E5E7EB', 
                    borderRadius: 8, 
                    paddingHorizontal: 16, 
                    paddingVertical: 12,
                    backgroundColor: '#F9FAFB'
                  }}>
                    <Text style={{ color: '#6B7280', fontSize: 16 }}>{applicationData.lastName || 'Not available'}</Text>
                  </View>
                </View>

                {applicationData.middleName && (
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Middle Name</Text>
                    <View style={{ 
                      borderWidth: 1, 
                      borderColor: '#E5E7EB', 
                      borderRadius: 8, 
                      paddingHorizontal: 16, 
                      paddingVertical: 12,
                      backgroundColor: '#F9FAFB'
                    }}>
                      <Text style={{ color: '#6B7280', fontSize: 16 }}>{applicationData.middleName}</Text>
                    </View>
                  </View>
                )}

                {/* Birthdate */}
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Birthdate</Text>
                  <TouchableOpacity
                    onPress={() => setShowBirthdatePicker(true)}
                    style={{
                      borderWidth: 1,
                      borderColor: errors.birthDate ? '#EF4444' : '#E5E7EB',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      backgroundColor: 'white'
                    }}
                  >
                    <Text style={{ color: applicationData.birthDate ? '#111827' : '#9CA3AF', fontSize: 16 }}>
                      {applicationData.birthDate
                        ? new Date(applicationData.birthDate).toLocaleDateString()
                        : "Select your birthdate"}
                    </Text>
                  </TouchableOpacity>
                  {errors.birthDate && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.birthDate}</Text>}
                </View>

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

                {/* Age Display */}
                {applicationData.age && (
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Age</Text>
                    <View style={{ 
                      borderWidth: 1, 
                      borderColor: '#E5E7EB', 
                      borderRadius: 8, 
                      paddingHorizontal: 16, 
                      paddingVertical: 12,
                      backgroundColor: '#F9FAFB'
                    }}>
                      <Text style={{ color: '#6B7280', fontSize: 16 }}>{applicationData.age} years old</Text>
                    </View>
                  </View>
                )}

                {/* Gender */}
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Gender</Text>
                  <View style={{
                    borderWidth: 1,
                    borderColor: errors.gender ? '#EF4444' : '#E5E7EB',
                    borderRadius: 8,
                    backgroundColor: 'white',
                    overflow: 'hidden'
                  }}>
                    <Picker
                      selectedValue={applicationData.gender || ""}
                      style={{ color: '#111827' }}
                      onValueChange={(value) => {
                        handleChange("gender", value);
                        validateField("gender", value);
                      }}
                    >
                      <Picker.Item label="Select Gender" value="" />
                      <Picker.Item label="Male" value="Male" />
                      <Picker.Item label="Female" value="Female" />
                      <Picker.Item label="Other" value="Other" />
                    </Picker>
                  </View>
                  {errors.gender && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.gender}</Text>}
                </View>

                {/* Contact Information */}
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Contact Number</Text>
                  <View style={{ 
                    borderWidth: 1, 
                    borderColor: '#E5E7EB', 
                    borderRadius: 8, 
                    paddingHorizontal: 16, 
                    paddingVertical: 12,
                    backgroundColor: '#F9FAFB'
                  }}>
                    <Text style={{ color: '#6B7280', fontSize: 16 }}>{applicationData.contactNumber || 'Not available'}</Text>
                  </View>
                </View>

                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Email</Text>
                  <View style={{ 
                    borderWidth: 1, 
                    borderColor: '#E5E7EB', 
                    borderRadius: 8, 
                    paddingHorizontal: 16, 
                    paddingVertical: 12,
                    backgroundColor: '#F9FAFB'
                  }}>
                    <Text style={{ color: '#6B7280', fontSize: 16 }}>{applicationData.email || 'Not available'}</Text>
                  </View>
                </View>

                {/* Category-Specific Fields */}
                {category === "student" && (
                  <>
                    <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 }} />
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>School Information</Text>
                    
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>School Name</Text>
                      <TextInput
                        placeholder="Enter your school name"
                        placeholderTextColor="#9CA3AF"
                        value={applicationData.schoolName || ""}
                        onChangeText={(v) => handleChange("schoolName", v)}
                        style={{
                          borderWidth: 1,
                          borderColor: errors.schoolName ? '#EF4444' : '#E5E7EB',
                          borderRadius: 8,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          backgroundColor: 'white',
                          fontSize: 16,
                          color: '#111827'
                        }}
                      />
                      {errors.schoolName && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.schoolName}</Text>}
                    </View>

                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>School Address</Text>
                      <TextInput
                        placeholder="Enter your school address"
                        placeholderTextColor="#9CA3AF"
                        value={applicationData.schoolLocation || ""}
                        onChangeText={(v) => handleChange("schoolLocation", v)}
                        style={{
                          borderWidth: 1,
                          borderColor: errors.schoolLocation ? '#EF4444' : '#E5E7EB',
                          borderRadius: 8,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          backgroundColor: 'white',
                          fontSize: 16,
                          color: '#111827'
                        }}
                      />
                      {errors.schoolLocation && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.schoolLocation}</Text>}
                    </View>

                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Student ID</Text>
                      <TextInput
                        placeholder="Enter your student ID"
                        placeholderTextColor="#9CA3AF"
                        value={applicationData.idNum || ""}
                        onChangeText={(v) => handleChange("idNum", v.replace(/[^0-9]/g, ""))}
                        keyboardType="numeric"
                        style={{
                          borderWidth: 1,
                          borderColor: errors.idNum ? '#EF4444' : '#E5E7EB',
                          borderRadius: 8,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          backgroundColor: 'white',
                          fontSize: 16,
                          color: '#111827'
                        }}
                      />
                      {errors.idNum && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.idNum}</Text>}
                    </View>

                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Year & Level</Text>
                      <View style={{ 
                        borderWidth: 1, 
                        borderColor: '#E5E7EB', 
                        borderRadius: 8, 
                        paddingHorizontal: 16, 
                        paddingVertical: 12,
                        backgroundColor: '#F9FAFB'
                      }}>
                        <Text style={{ color: '#6B7280', fontSize: 16 }}>{applicationData.schoolYear || autoSchoolYear}</Text>
                      </View>
                    </View>
                  </>
                )}

                {category === "pwd" && (
                  <>
                    <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 }} />
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>PWD Information</Text>
                    
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>PWD ID Number</Text>
                      <TextInput
                        placeholder="Enter your PWD ID number"
                        placeholderTextColor="#9CA3AF"
                        value={applicationData.pwdId || ""}
                        onChangeText={(v) => handleChange("pwdId", v.replace(/[^0-9]/g, ""))}
                        keyboardType="numeric"
                        style={{
                          borderWidth: 1,
                          borderColor: errors.pwdId ? '#EF4444' : '#E5E7EB',
                          borderRadius: 8,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          backgroundColor: 'white',
                          fontSize: 16,
                          color: '#111827'
                        }}
                      />
                      {errors.pwdId && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.pwdId}</Text>}
                    </View>

                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Place of Issuance</Text>
                      <TextInput
                        placeholder="Enter place of issuance"
                        placeholderTextColor="#9CA3AF"
                        value={applicationData.pwdPlaceIssued || ""}
                        onChangeText={(v) => handleChange("pwdPlaceIssued", v)}
                        style={{
                          borderWidth: 1,
                          borderColor: errors.pwdPlaceIssued ? '#EF4444' : '#E5E7EB',
                          borderRadius: 8,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          backgroundColor: 'white',
                          fontSize: 16,
                          color: '#111827'
                        }}
                      />
                      {errors.pwdPlaceIssued && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.pwdPlaceIssued}</Text>}
                    </View>

                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Date of Issuance</Text>
                      <TouchableOpacity
                        onPress={() => setShowPwdDatePicker(true)}
                        style={{
                          borderWidth: 1,
                          borderColor: '#E5E7EB',
                          borderRadius: 8,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          backgroundColor: 'white'
                        }}
                      >
                        <Text style={{ color: applicationData.pwdDateIssued ? '#111827' : '#9CA3AF', fontSize: 16 }}>
                          {applicationData.pwdDateIssued
                            ? new Date(applicationData.pwdDateIssued).toLocaleDateString()
                            : "Select date of issuance"}
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
                            }
                          }}
                        />
                      )}
                    </View>
                  </>
                )}

                {category === "senior" && (
                  <>
                    <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 }} />
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>Senior Citizen Information</Text>
                    
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Senior ID Number</Text>
                      <TextInput
                        placeholder="Enter your senior ID number"
                        placeholderTextColor="#9CA3AF"
                        value={applicationData.seniorId || ""}
                        onChangeText={(v) => handleChange("seniorId", v.replace(/[^0-9]/g, ""))}
                        keyboardType="numeric"
                        style={{
                          borderWidth: 1,
                          borderColor: errors.seniorId ? '#EF4444' : '#E5E7EB',
                          borderRadius: 8,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          backgroundColor: 'white',
                          fontSize: 16,
                          color: '#111827'
                        }}
                      />
                      {errors.seniorId && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.seniorId}</Text>}
                    </View>

                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Place of Issuance</Text>
                      <TextInput
                        placeholder="Enter place of issuance"
                        placeholderTextColor="#9CA3AF"
                        value={applicationData.seniorPlaceIssued || ""}
                        onChangeText={(v) => handleChange("seniorPlaceIssued", v)}
                        style={{
                          borderWidth: 1,
                          borderColor: errors.seniorPlaceIssued ? '#EF4444' : '#E5E7EB',
                          borderRadius: 8,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          backgroundColor: 'white',
                          fontSize: 16,
                          color: '#111827'
                        }}
                      />
                      {errors.seniorPlaceIssued && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.seniorPlaceIssued}</Text>}
                    </View>

                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Date of Issuance</Text>
                      <TouchableOpacity
                        onPress={() => setShowSeniorDatePicker(true)}
                        style={{
                          borderWidth: 1,
                          borderColor: '#E5E7EB',
                          borderRadius: 8,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          backgroundColor: 'white'
                        }}
                      >
                        <Text style={{ color: applicationData.seniorDateIssued ? '#111827' : '#9CA3AF', fontSize: 16 }}>
                          {applicationData.seniorDateIssued
                            ? new Date(applicationData.seniorDateIssued).toLocaleDateString()
                            : "Select date of issuance"}
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
                            }
                          }}
                        />
                      )}
                    </View>
                  </>
                )}
              </View>

              {/* Navigation Buttons */}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 32 }}>
                <TouchableOpacity
                  onPress={goBack}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    opacity: isSubmitting ? 0.5 : 1
                  }}
                >
                  <Text style={{ color: '#374151', fontWeight: '500' }}>Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={goNext}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    backgroundColor: '#111827',
                    opacity: isSubmitting ? 0.5 : 1
                  }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={{ color: 'white', fontWeight: '600' }}>Next</Text>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAwareScrollView>
          </KeyboardAvoidingView>
        )}

        {/* Step 4: File Upload */}
        {step === 4 && (
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' }}>
              Upload Documents
            </Text>
            <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 32, fontSize: 16 }}>
              Please upload the required documents for verification
            </Text>

            <View style={{ gap: 24 }}>
              {fileRequirements[category]?.map((label, index) => {
                const camelKey = toCamelCase(label);

                return (
                  <View key={index}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>{label}</Text>

                    {/* File Preview */}
                    {files[camelKey]?.uri ? (
                      <View style={{ 
                        borderRadius: 12, 
                        overflow: 'hidden', 
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: '#E5E7EB'
                      }}>
                        <Image
                          source={{ uri: files[camelKey].uri }}
                          style={{ width: '100%', height: 200 }}
                          resizeMode="cover"
                        />
                        <View style={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8, 
                          backgroundColor: '#10B981', 
                          borderRadius: 16, 
                          width: 32, 
                          height: 32, 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <FontAwesome5 name="check" size={16} color="white" />
                        </View>
                      </View>
                    ) : (
                      <View style={{
                        height: 200,
                        borderWidth: 2,
                        borderColor: '#E5E7EB',
                        borderStyle: 'dashed',
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#F9FAFB',
                        marginBottom: 12
                      }}>
                        <FontAwesome5 name="image" size={32} color="#D1D5DB" style={{ marginBottom: 8 }} />
                        <Text style={{ color: '#9CA3AF', fontSize: 14 }}>No document uploaded</Text>
                      </View>
                    )}

                    {/* Upload Buttons */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity
                        onPress={() => takePhoto(label)}
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: 12,
                          borderRadius: 8,
                          backgroundColor: '#111827',
                          gap: 8
                        }}
                      >
                        <FontAwesome5 name="camera" size={16} color="white" />
                        <Text style={{ color: 'white', fontWeight: '500' }}>Camera</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => pickImage(label)}
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: 12,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          backgroundColor: 'white',
                          gap: 8
                        }}
                      >
                        <FontAwesome5 name="folder-open" size={16} color="#374151" />
                        <Text style={{ color: '#374151', fontWeight: '500' }}>Gallery</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Navigation Buttons */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 32 }}>
              <TouchableOpacity
                onPress={goBack}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  opacity: isSubmitting ? 0.5 : 1
                }}
              >
                <Text style={{ color: '#374151', fontWeight: '500' }}>Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={goNext}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: '#111827',
                  opacity: isSubmitting ? 0.5 : 1
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={{ color: 'white', fontWeight: '600' }}>Next</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 5: Review Information */}
        {step === 5 && (
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' }}>
              Review Application
            </Text>
            <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 32, fontSize: 16 }}>
              Please review your information before submitting
            </Text>

            <View style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>Personal Information</Text>
              
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#6B7280', fontWeight: '500' }}>Name:</Text>
                  <Text style={{ color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' }}>
                    {applicationData.firstName} {applicationData.middleName} {applicationData.lastName}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#6B7280', fontWeight: '500' }}>Gender:</Text>
                  <Text style={{ color: '#111827', fontWeight: '500' }}>{applicationData.gender}</Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#6B7280', fontWeight: '500' }}>Age:</Text>
                  <Text style={{ color: '#111827', fontWeight: '500' }}>{applicationData.age} years old</Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#6B7280', fontWeight: '500' }}>Contact:</Text>
                  <Text style={{ color: '#111827', fontWeight: '500' }}>{applicationData.contactNumber}</Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#6B7280', fontWeight: '500' }}>Email:</Text>
                  <Text style={{ color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' }}>{applicationData.email}</Text>
                </View>
              </View>
            </View>

            {/* Category-Specific Information */}
            {category === "student" && (
              <View style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>School Information</Text>
                
                <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6B7280', fontWeight: '500' }}>School:</Text>
                    <Text style={{ color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' }}>{applicationData.schoolName}</Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6B7280', fontWeight: '500' }}>Address:</Text>
                    <Text style={{ color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' }}>{applicationData.schoolLocation}</Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6B7280', fontWeight: '500' }}>Student ID:</Text>
                    <Text style={{ color: '#111827', fontWeight: '500' }}>{applicationData.idNum}</Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6B7280', fontWeight: '500' }}>Year & Level:</Text>
                    <Text style={{ color: '#111827', fontWeight: '500' }}>{applicationData.schoolYear}</Text>
                  </View>
                </View>
              </View>
            )}

            {category === "pwd" && (
              <View style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>PWD Information</Text>
                
                <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6B7280', fontWeight: '500' }}>PWD ID:</Text>
                    <Text style={{ color: '#111827', fontWeight: '500' }}>{applicationData.pwdId}</Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6B7280', fontWeight: '500' }}>Place Issued:</Text>
                    <Text style={{ color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' }}>{applicationData.pwdPlaceIssued}</Text>
                  </View>
                  
                  {applicationData.pwdDateIssued && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: '#6B7280', fontWeight: '500' }}>Date Issued:</Text>
                      <Text style={{ color: '#111827', fontWeight: '500' }}>
                        {new Date(applicationData.pwdDateIssued).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {category === "senior" && (
              <View style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>Senior Citizen Information</Text>
                
                <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6B7280', fontWeight: '500' }}>Senior ID:</Text>
                    <Text style={{ color: '#111827', fontWeight: '500' }}>{applicationData.seniorId}</Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6B7280', fontWeight: '500' }}>Place Issued:</Text>
                    <Text style={{ color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' }}>{applicationData.seniorPlaceIssued}</Text>
                  </View>
                  
                  {applicationData.seniorDateIssued && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: '#6B7280', fontWeight: '500' }}>Date Issued:</Text>
                      <Text style={{ color: '#111827', fontWeight: '500' }}>
                        {new Date(applicationData.seniorDateIssued).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Uploaded Documents */}
            <View style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 20, marginBottom: 32 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>Uploaded Documents</Text>
              
              <View style={{ gap: 16 }}>
                {fileRequirements[category]?.map((label, index) => {
                  const camelKey = toCamelCase(label);
                  return (
                    <View key={index}>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#6B7280', marginBottom: 8 }}>{label}</Text>
                      {files[camelKey]?.uri ? (
                        <View style={{ borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' }}>
                          <Image
                            source={{ uri: files[camelKey].uri }}
                            style={{ width: '100%', height: 120 }}
                            resizeMode="cover"
                          />
                        </View>
                      ) : (
                        <View style={{
                          height: 60,
                          borderWidth: 1,
                          borderColor: '#FEF3C7',
                          backgroundColor: '#FFFBEB',
                          borderRadius: 8,
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Text style={{ color: '#D97706', fontSize: 14 }}>No document uploaded</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Navigation Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={goBack}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  opacity: isSubmitting ? 0.5 : 1
                }}
              >
                <Text style={{ color: '#374151', fontWeight: '500' }}>Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSubmitWithLoading}
                disabled={isSubmitting}
                style={{
                  flex: 2,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: '#111827',
                  opacity: isSubmitting ? 0.5 : 1
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={{ color: 'white', fontWeight: '600' }}>Submit Application</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 6: Success */}
        {step === 6 && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#10B981',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24
            }}>
              <FontAwesome5 name="check" size={32} color="white" />
            </View>
            
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' }}>
              Application Submitted!
            </Text>
            
            <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 32, fontSize: 16, lineHeight: 24 }}>
              Your discount application has been successfully submitted. You'll receive a notification once it's reviewed and approved.
            </Text>
            
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/home')}
              style={{
                backgroundColor: '#111827',
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 8,
                minWidth: 200,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Return Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}