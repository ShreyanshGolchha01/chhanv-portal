import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Stethoscope, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import serverUrl from './Server';// Adjust the import based on your project structure

const DoctorLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if doctor is already authenticated
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await AsyncStorage.getItem('isDoctorAuthenticated');
        if (authStatus === 'true') {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'ईमेल आवश्यक है';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'ईमेल सही नहीं है';
    }

    if (!password.trim()) {
      newErrors.password = 'पासवर्ड आवश्यक है';
    } else if (password.length < 6) {
      newErrors.password = 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setIsLoading(true);

  try {
    // Call your PHP API
    const response = await axios.post(`${serverUrl}/login_doctor.php`, {
      email: email,
      password: password
    });

    if (response.data && response.data.email) {
      // Store login data
      await AsyncStorage.setItem('isDoctorAuthenticated', 'true');
      await AsyncStorage.setItem('doctorInfo', JSON.stringify(response.data));

      // Navigate to dashboard
      window.location.href = '/doctor/dashboard';
    } else {
      alert('ईमेल या पासवर्ड गलत है');
    }

  } catch (error) {
    console.error('Login error:', error);
    alert('लॉगिन में त्रुटि हुई');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Doctor Portal Details */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-700 to-green-900 flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-16 h-16 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/3 right-10 w-12 h-12 border border-white rounded-full"></div>
          <div className="absolute bottom-1/3 left-20 w-8 h-8 border border-white rounded-full"></div>
        </div>

        {/* Main Title - Centered */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Stethoscope className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 animate-fade-in">डॉक्टर पोर्टल</h1>
          <p className="text-xl text-white/90 max-w-lg leading-relaxed mx-auto">
            छांव स्वास्थ्य शिविर प्रबंधन प्रणाली<br />
            मरीजों की देखभाल और स्वास्थ्य रिकॉर्ड प्रबंधन
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-screen bg-gray-50">
        <div className="flex-grow flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Logo and Header (mobile only) */}
            <div className="text-center lg:hidden mb-6">
              <div className="flex justify-center">
                <div className="flex items-center space-x-2">
                  <Stethoscope className="h-10 w-10 text-green-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">डॉक्टर पोर्टल</h1>
                    <p className="text-xs text-gray-600">छांव स्वास्थ्य शिविर</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                डॉक्टर लॉगिन
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                स्वास्थ्य शिविर प्रबंधन के लिए लॉगिन करें
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    ईमेल पता / डॉक्टर आईडी
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`input-field pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="अपना ईमेल दर्ज करें"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Stethoscope className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    पासवर्ड
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="अपना पासवर्ड लिखें"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-sm">🔒</span>
                    </div>
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 text-gray-600">
                      मुझे याद रखें
                    </label>
                  </div>
                  <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                    पासवर्ड भूल गए?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      लॉगिन हो रहा है...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Stethoscope className="mr-2 h-4 w-4" />
                      लॉगिन करें
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Security Note */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                🔒 यह एक सुरक्षित चिकित्सा पोर्टल है
              </p>
            </div>

            {/* Back to Admin */}
            <div className="text-center mt-4">
              <a 
                href="/" 
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← एडमिन पोर्टल पर वापस जाएं
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;
