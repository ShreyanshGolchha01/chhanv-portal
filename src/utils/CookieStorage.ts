// Cookie Storage utility for persistent login
// This provides secure cookie-based authentication storage

interface CookieOptions {
  expires?: Date;
  maxAge?: number; // in seconds
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

interface CookieStorageInterface {
  setItem: (key: string, value: string, options?: CookieOptions) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string, path?: string) => Promise<void>;
  clear: () => Promise<void>;
}

const CookieStorage: CookieStorageInterface = {
  setItem: async (key: string, value: string, options: CookieOptions = {}): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        let cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        
        // Default options for secure cookies
        const defaultOptions: CookieOptions = {
          path: '/',
          maxAge: 30 * 24 * 60 * 60, // 30 days default
          sameSite: 'lax',
          secure: window.location.protocol === 'https:'
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        if (finalOptions.expires) {
          cookieString += `; expires=${finalOptions.expires.toUTCString()}`;
        }
        
        if (finalOptions.maxAge) {
          cookieString += `; max-age=${finalOptions.maxAge}`;
        }
        
        if (finalOptions.path) {
          cookieString += `; path=${finalOptions.path}`;
        }
        
        if (finalOptions.domain) {
          cookieString += `; domain=${finalOptions.domain}`;
        }
        
        if (finalOptions.secure) {
          cookieString += `; secure`;
        }
        
        if (finalOptions.sameSite) {
          cookieString += `; samesite=${finalOptions.sameSite}`;
        }
        
        document.cookie = cookieString;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  getItem: async (key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      try {
        const encodedKey = encodeURIComponent(key);
        const cookies = document.cookie.split(';');
        
        for (let cookie of cookies) {
          const [cookieKey, cookieValue] = cookie.trim().split('=');
          if (cookieKey === encodedKey && cookieValue) {
            resolve(decodeURIComponent(cookieValue));
            return;
          }
        }
        
        resolve(null);
      } catch (error) {
        console.error('Error reading cookie:', error);
        resolve(null);
      }
    });
  },

  removeItem: async (key: string, path: string = '/'): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const encodedKey = encodeURIComponent(key);
        document.cookie = `${encodedKey}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  clear: async (): Promise<void> => {
    return new Promise((resolve) => {
      try {
        const cookies = document.cookie.split(';');
        
        for (let cookie of cookies) {
          const [cookieKey] = cookie.trim().split('=');
          if (cookieKey) {
            document.cookie = `${cookieKey}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          }
        }
        
        resolve();
      } catch (error) {
        console.error('Error clearing cookies:', error);
        resolve();
      }
    });
  }
};

// Utility functions for auth-specific cookies
export const AuthCookies = {
  // Set authentication cookie with extended expiry
  setAuthCookie: async (key: string, value: string, rememberMe: boolean = false) => {
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day
    await CookieStorage.setItem(key, value, {
      maxAge,
      secure: true,
      sameSite: 'lax',
      path: '/'
    });
  },

  // Get authentication cookie
  getAuthCookie: async (key: string): Promise<string | null> => {
    return await CookieStorage.getItem(key);
  },

  // Remove authentication cookie
  removeAuthCookie: async (key: string) => {
    await CookieStorage.removeItem(key);
  },

  // Clear all auth cookies
  clearAllAuthCookies: async () => {
    await CookieStorage.removeItem('isAuthenticated');
    await CookieStorage.removeItem('isDoctorAuthenticated');
    await CookieStorage.removeItem('userInfo');
    await CookieStorage.removeItem('rememberMe');
  }
};

export default CookieStorage;
