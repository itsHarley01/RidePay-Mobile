import AsyncStorage from '@react-native-async-storage/async-storage';

const UID_KEY = 'ridepay_uid';
const TOKEN_KEY = 'ridepay_token';

export const saveAuthData = async (uid: string, token: string) => {
  try {
    await AsyncStorage.multiSet([
      [UID_KEY, uid],
      [TOKEN_KEY, token],
    ]);
  } catch (error) {
    console.error('❌ Failed to save auth data:', error);
  }
};

export const getAuthData = async (): Promise<{ uid: string | null; token: string | null }> => {
  try {
    const values = await AsyncStorage.multiGet([UID_KEY, TOKEN_KEY]);
    return {
      uid: values[0][1],
      token: values[1][1],
    };
  } catch (error) {
    console.error('❌ Failed to get auth data:', error);
    return { uid: null, token: null };
  }
};

export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([UID_KEY, TOKEN_KEY]);
  } catch (error) {
    console.error('❌ Failed to clear auth data:', error);
  }
};
