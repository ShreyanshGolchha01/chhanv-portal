// AsyncStorage wrapper for web apps (using localStorage)
// This provides AsyncStorage-like API for consistency with React Native

interface AsyncStorageInterface {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

const AsyncStorage: AsyncStorageInterface = {
  setItem: async (key: string, value: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(key, value);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  getItem: async (key: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      try {
        const value = localStorage.getItem(key);
        resolve(value);
      } catch (error) {
        reject(error);
      }
    });
  },

  removeItem: async (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        localStorage.removeItem(key);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  clear: async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        localStorage.clear();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
};

export default AsyncStorage;
