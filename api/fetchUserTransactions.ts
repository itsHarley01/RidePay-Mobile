import axiosInstance from './axiosIntance';
 
interface GetTransactionFilters {
  type?: string;
  fromUser?: string;
  startTimestamp?: number;
  endTimestamp?: number;
}

export const getTransactions = async (filters: GetTransactionFilters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (filters.type) queryParams.append('type', filters.type);
    if (filters.fromUser) queryParams.append('fromUser', filters.fromUser);
    if (filters.startTimestamp) queryParams.append('startTimestamp', filters.startTimestamp.toString());
    if (filters.endTimestamp) queryParams.append('endTimestamp', filters.endTimestamp.toString());

    const res = await axiosInstance.get(`/transactions?${queryParams.toString()}`);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    throw error.response?.data || error;
  }
};