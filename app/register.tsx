import { router } from 'expo-router';
import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

export default function RegisterPage() {
  const [step, setStep] = useState(1);

  // Form fields (optional: move to single state object)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <View className="flex-1 justify-center items-center px-4 bg-white">
      {step === 1 && (
        <View className="w-full">
          <Text className="text-xl mb-4">Step 1: Name</Text>
          <TextInput
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            className="border rounded p-2 mb-2"
          />
          <TextInput
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            className="border rounded p-2 mb-4"
          />
          <Button title="Next" onPress={nextStep} />
        </View>
      )}

      {step === 2 && (
        <View className="w-full">
          <Text className="text-xl mb-4">Step 2: Account Info</Text>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            className="border rounded p-2 mb-2"
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="border rounded p-2 mb-2"
          />
          <TextInput
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            className="border rounded p-2 mb-4"
          />
          <View className="flex-row justify-between">
            <Button title="Back" onPress={prevStep} />
            <Button title="Next" onPress={nextStep} />
          </View>
        </View>
      )}

      {step === 3 && (
        <View className="w-full items-center">
          <Text className="text-xl mb-4 text-center">🎉 Registration Complete!</Text>
          <Button title="Back to Login" onPress={() => router.replace('/')} />
        </View>
      )}
    </View>
  );
}
