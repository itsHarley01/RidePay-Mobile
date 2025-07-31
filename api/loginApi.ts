import axiosInstance from './axiosIntance';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  uid: string;
}

export const loginPassenger = async (credentials: LoginInput): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post('/passengers/login', credentials);
    return response.data;
  } catch (error: any) {
    console.error('❌ Login error:', error?.response?.data || error.message);
    throw error?.response?.data || { message: 'Login failed' };
  }
};
