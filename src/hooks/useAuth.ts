// Custom hook for authentication management
import { useState, useEffect } from 'react';
import { AuthCookies } from '../utils/CookieStorage';
import AsyncStorage from '../utils/AsyncStorage';

interface AuthState {
  isAdmin: boolean;
  isDoctor: boolean;
  userInfo: any | null;
  isLoading: boolean;
  isInitialized: boolean;
}

interface UseAuthReturn extends AuthState {
  login: (userData: any, role: 'admin' | 'doctor', rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    isAdmin: false,
    isDoctor: false,
    userInfo: null,
    isLoading: true,
    isInitialized: false
  });

  const refreshAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Check cookies first, then fallback to localStorage
      const adminAuth = await AuthCookies.getAuthCookie('isAuthenticated') || 
                       await AsyncStorage.getItem('isAuthenticated');
      const doctorAuth = await AuthCookies.getAuthCookie('isDoctorAuthenticated') || 
                        await AsyncStorage.getItem('isDoctorAuthenticated');
      const userInfo = await AuthCookies.getAuthCookie('userInfo') || 
                      await AsyncStorage.getItem('userInfo');

      setAuthState({
        isAdmin: adminAuth === 'true',
        isDoctor: doctorAuth === 'true',
        userInfo: userInfo ? JSON.parse(userInfo) : null,
        isLoading: false,
        isInitialized: true
      });
    } catch (error) {
      console.error('Error refreshing auth:', error);
      setAuthState({
        isAdmin: false,
        isDoctor: false,
        userInfo: null,
        isLoading: false,
        isInitialized: true
      });
    }
  };

  const login = async (userData: any, role: 'admin' | 'doctor', rememberMe = false) => {
    try {
      const authKey = role === 'admin' ? 'isAuthenticated' : 'isDoctorAuthenticated';
      
      // Save to cookies
      await AuthCookies.setAuthCookie(authKey, 'true', rememberMe);
      await AuthCookies.setAuthCookie('userInfo', JSON.stringify(userData), rememberMe);

      // Save to localStorage for backward compatibility
      await AsyncStorage.setItem(authKey, 'true');
      await AsyncStorage.setItem('userInfo', JSON.stringify(userData));

      // Update state
      setAuthState({
        isAdmin: role === 'admin',
        isDoctor: role === 'doctor',
        userInfo: userData,
        isLoading: false,
        isInitialized: true
      });

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear cookies
      await AuthCookies.clearAllAuthCookies();
      
      // Clear localStorage
      await AsyncStorage.removeItem('isAuthenticated');
      await AsyncStorage.removeItem('isDoctorAuthenticated');
      await AsyncStorage.removeItem('userInfo');

      // Update state
      setAuthState({
        isAdmin: false,
        isDoctor: false,
        userInfo: null,
        isLoading: false,
        isInitialized: true
      });

    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return {
    ...authState,
    login,
    logout,
    refreshAuth
  };
};

// Helper hooks for specific checks
export const useIsAuthenticated = () => {
  const { isAdmin, isDoctor, isLoading } = useAuth();
  return {
    isAuthenticated: isAdmin || isDoctor,
    isAdmin,
    isDoctor,
    isLoading
  };
};

export const useUserInfo = () => {
  const { userInfo, isLoading } = useAuth();
  return { userInfo, isLoading };
};

export default useAuth;
