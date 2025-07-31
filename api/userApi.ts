import axiosInstance from './axiosIntance';

export interface RegisterPassengerInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
}

export const registerPassenger = async (passengerData: RegisterPassengerInput) => {
  try {
    const response = await axiosInstance.post(`/passengers`, passengerData);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error registering passenger:', error?.response?.data || error.message);
    throw error?.response?.data || { error: 'Network error' };
  }
};
