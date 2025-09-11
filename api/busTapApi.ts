// File: src/api/busTapApi.ts
import axiosInstance from './axiosIntance';

export interface BusTapRequest {
  userId: string;
  busId: string;
  deviceId: string;
}

export interface DiscountInfo {
  type: string;
  rate: number;
  amount: number;
}

export interface PromoInfo {
  [promoId: string]: {
    name: string;
    discount: string;
    amount: number;
  };
}

export interface BusTapResponse {
  success: boolean;
  message: string;
  newBalance?: number;
  finalFare?: number;
  appliedDiscount?: DiscountInfo | null;
  appliedPromos?: PromoInfo;
  error?: string;
}

export const busTapApi = async (data: BusTapRequest): Promise<BusTapResponse> => {
  try {
    const res = await axiosInstance.post<BusTapResponse>('/tap/mqr', data);
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Request failed',
      error: error.message,
    };
  }
};
