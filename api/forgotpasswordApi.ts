import axiosInstance from "./axiosIntance";

export const sendResetLink = async (email: string) => {
  const res = await axiosInstance.post("/auth/send-password-reset", { email });
  return res.data;
};

