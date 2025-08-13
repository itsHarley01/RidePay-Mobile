import axiosInstance from './axiosIntance';

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

// 🔹 Submit a discount application
export const submitDiscountApplication = async ({
  userId,
  category,
  data,
  files,
}: DiscountApplicationData) => {
  try {
    const formData = new FormData();

    // Append JSON data
    formData.append('data', JSON.stringify(data));
    formData.append('userId', userId);
    formData.append('category', category);

    // Append files
    if (files) {
      Object.entries(files).forEach(([fieldName, file]) => {
        formData.append(fieldName, {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any); // Axios needs any type here
      });
    }

    const response = await axiosInstance.post('/discount/apply', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Axios sets boundary automatically
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error submitting discount application:', error.response?.data || error.message);
    throw error.response?.data || { error: 'Failed to submit discount application' };
  }
};
