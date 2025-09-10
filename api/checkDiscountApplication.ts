// File: api/checkDiscount.ts
import axiosInstance from './axiosIntance';

export const checkDiscountApplication = async (userId: string) => {
  const res = await axiosInstance.get(`/discounts/status/${userId}`);
  return res.data; // should return { applied: true/false }
};