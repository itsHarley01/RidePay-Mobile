import axiosInstance from './axiosIntance';

export const getNotifications = async (userId: string) => {
  try {
    const res = await axiosInstance.get(`/notifications?userId=${userId}`);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    throw error.response?.data || error;
  }
};
