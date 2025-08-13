import axiosInstance from './axiosIntance';
import { Platform } from 'react-native';

interface FileData {
  uri: string;
  name: string;
  type: string;
}

interface DiscountApplicationData {
  userId: string;
  category: 'student' | 'senior' | 'pwd';
  data: Record<string, any>;
  files?: Record<string, FileData>;
}

export const submitDiscountApplication = async ({
  userId,
  category,
  data,
  files,
}: DiscountApplicationData) => {
  try {
    const formData = new FormData();

    // Required text fields
    formData.append('userId', userId);
    formData.append('category', category);
    formData.append('data', JSON.stringify(data)); // Send as JSON string

    // Append files (if any)
    if (files) {
      Object.entries(files).forEach(([fieldName, file]) => {
  const normalizedName = fieldName.toLowerCase(); // or map manually to backend's expected keys
  formData.append(normalizedName, {
    uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
    name: file.name || `${normalizedName}.jpg`,
    type: file.type || 'application/octet-stream',
  } as any);
});

    }

    console.log('🚀 Sending formData with fields:', {
      userId,
      category,
      data,
      fileFields: files ? Object.keys(files) : [],
    });

    const response = await axiosInstance.post('/discount/apply', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      '❌ Error submitting discount application:',
      error.response?.data || error.message
    );
    throw error.response?.data || { error: 'Failed to submit discount application' };
  }
};
