import FloatingLabelInput from '@/components/FloatingLabelInput';
import SuccessModal from '@/components/SuccessModal';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
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

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = () => {
    setShowModal(true);
  };

  const getStepIcon = (stepNumber: number) => {
    if (stepNumber < step) return '✓';
    return stepNumber.toString();
  };

  const getStepColor = (stepNumber: number) => {
    if (stepNumber < step) return 'bg-green-500';
    if (stepNumber === step) return 'bg-blue-700';
    return 'bg-gray-300';
  };

  const renderProgressBar = () => (
    <View className="w-full pt-12 px-6 bg-white">
      <View className="flex-row justify-between items-center mb-3">
        {[1, 2, 3].map((stepNumber) => (
          <View key={stepNumber} className="flex-1 items-center">
            <View
              className={`w-8 h-8 rounded-full ${getStepColor(
                stepNumber
              )} items-center justify-center mb-1`}
            >
              <Text className="text-white font-bold text-sm text-center">
                {getStepIcon(stepNumber)}
              </Text>
            </View>
            <Text className="text-xs text-gray-500 text-center">
              {stepNumber === 1
                ? 'Name'
                : stepNumber === 2
                ? 'Contact'
                : 'Password'}
            </Text>
          </View>
        ))}
      </View>
      <View className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
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
      1: 'Step 1: Name',
      2: 'Step 2: Contact Info',
      3: 'Step 3: Create Password',
    };
    return (
      <Text className="text-xl font-semibold text-center mt-6 mb-4 text-gray-800">
        {titles[step]}
      </Text>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Top Progress Bar */}
      {renderProgressBar()}

      {/* Title under progress bar */}
      {renderStepTitle()}

      {/* Step content centered */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
        <View className="flex-1 justify-center items-center">
          <View className="w-full max-w-md">
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
                  className='h-32'
                />
                <TouchableOpacity
                  className="bg-blue-700 py-3 rounded-full"
                  onPress={nextStep}
                >
                  <Text className="text-white text-center font-semibold text-base">Next</Text>
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
                <View className="flex-row justify-between space-x-4">
                  <TouchableOpacity
                    className="flex-1 border border-blue-700 py-3 rounded-full"
                    onPress={prevStep}
                  >
                    <Text className="text-blue-700 text-center font-semibold text-base">Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-blue-700 py-3 rounded-full"
                    onPress={nextStep}
                  >
                    <Text className="text-white text-center font-semibold text-base">Next</Text>
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
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  className="border rounded-xl px-4 py-3 mb-6 text-base"
                />
                <View className="flex-row justify-between space-x-4">
                  <TouchableOpacity
                    className="flex-1 border border-blue-700 py-3 rounded-full"
                    onPress={prevStep}
                  >
                    <Text className="text-blue-700 text-center font-semibold text-base">Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-blue-700 py-3 rounded-full"
                    onPress={handleSubmit}
                  >
                    <Text className="text-white text-center font-semibold text-base">Submit</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
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
