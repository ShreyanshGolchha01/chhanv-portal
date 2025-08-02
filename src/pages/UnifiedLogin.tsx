import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Shield, Stethoscope, Eye, EyeOff, Users, Heart } from 'lucide-react';
import axios from 'axios';
import serverUrl from './Server';
import AsyncStorage from '../utils/AsyncStorage';
import { AuthCookies } from '../utils/CookieStorage';

type LoginType = 'admin' | 'doctor';

const UnifiedLogin: React.FC = () => {
  const [loginType, setLoginType] = useState<LoginType>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDoctorAuthenticated, setIsDoctorAuthenticated] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check cookies first, then fallback to localStorage
        const adminAuth = await AuthCookies.getAuthCookie('isAuthenticated') || 
                         await AsyncStorage.getItem('isAuthenticated');
        const doctorAuth = await AuthCookies.getAuthCookie('isDoctorAuthenticated') || 
                          await AsyncStorage.getItem('isDoctorAuthenticated');
        
        setIsAuthenticated(adminAuth === 'true');
        setIsDoctorAuthenticated(doctorAuth === 'true');

        // Load saved email if remember me was checked
        const savedEmail = await AuthCookies.getAuthCookie('savedEmail');
        const savedRememberMe = await AuthCookies.getAuthCookie('rememberMe');
        
        if (savedEmail && savedRememberMe === 'true') {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  if (isDoctorAuthenticated) {
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
    const endpoint =
    loginType === 'admin'
        ? `${serverUrl}login_admin.php`
        : `${serverUrl}login_doctor.php`;


    const response = await axios.post(endpoint, {
      email:email,
      password:password
    });
 
    const data = response.data;
    console.log('Login response:', data); // Debug log

    if (data.role == 'admin') {
      // Save to cookies with remember me preference
      await AuthCookies.setAuthCookie('isAuthenticated', 'true', rememberMe);
      await AuthCookies.setAuthCookie(
        'userInfo',
        JSON.stringify({
          name: data.name,
          email: data.email,
          role: 'Admin'
        }),
        rememberMe
      );

      // Save email and remember preference if remember me is checked
      if (rememberMe) {
        await AuthCookies.setAuthCookie('savedEmail', email, true);
        await AuthCookies.setAuthCookie('rememberMe', 'true', true);
      } else {
        await AuthCookies.removeAuthCookie('savedEmail');
        await AuthCookies.removeAuthCookie('rememberMe');
      }

      // Also save to localStorage for backward compatibility
      await AsyncStorage.setItem('isAuthenticated', 'true');
      await AsyncStorage.setItem(
        'userInfo',
        JSON.stringify({
          name: data.name,
          email: data.email,
          role: 'Admin'
        })
      );
      
      window.location.href = '/dashboard';
    } else if (data.role == 'doctor') { // Changed from 'doctor' to 'Doctor'

      // Save to cookies with remember me preference
      await AuthCookies.setAuthCookie('isDoctorAuthenticated', 'true', rememberMe);
      await AuthCookies.setAuthCookie(
        'userInfo',
        JSON.stringify({
          name: data.user?.name || data.name,
          email: data.user?.email || data.email,
          role: 'doctor',
          specialty: data.user?.specialty || data.specialty,
          phone: data.user?.phone || data.phone,
          id: data.user?.id || data.id
        }),
        rememberMe
      );

      // Save email and remember preference if remember me is checked
      if (rememberMe) {
        await AuthCookies.setAuthCookie('savedEmail', email, true);
        await AuthCookies.setAuthCookie('rememberMe', 'true', true);
      } else {
        await AuthCookies.removeAuthCookie('savedEmail');
        await AuthCookies.removeAuthCookie('rememberMe');
      }

      // Also save to localStorage for backward compatibility
      await AsyncStorage.setItem('isDoctorAuthenticated', 'true');
      await AsyncStorage.setItem(
        'userInfo',
        JSON.stringify({
          name: data.user?.name || data.name,
          email: data.user?.email || data.email,
          role: 'doctor',
          specialty: data.user?.specialty || data.specialty,
          phone: data.user?.phone || data.phone,
          id: data.user?.id || data.id
        })
      );
     
     window.location.href = '/doctor/dashboard';
    }
    else{
     
      alert('Login failed. कृपया सही जानकारी दें।');
    }
     
    
  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error response:', error.response?.data);
    
    if (error.response?.status === 401) {
      alert('गलत ईमेल या पासवर्ड। कृपया सही जानकारी दें।');
    } else if (error.response?.data?.error) {
      alert(`Login failed: ${error.response.data.error}`);
    } else {
      alert('Login failed. कृपया सही जानकारी दें।');
    }
  } finally {
    setIsLoading(false);
  }
};

  const getThemeColors = () => {
    if (loginType === 'admin') {
      return {
        gradient: 'from-blue-600 to-blue-800',
        primary: 'blue-600',
        hover: 'blue-700',
        focus: 'blue-500',
        text: 'blue-600',
        textHover: 'blue-500',
        icon: 'blue-500'
      };
    } else {
      return {
        gradient: 'from-green-700 to-green-900',
        primary: 'green-700',
        hover: 'green-800',
        focus: 'green-500',
        text: 'green-600',
        textHover: 'green-700',
        icon: 'green-600'
      };
    }
  };

  const theme = getThemeColors();

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Portal Details */}
      <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br ${theme.gradient} flex-col justify-center items-center p-12 relative overflow-hidden`}>
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
            {loginType === 'admin' ? (
              <Shield className="h-16 w-16 text-white" />
            ) : (
              <Stethoscope className="h-16 w-16 text-white" />
            )}
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 animate-fade-in">
            {loginType === 'admin' ? 'एडमिन पोर्टल' : 'डॉक्टर पोर्टल'}
          </h1>
          <p className="text-xl text-white/90 max-w-lg leading-relaxed mx-auto">
            छांव स्वास्थ्य शिविर प्रबंधन प्रणाली<br />
            {loginType === 'admin' 
              ? 'स्वास्थ्य शिविरों का संपूर्ण प्रबंधन' 
              : 'मरीजों की देखभाल और स्वास्थ्य रिकॉर्ड प्रबंधन'
            }
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
                  {loginType === 'admin' ? (
                    <Shield className={`h-10 w-10 text-${theme.icon}`} />
                  ) : (
                    <Stethoscope className={`h-10 w-10 text-${theme.icon}`} />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {loginType === 'admin' ? 'एडमिन पोर्टल' : 'डॉक्टर पोर्टल'}
                    </h1>
                    <p className="text-xs text-gray-600">छांव स्वास्थ्य शिविर</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Type Selection */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setLoginType('admin')}
                  className={`flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                    loginType === 'admin'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  एडमिन लॉगिन
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType('doctor')}
                  className={`flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                    loginType === 'doctor'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  डॉक्टर लॉगिन
                </button>
              </div>
            </div>

            {/* Login Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {loginType === 'admin' ? 'एडमिन लॉगिन' : 'डॉक्टर लॉगिन'}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {loginType === 'admin' 
                  ? 'शिविर प्रबंधन के लिए लॉगिन करें'
                  : 'स्वास्थ्य शिविर प्रबंधन के लिए लॉगिन करें'
                }
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {loginType === 'admin' ? 'ईमेल पता / यूजर आईडी' : 'ईमेल पता / डॉक्टर आईडी'}
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
                      {loginType === 'admin' ? (
                        <Shield className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Stethoscope className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  {errors.email && (
                    <p className="m t-1 text-sm text-red-600">{errors.email}</p>
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
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className={`h-4 w-4 text-${theme.text} focus:ring-${theme.focus} border-gray-300 rounded`}
                    />
                    <label htmlFor="remember-me" className="ml-2 text-gray-600">
                      मुझे याद रखें (30 दिन)
                    </label>
                  </div>
                  <a href="#" className={`text-${theme.text} hover:text-${theme.textHover} font-medium`}>
                    पासवर्ड भूल गए?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-${theme.primary} hover:bg-${theme.hover} text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 ${
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
                      {loginType === 'admin' ? (
                        <Shield className="mr-2 h-4 w-4" />
                      ) : (
                        <Stethoscope className="mr-2 h-4 w-4" />
                      )}
                      लॉगिन करें
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Security Note */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                🔒 यह एक सुरक्षित {loginType === 'admin' ? 'प्रशासनिक' : 'चिकित्सा'} पोर्टल है
              </p>
            </div>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-xs text-gray-500">
                Powered by <span className="font-semibold">SSIPMT, Raipur</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;
