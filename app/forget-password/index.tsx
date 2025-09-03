import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import SuccessModal from "@/components/SuccessModal";
import { router } from "expo-router";
import { sendOtp as apiSendOtp, verifyOtp as apiVerifyOtp } from "@/api/otpApi";
import axiosInstance from "@/api/axiosIntance";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showModal, setShowModal] = useState(false);

  // countdown for resend OTP
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // --- Send OTP ---
  const handleSendOtp = async () => {
    setErrors({});
    if (!email.trim()) {
      setErrors({ email: "Email is required." });
      return;
    }
    if (!email.includes("@")) {
      setErrors({ email: "Please enter a valid email." });
      return;
    }

    try {
      const res = await apiSendOtp(email.trim());
      if (res.success) {
        setOtpSent(true);
        setOtp("");
        setTimer(60);
        Alert.alert("OTP Sent", res.message);
      } else {
        Alert.alert("Failed", res.message);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to send OTP.");
    }
  };

  // --- Verify OTP ---
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setErrors({ otp: "Please enter your OTP." });
      return;
    }

    try {
      const res = await apiVerifyOtp(email.trim(), otp.trim());
      if (res.success) {
        setStep(3); // proceed to reset password step
      } else {
        setErrors({ otp: res.message || "Invalid OTP." });
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "OTP verification failed.");
    }
  };

  // --- Reset Password ---
  const handleResetPassword = async () => {
    setErrors({});
    if (!newPassword) {
      setErrors({ newPassword: "New password is required." });
      return;
    }
    if (
      !/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(newPassword)
    ) {
      setErrors({
        newPassword:
          "Password must be at least 8 characters, include 1 uppercase and 1 special character.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    try {
      // example API call for reset password
      await axiosInstance.post("/reset-password", {
        email: email.trim(),
        password: newPassword,
      });

      setShowModal(true);
    } catch (err: any) {
      Alert.alert(
        "Reset Failed",
        err?.response?.data?.message || "Something went wrong."
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-6 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-md p-6 space-y-6 mt-10">
          {step === 1 && (
            <>
              <Text className="text-xl font-semibold text-center mb-4">
                Forgot Password
              </Text>

              <FloatingLabelInput
                label="Email"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setErrors({});
                  setOtpSent(false);
                  setOtp("");
                }}
                keyboardType="email-address"
              />
              {errors.email && (
                <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
              )}

              {!otpSent ? (
                <TouchableOpacity
                  className="bg-[#0A2A54] py-3 rounded-xl mt-4"
                  onPress={handleSendOtp}
                >
                  <Text className="text-white text-center font-medium">
                    Send OTP
                  </Text>
                </TouchableOpacity>
              ) : (
                <>
                  <FloatingLabelInput
  label="OTP"
  value={otp}
  onChangeText={async (t) => {
    if (/^[A-Za-z0-9]{0,4}$/.test(t)) {
      setOtp(t);
      setErrors({});
      // auto verify when length is 4
      if (t.length === 4) {
        try {
          const res = await apiVerifyOtp(email.trim(), t.trim());
          if (res.success) {
            setStep(3);
          } else {
            setErrors({ otp: res.message || "Invalid OTP." });
          }
        } catch (err: any) {
          setErrors({ otp: err?.message || "OTP verification failed." });
        }
      }
    }
  }}
  autoCapitalize="characters"
  maxLength={4}
/>
{errors.otp && (
  <Text className="text-red-500 text-xs mt-1">{errors.otp}</Text>
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
                      <Text className="text-white text-center font-medium">
                        Resend OTP
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    className="bg-[#0A2A54] py-3 rounded-xl mt-4"
                    onPress={handleVerifyOtp}
                    disabled={!otp.trim()}
                  >
                    <Text className="text-white text-center font-medium">
                      Verify OTP
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <Text className="text-xl font-semibold text-center mb-4">
                Reset Password
              </Text>

              <FloatingLabelInput
                label="New Password"
                value={newPassword}
                onChangeText={(t) => setNewPassword(t)}
                secureTextEntry
              />
              {errors.newPassword && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.newPassword}
                </Text>
              )}

              <FloatingLabelInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(t) => setConfirmPassword(t)}
                secureTextEntry
              />
              {errors.confirmPassword && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </Text>
              )}

              <TouchableOpacity
                className={`bg-[#0A2A54] py-3 rounded-xl mt-4 ${
                  !newPassword || !confirmPassword
                    ? "opacity-50"
                    : "opacity-100"
                }`}
                onPress={handleResetPassword}
              >
                <Text className="text-white text-center font-medium">
                  Reset Password
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      <SuccessModal
        visible={showModal}
        message="Password reset successful. You can now log in with your new password."
        onClose={() => {
          setShowModal(false);
          router.replace("/login");
        }}
      />
    </View>
  );
}
