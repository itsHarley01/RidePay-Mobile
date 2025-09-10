import axiosInstance from "./axiosIntance";

interface SendOtpResponse {
  success: boolean;
  message: string;
}

interface VerifyOtpResponse {
  success: boolean;
  message: string;
}

export const sendOtp = async (email: string): Promise<SendOtpResponse> => {
  const res = await axiosInstance.post<SendOtpResponse>(
    "/send-otp",
    { email }
  );
  return res.data;
};

export const verifyOtp = async (
  email: string,
  otp: string
): Promise<VerifyOtpResponse> => {
  const res = await axiosInstance.post<VerifyOtpResponse>(
    "/verify-otp",
    { email, otp }
  );
  return res.data;
};

