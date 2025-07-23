import FloatingLabelInput from '@/components/FloatingLabelInput';
import SuccessModal from '@/components/SuccessModal';
import { router } from 'expo-router';
import React, { useState } from 'react';
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
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showModal, setShowModal] = useState(false);

  const validateStep = () => {
    if (step === 1) {
      if (!firstName.trim() || !lastName.trim()) {
        Alert.alert('Missing Fields', 'Please enter your first and last name.');
        return false;
      }
    }

    if (step === 2) {
      if (!email.trim() || !phoneNumber.trim()) {
        Alert.alert('Missing Fields', 'Please enter your email and phone number.');
        return false;
      }
    }

    if (step === 3) {
      if (!password || !confirmPassword) {
        Alert.alert('Missing Fields', 'Please enter and confirm your password.');
        return false;
      }
      if (password !== confirmPassword) {
        Alert.alert('Password Mismatch', 'Passwords do not match.');
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = () => {
    if (validateStep()) {
      setShowModal(true);
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
    <View className="w-full pt-10 pb-4 px-6 bg-white">
      <View className="flex-row justify-between items-center mb-2">
        {[1, 2, 3].map((stepNumber) => (
          <View key={stepNumber} className="flex-1 items-center">
            <View
              className={`w-7 h-7 rounded-full ${getStepColor(
                stepNumber
              )} items-center justify-center mb-1`}
            >
              <Text className="text-white font-semibold text-sm text-center">
                {getStepIcon(stepNumber)}
              </Text>
            </View>
            <Text className="text-[11px] text-gray-500 text-center">
              {stepNumber === 1
                ? 'Name'
                : stepNumber === 2
                ? 'Contact'
                : 'Password'}
            </Text>
          </View>
        ))}
      </View>
      <View className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <View
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(step / 3) * 100}%`,
            backgroundColor: '#0A2A54',
          }}
        />
      </View>
    </View>
  );

  const renderStepTitle = () => {
    const titles = {
      1: 'Step 1: Personal Information',
      2: 'Step 2: Contact Details',
      3: 'Step 3: Set Password',
    };
    return (
      <Text className="text-lg font-semibold text-center mt-5 mb-3 text-gray-700">
        {titles[step]}
      </Text>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {renderProgressBar()}
      {renderStepTitle()}

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
        <View className="flex-1 justify-center items-center">
          <View className="w-full max-w-md space-y-5">
            {step === 1 && (
              <>
                <FloatingLabelInput
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                />
                <FloatingLabelInput
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                />
                <TouchableOpacity
                  className="bg-[#0A2A54] py-3 rounded-full shadow-sm mt-4"
                  onPress={nextStep}
                >
                  <Text className="text-white text-center font-medium text-base">Next</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
              <>
                <FloatingLabelInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoComplete="email"
                />
                <FloatingLabelInput
                  label="Phone Number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
                <View className="flex-row justify-between space-x-3 mt-4">
                  <TouchableOpacity
                    className="flex-1 border border-blue-600 py-3 rounded-full"
                    onPress={prevStep}
                  >
                    <Text className="text-blue-600 text-center font-medium text-base">Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-[#0A2A54] py-3 rounded-full shadow-sm"
                    onPress={nextStep}
                  >
                    <Text className="text-white text-center font-medium text-base">Next</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {step === 3 && (
              <>
                <FloatingLabelInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="new-password"
                />
                <FloatingLabelInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
                <View className="flex-row justify-between space-x-3 mt-4">
                  <TouchableOpacity
                    className="flex-1 border border-blue-600 py-3 rounded-full"
                    onPress={prevStep}
                  >
                    <Text className="text-blue-600 text-center font-medium text-base">Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-[#0A2A54] py-3 rounded-full shadow-sm"
                    onPress={handleSubmit}
                  >
                    <Text className="text-white text-center font-medium text-base">Submit</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
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
