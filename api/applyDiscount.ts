import { Platform } from 'react-native';
import axiosInstance from './axiosIntance';

interface FileData {
  uri: string;
  name: string;
  type: string;
}

interface DiscountApplicationData {
  userId: string;
  category: 'student' | 'senior' | 'pwd';
  data?: Record<string, any>;
  files?: Record<string, FileData>;
}

// ✅ New applications
export const submitDiscountApplication = async ({
  userId,
  category,
  data,
  files,
}: DiscountApplicationData) => {
  try {
    const formData = new FormData();

    formData.append('userId', userId);
    formData.append('category', category);
    formData.append('data', JSON.stringify(data)); // keep consistent with backend

    if (files) {
      Object.entries(files).forEach(([fieldName, file]) => {
        const normalizedName = fieldName.toLowerCase();
        formData.append(normalizedName, {
          uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
          name: file.name || `${normalizedName}.jpg`,
          type: file.type || 'application/octet-stream',
        } as any);
      });
    }

    console.log('🚀 Sending NEW application formData:', {
      userId,
      category,
      data,
      fileFields: files ? Object.keys(files) : [],
    });

    const response = await axiosInstance.post('/discount/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error submitting discount application:', error.response?.data || error.message);
    throw error.response?.data || { error: 'Failed to submit discount application' };
  }
};

// Fetch applications
export interface DiscountApplication {
  id: string;
  category: 'student' | 'senior' | 'pwd';
  data: Record<string, any>;
  file: Record<string, string>;
  status: {
    dateOfApplication: string;
    dateOfApproval?: string;
    discountExpiration?: string;
    status: 'approved' | 'pending' | 'rejected';
  };
  userId: string;
}

export const getDiscountApplications = async (): Promise<DiscountApplication[]> => {
  try {
    const response = await axiosInstance.get('/discount/applications');
    return response.data as DiscountApplication[];
  } catch (error: any) {
    console.error('❌ Error fetching discount applications:', error.response?.data || error.message);
    throw error.response?.data || { error: 'Failed to fetch discount applications' };
  }
};

// ✅ Renewals (fixed with discountId)
export const submitDiscountRenewal = async ({
  userId,
  discountId,   // 🔥 add discountId
  category,
  data,
  files,
}: DiscountApplicationData & { discountId: string }) => {
  try {
    const formData = new FormData();

    formData.append('userId', userId);
    formData.append('discountId', discountId); // 🔑 backend needs this
    formData.append('category', category);
    formData.append('data', JSON.stringify(data));

    if (files) {
      Object.entries(files).forEach(([fieldName, file]) => {
        const normalizedName = fieldName.toLowerCase();
        formData.append(normalizedName, {
          uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
          name: file.name || `${normalizedName}.jpg`,
          type: file.type || 'application/octet-stream',
        } as any);
      });
    }

    console.log('🔄 Sending RENEWAL formData:', {
      userId,
      discountId,
      category,
      data,
      fileFields: files ? Object.keys(files) : [],
    });

    // 🔥 Calls backend endpoint for renewals
    const response = await axiosInstance.post('/discount/renew', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error submitting discount renewal:', error.response?.data || error.message);
    throw error.response?.data || { error: 'Failed to submit discount renewal' };
  }
};
