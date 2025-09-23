import { registerPassenger } from '@/api/userApi';
import { sendOtp as apiSendOtp, verifyOtp as apiVerifyOtp } from '@/api/otpApi';
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
  ActivityIndicator
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
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    if (timer <= 0) return;
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
      setLoadingOtp(true);
      const res = await apiSendOtp(email.trim());
      if (res.success) {
        setOtpSent(true);
        setOtp('');
        setTimer(60);
        setError(res.message);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP.');
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleVerifyOtpAndNext = async () => {
    if (!otp.trim()) {
      setErrors((prev) => ({ ...prev, otp: 'Please enter your OTP.' }));
      return;
    }

    try {
      const res = await apiVerifyOtp(email.trim(), otp.trim());
      if (res.success) {
        nextStep();
      } else {
        setErrors((prev) => ({ ...prev, otp: res.message || 'Invalid OTP.' }));
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'OTP verification failed.');
    }
  };

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
      } else if (!/[A-Z]/.test(password) && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        newErrors.password =
          'Password must contain at least one uppercase letter or one special character.';
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
      setError('');
      setErrors({});
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
    setLoadingSubmit(true);
    const payload: any = {
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: password,
      contactNumber: phoneNumber.trim(),
    };

    await registerPassenger(payload);
    setShowModal(true);

  } catch (error: any) {
    console.error('Registration Error:', error);

    // ✅ Duplicate phone number check
    if (
      error?.response?.status === 409 &&
      error?.response?.data?.message?.includes('phone')
    ) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: 'This phone number is already registered.',
      }));
      return;
    }

    // ✅ Duplicate email check (if backend throws it differently)
    if (
      error?.response?.status === 409 &&
      error?.response?.data?.message?.includes('email')
    ) {
      setErrors((prev) => ({
        ...prev,
        email: 'This email is already registered.',
      }));
      return;
    }

    Alert.alert(
      'Registration Failed',
      error?.error || 'Something went wrong. Please try again.'
    );
  } finally {
    setLoadingSubmit(false);
  }
};

  // Minimalist Progress Bar
  const renderProgressBar = () => (
    <View className="px-6 py-8 bg-white">
      <Text className="text-2xl font-light text-gray-900 text-center mb-8">
        Create Account
      </Text>
      
      {/* Simple Progress Dots */}
      <View className="flex-row justify-center items-center mb-8">
        {[1, 2, 3].map((stepNumber) => (
          <View key={stepNumber} className="flex-row items-center">
            <View
              className={`w-3 h-3 rounded-full ${
                stepNumber <= step ? 'bg-gray-900' : 'bg-gray-200'
              }`}
            />
            {stepNumber < 3 && (
              <View
                className={`w-12 h-px mx-2 ${
                  stepNumber < step ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              />
            )}
          </View>
        ))}
      </View>

      {/* Step Labels */}
      <Text className="text-center text-gray-500 text-sm">
        Step {step} of 3: {
          step === 1 ? 'Email Verification' :
          step === 2 ? 'Personal Details' :
          'Security Setup'
        }
      </Text>
    </View>
  );

  const renderErrorMessage = (fieldError: string) => (
    fieldError && (
      <Text className="text-red-500 text-sm mt-1 leading-relaxed">
        {fieldError}
      </Text>
    )
  );

  const renderButton = (
    title: string,
    onPress: () => void,
    variant: 'primary' | 'secondary' = 'primary',
    disabled: boolean = false,
    loading: boolean = false
  ) => (
    <TouchableOpacity
      className={`py-4 px-6 rounded-lg ${
        variant === 'primary'
          ? disabled
            ? 'bg-gray-200'
            : 'bg-gray-900'
          : 'border border-gray-300'
      }`}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : 'black'} />
      ) : (
        <Text
          className={`text-center font-medium ${
            variant === 'primary'
              ? disabled
                ? 'text-gray-400'
                : 'text-white'
              : 'text-gray-700'
          }`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {renderProgressBar()}

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pb-8 flex-1">
          
          {/* Step 1 - Email + OTP */}
          {step === 1 && (
            <View className="space-y-6">
              <View>
                <Text className="text-lg font-medium text-gray-900 mb-6">
                  Let's start with your email
                </Text>
                
                <FloatingLabelInput
                  label="Email address"
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
                {renderErrorMessage(errors.email)}
                {error && (
                  <Text className="text-red-500 text-sm mt-1">
                    {error === "Request failed with status code 400"
                      ? "Email already exists"
                      : error}
                  </Text>
                )}
              </View>

              {/* OTP Section */}
              {otpSent && (
                <View className="space-y-4">
                  <View>
                    <Text className="text-sm text-gray-600 mb-4">
                      We've sent a verification code to {email}
                    </Text>
                    
                    <FloatingLabelInput
                      label="Verification code"
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
                    {renderErrorMessage(errors.otp)}
                  </View>

                  {timer > 0 ? (
                    <Text className="text-sm text-gray-500 text-center">
                      Resend code in {timer}s
                    </Text>
                  ) : (
                    <TouchableOpacity
                      className="py-2"
                      onPress={handleSendOtp}
                      disabled={loadingOtp}
                    >
                      <Text className="text-gray-900 text-center font-medium underline">
                        {loadingOtp ? 'Sending...' : 'Resend code'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Action Buttons */}
              <View className="pt-8">
                {!otpSent ? (
                  renderButton(
                    'Send verification code',
                    handleSendOtp,
                    'primary',
                    !email.includes('@'),
                    loadingOtp
                  )
                ) : (
                  renderButton(
                    'Verify & Continue',
                    handleVerifyOtpAndNext,
                    'primary',
                    !email.includes('@') || !otpSent || otp.trim().length === 0
                  )
                )}
              </View>
            </View>
          )}

          {/* Step 2 - Personal Information */}
          {step === 2 && (
            <View className="space-y-6">
              <Text className="text-lg font-medium text-gray-900 mb-6">
                Tell us about yourself
              </Text>

              <View className="space-y-4">
                <View>
                  <FloatingLabelInput
                    label="First name"
                    value={firstName}
                    onChangeText={(t) => {
                      setFirstName(t);
                      setErrors((e) => ({ ...e, firstName: '' }));
                    }}
                  />
                  {renderErrorMessage(errors.firstName)}
                </View>

                <View>
                  <FloatingLabelInput
                    label="Middle name (optional)"
                    value={middleName}
                    onChangeText={setMiddleName}
                  />
                </View>

                <View>
                  <FloatingLabelInput
                    label="Last name"
                    value={lastName}
                    onChangeText={(t) => {
                      setLastName(t);
                      setErrors((e) => ({ ...e, lastName: '' }));
                    }}
                  />
                  {renderErrorMessage(errors.lastName)}
                </View>

                <View>
                  <FloatingLabelInput
                    label="Phone number"
                    value={phoneNumber}
                    onChangeText={(t) => {
                      const digitsOnly = t.replace(/\D/g, '');
                      setPhoneNumber(digitsOnly);
                      setErrors((e) => ({ ...e, phoneNumber: '' }));
                    }}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                  />
                  {renderErrorMessage(errors.phoneNumber)}
                </View>
              </View>

              {/* Navigation Buttons */}
              <View className="flex-row space-x-4 pt-8">
                <View className="flex-1">
                  {renderButton('Back', prevStep, 'secondary')}
                </View>
                <View className="flex-1">
                  {renderButton(
                    'Continue',
                    nextStep,
                    'primary',
                    !firstName.trim() ||
                    !lastName.trim() ||
                    !/^[0-9]{10,11}$/.test(phoneNumber)
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Step 3 - Password Setup */}
          {step === 3 && (
            <View className="space-y-6">
              <Text className="text-lg font-medium text-gray-900 mb-6">
                Secure your account
              </Text>

              <View className="space-y-4">
                <View>
                  <FloatingLabelInput
                    label="Password"
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      setErrors((e) => ({ ...e, password: '' }));
                    }}
                    secureTextEntry
                  />

                  {/* Password Requirements */}
                  {password.length > 0 && (
                    <View className="mt-3 space-y-1">
                      <View className="flex-row items-center">
                        <View
                          className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                        <Text
                          className={`text-sm ${
                            password.length >= 8 ? 'text-green-600' : 'text-gray-500'
                          }`}
                        >
                          At least 8 characters
                        </Text>
                      </View>
                      
                      <View className="flex-row items-center">
                        <View
                          className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            /[A-Z]/.test(password) || /[!@#$%^&*(),.?":{}|<>]/.test(password)
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                        />
                        <Text
                          className={`text-sm ${
                            /[A-Z]/.test(password) || /[!@#$%^&*(),.?":{}|<>]/.test(password)
                              ? 'text-green-600'
                              : 'text-gray-500'
                          }`}
                        >
                          Uppercase letter or special character
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                <View>
                  <FloatingLabelInput
                    label="Confirm password"
                    value={confirmPassword}
                    onChangeText={(t) => {
                      setConfirmPassword(t);
                      setErrors((e) => ({ ...e, confirmPassword: '' }));
                    }}
                    secureTextEntry
                  />
                  {renderErrorMessage(errors.confirmPassword)}
                </View>
              </View>

              {/* Navigation Buttons */}
              <View className="flex-row space-x-4 pt-8">
                <View className="flex-1">
                  {renderButton('Back', prevStep, 'secondary')}
                </View>
                <View className="flex-1">
                  {renderButton(
                    'Create Account',
                    handleSubmit,
                    'primary',
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword ||
                    password.length < 8 ||
                    (!/[A-Z]/.test(password) && !/[!@#$%^&*(),.?":{}|<>]/.test(password)),
                    loadingSubmit
                  )}
                </View>
              </View>
            </View>
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