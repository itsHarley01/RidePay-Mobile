import { registerPassenger } from '@/api/userApi';
import { sendOtp as apiSendOtp, verifyOtp as apiVerifyOtp } from '@/api/otpApi'; // ✅ import your otp API
import FloatingLabelInput from '@/components/FloatingLabelInput';
import SuccessModal from '@/components/SuccessModal';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [timer, setTimer] = useState(0);
 

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

   useEffect(() => {
  if (timer <= 0) return; // stop when 0
  const interval = setInterval(() => {
    setTimer((prev) => prev - 1);
  }, 1000);
  return () => clearInterval(interval);
}, [timer]);

  const handleSendOtp = async () => {
  setErrors((prev) => ({ ...prev, email: '', otp: '' }));

  if (!email.trim()) {
    setErrors((prev) => ({ ...prev, email: 'Email is required.' }));
    return;
  }
  if (!email.includes('@')) {
    setErrors((prev) => ({ ...prev, email: 'Please enter a valid email.' }));
    return;
  }

  try {
    const res = await apiSendOtp(email.trim());
    if (res.success) {
      setOtpSent(true);
      setOtp('');
      setTimer(60);
      setError(res.message);
    } else {
      // Alert.alert('Failed', res.message);
      setError(res.message);
    }
  } catch (err: any) {
    // Alert.alert('Error', err?.message || 'Failed to send OTP.');
    setError(err?.message || 'Failed to send OTP.');
  }
};

// ✅ handle OTP verify before going next
const handleVerifyOtpAndNext = async () => {
  if (!otp.trim()) {
    setErrors((prev) => ({ ...prev, otp: 'Please enter your OTP.' }));
    return;
  }

  try {
    const res = await apiVerifyOtp(email.trim(), otp.trim());
    if (res.success) {
      nextStep(); // move to Step 2
    } else {
      setErrors((prev) => ({ ...prev, otp: res.message || 'Invalid OTP.' }));
    }
  } catch (err: any) {
    Alert.alert('Error', err?.message || 'OTP verification failed.');
  }
};

// --- inside validateStep ---
const validateStep = () => {
    let newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!email.trim()) {
        newErrors.email = 'Email is required.';
      } else if (!email.includes('@')) {
        newErrors.email = 'Email must contain "@" symbol.';
      }

      if (!otpSent || !otp.trim()) {
        newErrors.otp = 'Please enter the OTP sent to your email.';
      }
    }

    if (step === 2) {
      if (!firstName.trim()) {
        newErrors.firstName = 'First name is required.';
      }
      if (!lastName.trim()) {
        newErrors.lastName = 'Last name is required.';
      }
      if (!phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone number is required.';
      } else {
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phoneNumber)) {
          newErrors.phoneNumber =
            'Phone number must contain only digits and be 10–11 digits long.';
        }
      }
    }

    if (step === 3) {
  if (!password) {
    newErrors.password = 'Password is required.';
  } else if (password.length < 8) {
    newErrors.password = 'Password must be at least 8 characters long.';
  }

  if (!confirmPassword) {
    newErrors.confirmPassword = 'Please confirm your password.';
  } else if (password !== confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match.';
  }
}

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


 const nextStep = () => {
  if (validateStep()) {
    setError(''); // clear global error before moving forward
    setErrors({}); // clear field-specific errors too
    setStep((prev) => prev + 1);
  }
};

