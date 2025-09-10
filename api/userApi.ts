// userApi.ts
import axiosInstance from './axiosIntance';

export interface RegisterPassengerInput {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  password: string;
  contactNumber: string;
}

export const updateUserProfile = async (
  uid: string,
  updates: { firstName?: string; lastName?: string; middleName?: string; contactNumber?: string }
) => {
  try {
    console.log("📤 Sending profile update:", updates);
    const response = await axiosInstance.put(`/passengers/edit/${uid}`, updates);
    console.log("✅ Update success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error updating user profile:",
      error.response?.data || error.message
    );
    throw error.response?.data || { error: "Failed to update passenger data" };
  }
};

export const registerPassenger = async (passengerData: RegisterPassengerInput) => {
  try {
    const response = await axiosInstance.post(`/passengers`, passengerData);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error registering passenger:", error);
    throw error;
  }
};

// 👇 New: Fetch passenger profile
export const fetchUserDataByUid = async (uid: string) => {
  try {
    const response = await axiosInstance.get(`/passengers/user/${uid}`);
    return response.data; // should return { firstName, lastName, email, ... }
  } catch (error: any) {
    console.error('❌ Error fetching user data by UID:', error.response?.data || error.message);
    throw error.response?.data || { error: 'Failed to fetch passenger data' };
  }
};