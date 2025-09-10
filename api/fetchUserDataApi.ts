import axiosInstance from './axiosIntance';
// 🔹 Fetch passenger data by UID
export const fetchUserDataByUid = async (uid: string) => {
  try {
    const response = await axiosInstance.get(`/passengers/user/${uid}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching user data by UID:', error.response?.data || error.message);
    throw error.response?.data || { error: 'Failed to fetch passenger data' };
  }
};
