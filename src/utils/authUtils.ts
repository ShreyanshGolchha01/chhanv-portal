// Logout utility for clearing authentication data
import AsyncStorage from './AsyncStorage';
import { AuthCookies } from './CookieStorage';

export const logout = async (): Promise<void> => {
  try {
    // Clear all authentication cookies
    await AuthCookies.clearAllAuthCookies();
    
    // Clear localStorage for backward compatibility
    await AsyncStorage.removeItem('isAuthenticated');
    await AsyncStorage.removeItem('isDoctorAuthenticated');
    await AsyncStorage.removeItem('userInfo');
    
    // Don't clear saved email and remember me if user chose to remember
    const rememberMe = await AuthCookies.getAuthCookie('rememberMe');
    if (rememberMe !== 'true') {
      await AuthCookies.removeAuthCookie('savedEmail');
      await AuthCookies.removeAuthCookie('rememberMe');
    }
    
    console.log('Logout successful - all auth data cleared');
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

export const isUserAuthenticated = async (): Promise<{ isAdmin: boolean; isDoctor: boolean }> => {
  try {
    // Check cookies first, then fallback to localStorage
    const adminAuth = await AuthCookies.getAuthCookie('isAuthenticated') || 
                     await AsyncStorage.getItem('isAuthenticated');
    const doctorAuth = await AuthCookies.getAuthCookie('isDoctorAuthenticated') || 
                      await AsyncStorage.getItem('isDoctorAuthenticated');
    
    return {
      isAdmin: adminAuth === 'true',
      isDoctor: doctorAuth === 'true'
    };
  } catch (error) {
    console.error('Error checking authentication:', error);
    return { isAdmin: false, isDoctor: false };
  }
};

export const getUserInfo = async (): Promise<any | null> => {
  try {
    // Check cookies first, then fallback to localStorage
    const userInfo = await AuthCookies.getAuthCookie('userInfo') || 
                    await AsyncStorage.getItem('userInfo');
    
    if (userInfo) {
      return JSON.parse(userInfo);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};

export default { logout, isUserAuthenticated, getUserInfo };