const prevStep = () => {
  setError('');
  setErrors({});
  setStep((prev) => prev - 1);
};

  const handleSubmit = async () => {
  if (!validateStep()) return;

  setError('');
  setErrors({});

  try {
    const payload: any = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: password,
      contactNumber: phoneNumber.trim(),
    };

    await registerPassenger(payload);
    setShowModal(true);
  } catch (error: any) {
    console.error('Registration Error:', error);
    Alert.alert(
      'Registration Failed',
      error?.error || 'Something went wrong. Please try again.'
    );
  }
};
  

  const getStepIcon = (stepNumber: number) => {
    if (stepNumber < step) return '✓';
    return stepNumber.toString();
  };

  const getStepColor = (stepNumber: number) => {
    if (stepNumber < step) return 'bg-green-500';
    if (stepNumber === step) return 'bg-blue-600';
    return 'bg-gray-300';
  };

   const renderProgressBar = () => (
    <View className="w-full px-6 pt-6 pb-4 bg-white shadow-sm">
      <View className="flex-row items-center justify-between">
        {[1, 2, 3].map((stepNumber) => (
          <View key={stepNumber} className="flex-1 items-center">
            <View
              className={`w-8 h-8 rounded-full ${getStepColor(
                stepNumber
              )} items-center justify-center`}
            >
              <Text className="text-white font-semibold text-sm">
                {getStepIcon(stepNumber)}
              </Text>
            </View>
            <Text className="text-[11px] text-gray-500 mt-1">
              {stepNumber === 1
                ? 'Contact'
                : stepNumber === 2
                ? 'Name'
                : 'Password'}
            </Text>
          </View>
        ))}
      </View>
      <View className="w-full h-1 bg-gray-200 rounded-full mt-3 overflow-hidden">
        <View
          className="h-full bg-[#0A2A54] rounded-full"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </View>
    </View>
  );


  const renderStepTitle = () => {
    const titles: { [key: number]: string } = {
      1: 'Contact Details',
      2: 'Personal Information',
      3: 'Set Password',
    };
    return (
      <Text className="text-xl font-semibold text-center mt-6 mb-4 text-gray-800">
        {titles[step]}
      </Text>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {renderProgressBar()}
      {renderStepTitle()}

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-6 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-md p-6 space-y-6">
          {/* Step 1 - Email + OTP */}
        {step === 1 && (
  <>
    <FloatingLabelInput
      label="Email"
      value={email}
      onChangeText={(t) => {
        setEmail(t);
        if (otpSent) {
          setOtpSent(false);
          setOtp('');
          setTimer(0);
        }
        setErrors((e) => ({ ...e, email: '' }));
      }}
      keyboardType="email-address"
      autoComplete="email"
    />
    {errors.email && (
      <Text className="text-red-500 text-xs mt-1 ml-1">{errors.email}</Text>
    )}

{error && (
  <Text className="text-red-500 text-xs mt-1 ml-1">
    {error === "Request failed with status code 400"
      ? "Email already exist"
      : error}
  </Text>
)}

    {/* OTP input appears after OTP is sent */}
    {otpSent && (
      <>
        <FloatingLabelInput
          label="OTP"
          value={otp}
          onChangeText={(t) => {
            if (/^[A-Za-z0-9]{0,4}$/.test(t)) {
              setOtp(t);
              setErrors((e) => ({ ...e, otp: '' }));
            }
          }}
          autoCapitalize="characters"
          maxLength={4}
        />
        {errors.otp && (
          <Text className="text-red-500 text-xs mt-1 ml-1">{errors.otp}</Text>
        )}

        {timer > 0 ? (
          <Text className="text-sm text-gray-500 mt-2 text-center">
            Resend OTP in {timer}s
          </Text>
        ) : (
          <TouchableOpacity
            className="bg-[#0A2A54] py-3 rounded-xl mt-3"
            onPress={handleSendOtp}
          >
            <Text className="text-white text-center font-medium">Resend OTP</Text>
          </TouchableOpacity>
        )}
      </>
    )}

    {!otpSent && (
      <TouchableOpacity
        className="bg-[#0A2A54] py-3 rounded-xl mt-3"
        onPress={handleSendOtp}
      >
        <Text className="text-white text-center font-medium">Send OTP</Text>
      </TouchableOpacity>
    )}

    <TouchableOpacity
      onPress={handleVerifyOtpAndNext} // ✅ verify OTP before going next
      disabled={!email.includes('@') || !otpSent || otp.trim().length === 0}
      className={`py-3 rounded-xl shadow-sm mt-4 ${
        !email.includes('@') || !otpSent || otp.trim().length === 0
          ? 'bg-gray-400'
          : 'bg-[#0A2A54]'
      }`}
    >
      <Text className="text-white text-center font-medium text-base">Next</Text>
    </TouchableOpacity>
  </>
)}


          {/* Step 2 - Name + Phone */}
          {step === 2 && (
            <>
              <FloatingLabelInput
                label="First Name"
                value={firstName}
                onChangeText={(t) => {
                  setFirstName(t);
                  setErrors((e) => ({ ...e, firstName: '' }));
                }}
              />
              <FloatingLabelInput
  label="Middle Name (Optional)"
  value={middleName}
  onChangeText={(t) => setMiddleName(t)}
/>
              {errors.firstName && (
                <Text className="text-red-500 text-xs mt-1 ml-1">{errors.firstName}</Text>
              )}

              <FloatingLabelInput
                label="Last Name"
                value={lastName}
                onChangeText={(t) => {
                  setLastName(t);
                  setErrors((e) => ({ ...e, lastName: '' }));
                }}
              />
              {errors.lastName && (
                <Text className="text-red-500 text-xs mt-1 ml-1">{errors.lastName}</Text>
              )}

              <FloatingLabelInput
                label="Phone Number"
                value={phoneNumber}
                onChangeText={(t) => {
                  // only allow digits to be typed (helps UX) but keep value as-is so user can paste
                  const digitsOnly = t.replace(/\D/g, '');
                  setPhoneNumber(digitsOnly);
                  setErrors((e) => ({ ...e, phoneNumber: '' }));
                }}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
              {errors.phoneNumber && (
                <Text className="text-red-500 text-xs mt-1 ml-1">{errors.phoneNumber}</Text>
              )}

              {/* Back + Next buttons */}
              <View className="flex-row justify-between mt-6 space-x-3">
                <TouchableOpacity
                  className="flex-1 border border-[#0A2A54] py-3 rounded-xl"
                  onPress={prevStep}
                >
                  <Text className="text-[#0A2A54] text-center font-medium">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-xl ${
                    !firstName.trim() ||
                    !lastName.trim() ||
                    !/^[0-9]{10,11}$/.test(phoneNumber)
                      ? 'bg-gray-400'
                      : 'bg-[#0A2A54]'
                  }`}
                  onPress={nextStep}
                  disabled={
                    !firstName.trim() ||
                    !lastName.trim() ||
                    !/^[0-9]{10,11}$/.test(phoneNumber)
                  }
                >
                  <Text className="text-white text-center font-medium">Next</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Step 3 - Password + Confirm Password */}
          {step === 3 && (
            <>
<FloatingLabelInput
  label="Password"
  value={password}
  onChangeText={(t) => {
    setPassword(t);
    setErrors((e) => ({ ...e, password: '' }));
  }}
  secureTextEntry
/>

{/* Show live character feedback */}
{password.length > 0 && (
  <Text
    className={`text-xs mt-1 ml-1 ${
      password.length < 8 ? 'text-red-500' : 'text-green-600'
    }`}
  >
    {password.length < 8
      ? `Password must be at least 8 characters. Currently: ${password.length}`
      : `Password length is good (${password.length} characters)`}
  </Text>
)}

{errors.password && (
  <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password}</Text>
)}



          <FloatingLabelInput
  label="Confirm Password"
  value={confirmPassword}
  onChangeText={(t) => {
    setConfirmPassword(t);
    setErrors((e) => ({ ...e, confirmPassword: '' }));
  }}
  secureTextEntry
/>
{errors.confirmPassword && (
  <Text className="text-red-500 text-xs mt-1 ml-1">
    {errors.confirmPassword}
  </Text>
)}



              <View className="flex-row justify-between mt-6 space-x-3">
                <TouchableOpacity
                  className="flex-1 border border-[#0A2A54] py-3 rounded-xl"
                  onPress={prevStep}
                >
                  <Text className="text-[#0A2A54] text-center font-medium">Back</Text>
                </TouchableOpacity>

              <TouchableOpacity
  className={`flex-1 py-3 rounded-xl ${
    !password ||
    !confirmPassword ||
    password !== confirmPassword ||
    password.length < 8
      ? 'bg-gray-400'
      : 'bg-[#0A2A54]'
  }`}
  onPress={handleSubmit}
  disabled={
    !password ||
    !confirmPassword ||
    password !== confirmPassword ||
    password.length < 8
  }
>
  <Text className="text-white text-center font-medium">Submit</Text>
</TouchableOpacity>

              </View>
            </>
          )}
        </View>
      </ScrollView>

      <SuccessModal
        visible={showModal}
        message="Your account has been created successfully."
        onClose={() => {
          setShowModal(false);
          router.replace('/');
        }}
      />
    </View>
  );
}