
import { submitDiscountApplication, submitDiscountRenewal, getDiscountApplications } from '@/api/applyDiscount';
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
import { useLocalSearchParams } from 'expo-router';
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

  const [isRenewal, setIsRenewal] = useState(false);
  const { category: renewalCategory, renewal } = useLocalSearchParams();
  const [existingDiscountId, setExistingDiscountId] = useState<string | null>(null);



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

    // Check if this is a renewal
    if (renewal === 'true' && renewalCategory) {
      setIsRenewal(true);
      setCategory(renewalCategory as string);
      
      // Fetch existing discount application to get the ID
      try {
        const applications = await getDiscountApplications();
        const userApps = applications.filter(app => app.userId === uid);
        const categoryApp = userApps
          .filter(app => app.category === renewalCategory)
          .sort((a, b) => new Date(b.status.dateOfApplication).getTime() - new Date(a.status.dateOfApplication).getTime())[0];
        
        if (categoryApp) {
          setExistingDiscountId(categoryApp.id);
        }
      } catch (error) {
        console.error('Error fetching existing discount:', error);
      }

      setStep(2); // Skip privacy terms for renewals
      return;
    }

    // Original application flow
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
}, [renewal, renewalCategory]);


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
    // For renewals of PWD/Senior, skip personal detail validation since they go straight to file upload
    if (isRenewal && (category === 'pwd' || category === 'senior')) {
      return errors; // No validation needed for PWD/Senior renewals at this step
    }

    // Personal details validation (for new applications and student renewals)
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

    // Category-specific validations
    if (category === "student") {
      if (!applicationData.schoolName) errors.push("School Name is required");
      if (!applicationData.schoolLocation) errors.push("School Address is required");
      if (!applicationData.idNum) errors.push("Student ID is required");
      
      // Skip school year validation for student renewals since it's auto-filled
      if (!isRenewal) {
        if (!applicationData.schoolYear) {
          errors.push("Year & Level is required");
        } else {
          const expected = `${currentYear} - ${nextYear}`;
          if (applicationData.schoolYear !== expected) {
            errors.push(`Year & Level must be ${expected}`);
          }
        }
      }
      // For renewals, school year is auto-filled and doesn't need validation
    }

    // For new PWD/Senior applications (not renewals)
    if (!isRenewal && category === "pwd") {
      if (!applicationData.pwdId) errors.push("PWD ID is required");
      if (!applicationData.pwdPlaceIssued) errors.push("Place of Issuance is required");
    }

    if (!isRenewal && category === "senior") {
      if (!applicationData.seniorId) errors.push("Senior ID is required");
      if (!applicationData.seniorPlaceIssued) errors.push("Place of Issuance is required");
    }
  }

  // File validation for step 4
  if (step === 4) {
    const requiredFiles = fileRequirements[category] || [];
    
    // For renewals, always require file uploads (even for students - but we skip this step for them)
    // For new applications, require all files
    requiredFiles.forEach(label => {
      const camelKey = toCamelCase(label);
      if (!files[camelKey]?.uri) {
        errors.push(`${label} is required`);
      }
    });
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
    if (isRenewal) {
      // Handle renewal submission
      if (!existingDiscountId) {
        Alert.alert('Error', 'Could not find existing discount to renew.');
        return;
      }

      let renewalData = {
        userId,
        discountId: existingDiscountId,
        category,
        data: {},
        files: {}
      };

      if (category === 'student') {
        // For student renewals: send updated details, no files
        renewalData.data = applicationData;
        renewalData.files = {};
      } else {
        // For PWD/Senior renewals: send only files, no updated personal details
        renewalData.data = {};
        renewalData.files = files;
      }

      await submitDiscountRenewal(renewalData);
    } else {
      // Handle new application submission
      await submitDiscountApplication({
        userId,
        category,
        data: applicationData,
        files
      });
    }

    setStep(6);
  } catch (error) {
    console.error('Submit error:', error);
    Alert.alert('Error', `Failed to submit ${isRenewal ? 'renewal' : 'application'}.`);
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
                backgroundColor: hasScrolledToBottom && !isSubmitting ? '#111827' : '#111827'
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

        {/* Step 2: Renewal Information (only for renewals) */}
{step === 2 && isRenewal && (
  <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 24, textAlign: 'center' }}>
      Renewing {category?.charAt(0).toUpperCase() + category?.slice(1)} Discount
    </Text>

    {/* Renewal Info Card */}
    <View style={{
      backgroundColor: '#EFF6FF',
      padding: 20,
      borderRadius: 16,
      marginBottom: 32,
      width: '100%',
      maxWidth: 400,
      borderWidth: 1,
      borderColor: '#DBEAFE'
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <FontAwesome5 name="info-circle" size={18} color="#3B82F6" />
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1E40AF', marginLeft: 8 }}>
          Renewal Process
        </Text>
      </View>
      
      {category === 'student' ? (
        <Text style={{ color: '#1E40AF', fontSize: 14, lineHeight: 20 }}>
          For student discount renewal, you only need to update your academic details. 
          Document upload is not required since you're renewing an existing discount.
        </Text>
      ) : (
        <Text style={{ color: '#1E40AF', fontSize: 14, lineHeight: 20 }}>
          For {category} discount renewal, you only need to upload updated documents. 
          Your existing personal details will be used from your previous application.
        </Text>
      )}
    </View>

    {/* Continue Button */}
    <TouchableOpacity
      onPress={() => {
        if (category === 'student') {
          setStep(3); // Go to details form for students
        } else {
          setStep(4); // Go directly to file upload for PWD/Senior
        }
      }}
      style={{
        backgroundColor: '#0c2340',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 32,
        width: '100%',
        maxWidth: 300,
        alignItems: 'center',
        shadowColor: '#0c2340',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
        Continue Renewal
      </Text>
    </TouchableOpacity>
  </View>
)}

       {/* Step 3: Application Form */}
{step === 3 && (
  <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <KeyboardAwareScrollView enableOnAndroid extraScrollHeight={20} keyboardShouldPersistTaps="handled">
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 32, textAlign: 'center' }}>
        {isRenewal ? 'Update Your Details' : 'Personal Details'}
      </Text>

      {/* Show renewal message for student renewals */}
      {isRenewal && category === 'student' && (
        <View style={{
          backgroundColor: '#FEF3C7',
          padding: 16,
          borderRadius: 12,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: '#FCD34D'
        }}>
          <Text style={{ color: '#92400E', fontSize: 14, textAlign: 'center', fontWeight: '500' }}>
            Please update your current academic information for renewal
          </Text>
        </View>
      )}

      <View style={{ gap: 16 }}>
        {/* Personal Details - Only show for new applications or student renewals */}
        {(!isRenewal || category === 'student') && (
          <>
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
          </>
        )}

        {/* Student-Specific Fields - Show for new applications OR student renewals */}
        {category === "student" && (!isRenewal || category === 'student') && (
          <>
            <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 }} />
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>
              {isRenewal ? 'Update School Information' : 'School Information'}
            </Text>
            
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

        {/* PWD-Specific Fields - Only for new applications (renewals skip this step) */}
        {category === "pwd" && !isRenewal && (
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

        {/* Senior-Specific Fields - Only for new applications (renewals skip this step) */}
        {category === "senior" && !isRenewal && (
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

        {/* Show message for PWD/Senior renewals that they skip this step */}
        {isRenewal && (category === 'pwd' || category === 'senior') && (
          <View style={{
            backgroundColor: '#EFF6FF',
            padding: 20,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#DBEAFE',
            alignItems: 'center'
          }}>
            <Text style={{ color: '#1E40AF', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              Renewal Process
            </Text>
            <Text style={{ color: '#1E40AF', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
              For {category} discount renewals, you'll only need to upload new documents. 
              Your existing personal details will be used.
            </Text>
          </View>
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
          onPress={() => {
            // For student renewals, go to review (skip file upload)
            if (isRenewal && category === 'student') {
              const errors = validateStep();
              if (errors.length > 0) {
                Alert.alert("Validation Error", errors.join("\n"));
                return;
              }
              setStep(5); // Skip file upload, go to review
            } else {
              goNext(); // Normal flow
            }
          }}
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
            <Text style={{ color: 'white', fontWeight: '600' }}>
              {isRenewal && category === 'student' ? 'Review' : 'Next'}
            </Text>
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
      {isRenewal ? 'Update Documents' : 'Upload Documents'}
    </Text>
    <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 24, fontSize: 16 }}>
      {isRenewal 
        ? 'Please upload your updated documents for renewal'
        : 'Please upload the required documents for verification'
      }
    </Text>

    {/* Show renewal-specific message */}
    {isRenewal && (
      <View style={{
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#DBEAFE'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <FontAwesome5 name="info-circle" size={16} color="#3B82F6" />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1E40AF', marginLeft: 8 }}>
            Renewal Requirements
          </Text>
        </View>
        <Text style={{ color: '#1E40AF', fontSize: 14, lineHeight: 20 }}>
          {category === 'pwd' 
            ? 'Upload your current PWD ID and Medical Certificate. Make sure they are valid and clearly readable.'
            : 'Upload your current Senior Citizen ID and Birth Certificate. Make sure they are valid and clearly readable.'
          }
        </Text>
      </View>
    )}

    <View style={{ gap: 24 }}>
      {fileRequirements[category]?.map((label, index) => {
        const camelKey = toCamelCase(label);

        return (
          <View key={index}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
              {label}
              {isRenewal && (
                <Text style={{ color: '#F59E0B', fontWeight: '500', fontSize: 14 }}> (Updated)</Text>
              )}
            </Text>

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
                {isRenewal && (
                  <View style={{ 
                    position: 'absolute', 
                    top: 8, 
                    left: 8, 
                    backgroundColor: '#F59E0B', 
                    borderRadius: 12, 
                    paddingHorizontal: 8,
                    paddingVertical: 4
                  }}>
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>UPDATED</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={{
                height: 200,
                borderWidth: 2,
                borderColor: isRenewal ? '#F59E0B' : '#E5E7EB',
                borderStyle: 'dashed',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isRenewal ? '#FFFBEB' : '#F9FAFB',
                marginBottom: 12
              }}>
                <FontAwesome5 name="image" size={32} color={isRenewal ? '#F59E0B' : '#D1D5DB'} style={{ marginBottom: 8 }} />
                <Text style={{ color: isRenewal ? '#D97706' : '#9CA3AF', fontSize: 14 }}>
                  {isRenewal ? 'Upload updated document' : 'No document uploaded'}
                </Text>
                {isRenewal && (
                  <Text style={{ color: '#92400E', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                    Required for renewal
                  </Text>
                )}
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

            {/* Show replacement message for renewals */}
            {isRenewal && files[camelKey]?.uri && (
              <View style={{
                backgroundColor: '#F0FDF4',
                padding: 12,
                borderRadius: 8,
                marginTop: 8,
                borderWidth: 1,
                borderColor: '#BBF7D0'
              }}>
                <Text style={{ color: '#15803D', fontSize: 12, textAlign: 'center' }}>
                  This will replace your previous {label.toLowerCase()} for renewal
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>

    {/* Show validation reminder for renewals */}
    {isRenewal && (
      <View style={{
        backgroundColor: '#FEF3C7',
        padding: 16,
        borderRadius: 12,
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#FCD34D'
      }}>
        <Text style={{ color: '#92400E', fontSize: 14, fontWeight: '500', textAlign: 'center' }}>
          Please ensure all documents are current and valid for successful renewal processing
        </Text>
      </View>
    )}

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
          <Text style={{ color: 'white', fontWeight: '600' }}>
            {isRenewal ? 'Review Renewal' : 'Next'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  </View>
)}

       {/* Step 5: Review Information */}
{step === 5 && (
  <View>
    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' }}>
      {isRenewal ? 'Review Renewal Application' : 'Review Application'}
    </Text>
    <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 24, fontSize: 16 }}>
      {isRenewal 
        ? 'Please review your renewal information before submitting'
        : 'Please review your information before submitting'
      }
    </Text>

    {/* Show renewal banner */}
    {isRenewal && (
      <View style={{
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#DBEAFE',
        flexDirection: 'row',
        alignItems: 'center'
      }}>
        <FontAwesome5 name="sync-alt" size={18} color="#3B82F6" />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1E40AF', marginBottom: 4 }}>
            Renewal Application
          </Text>
          <Text style={{ color: '#1E40AF', fontSize: 14 }}>
            {category === 'student' 
              ? 'Updating academic details for your student discount renewal'
              : `Updating documents for your ${category} discount renewal`
            }
          </Text>
        </View>
      </View>
    )}

    {/* Personal Information - Show for new applications or student renewals */}
    {(!isRenewal || category === 'student') && (
      <View style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>
          {isRenewal ? 'Updated Personal Information' : 'Personal Information'}
        </Text>
        
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
    )}

    {/* Show existing details message for PWD/Senior renewals */}
    {isRenewal && (category === 'pwd' || category === 'senior') && (
      <View style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>Personal Information</Text>
        <View style={{
          backgroundColor: '#EFF6FF',
          padding: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#DBEAFE',
          alignItems: 'center'
        }}>
          <FontAwesome5 name="info-circle" size={20} color="#3B82F6" style={{ marginBottom: 8 }} />
          <Text style={{ color: '#1E40AF', fontSize: 14, textAlign: 'center', fontWeight: '500' }}>
            Using existing personal details from your previous application
          </Text>
          <Text style={{ color: '#1E40AF', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
            Only documents are being updated for this renewal
          </Text>
        </View>
      </View>
    )}

    {/* Category-Specific Information - Show for new applications or student renewals */}
    {category === "student" && (!isRenewal || category === 'student') && (
      <View style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>
          {isRenewal ? 'Updated School Information' : 'School Information'}
        </Text>
        
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

        {isRenewal && (
          <View style={{
            backgroundColor: '#FEF3C7',
            padding: 12,
            borderRadius: 8,
            marginTop: 12,
            borderWidth: 1,
            borderColor: '#FCD34D'
          }}>
            <Text style={{ color: '#92400E', fontSize: 12, textAlign: 'center', fontWeight: '500' }}>
              Updated academic information for renewal
            </Text>
          </View>
        )}
      </View>
    )}

    {/* PWD Information - Only show for new applications */}
    {category === "pwd" && !isRenewal && (
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

    {/* Senior Information - Only show for new applications */}
    {category === "senior" && !isRenewal && (
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

    {/* Uploaded Documents - Show different message for renewals */}
    <View style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 20, marginBottom: 32 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>
        {isRenewal ? 'Updated Documents' : 'Uploaded Documents'}
      </Text>
      
      <View style={{ gap: 16 }}>
        {fileRequirements[category]?.map((label, index) => {
          const camelKey = toCamelCase(label);
          return (
            <View key={index}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#6B7280', marginBottom: 8 }}>
                {label}
                {isRenewal && (
                  <Text style={{ color: '#F59E0B', fontWeight: '500' }}> (Updated)</Text>
                )}
              </Text>
              {files[camelKey]?.uri ? (
                <View style={{ borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB', position: 'relative' }}>
                  <Image
                    source={{ uri: files[camelKey].uri }}
                    style={{ width: '100%', height: 120 }}
                    resizeMode="cover"
                  />
                  {isRenewal && (
                    <View style={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      backgroundColor: '#F59E0B', 
                      borderRadius: 12, 
                      paddingHorizontal: 8,
                      paddingVertical: 4
                    }}>
                      <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>UPDATED</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={{
                  height: 60,
                  borderWidth: 1,
                  borderColor: isRenewal ? '#FEF3C7' : '#FEF3C7',
                  backgroundColor: '#FFFBEB',
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text style={{ color: '#D97706', fontSize: 14 }}>
                    {isRenewal ? 'Document required for renewal' : 'No document uploaded'}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Show renewal document note */}
      {isRenewal && (
        <View style={{
          backgroundColor: '#F0FDF4',
          padding: 12,
          borderRadius: 8,
          marginTop: 16,
          borderWidth: 1,
          borderColor: '#BBF7D0'
        }}>
          <Text style={{ color: '#15803D', fontSize: 12, textAlign: 'center', fontWeight: '500' }}>
            {category === 'student' 
              ? 'No document upload required for student renewal'
              : 'These documents will replace your previous ones for renewal processing'
            }
          </Text>
        </View>
      )}
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
          <Text style={{ color: 'white', fontWeight: '600' }}>
            {isRenewal ? 'Submit Renewal' : 'Submit Application'}
          </Text>
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
      <FontAwesome5 name={isRenewal ? "sync-alt" : "check"} size={32} color="white" />
    </View>
   
    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' }}>
      {isRenewal ? 'Renewal Submitted!' : 'Application Submitted!'}
    </Text>
   
    <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 24, fontSize: 16, lineHeight: 24 }}>
      {isRenewal 
        ? `Your ${category} discount renewal has been successfully submitted.`
        : 'Your discount application has been successfully submitted.'
      }
    </Text>

    {/* Renewal-specific information */}
    {isRenewal && (
      <View style={{
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#DBEAFE',
        width: '100%',
        maxWidth: 400
      }}>
        <Text style={{ color: '#1E40AF', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
          {category === 'student' 
            ? 'Your updated academic information has been submitted for review. No additional documents were required.'
            : `Your updated ${category === 'pwd' ? 'PWD documents' : 'senior citizen documents'} have been submitted for review.`
          }
        </Text>
      </View>
    )}

    <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 32, fontSize: 14, lineHeight: 20 }}>
      {isRenewal
        ? 'Your renewal will be processed and you\'ll receive a notification once it\'s reviewed and approved.'
        : 'You\'ll receive a notification once it\'s reviewed and approved.'
      }
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

    {/* Additional action for renewals */}
    {isRenewal && (
      <TouchableOpacity
        onPress={() => router.push('/discount')}
        style={{
          marginTop: 12,
          paddingVertical: 12,
          paddingHorizontal: 24
        }}
      >
        <Text style={{ color: '#6B7280', fontSize: 14, textDecorationLine: 'underline' }}>
          View Discount Status
        </Text>
      </TouchableOpacity>
    )}
  </View>
)}
</ScrollView>
</View>
  )}