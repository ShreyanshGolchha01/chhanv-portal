import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Heart, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

    // Check if user is already authenticated
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
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

    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userInfo', JSON.stringify({
        name: '',
        email: email,
        role: 'Admin'
      }));
      window.location.href = '/dashboard';
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - छांव योजना Details */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-16 h-16 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/3 right-10 w-12 h-12 border border-white rounded-full"></div>
          <div className="absolute bottom-1/3 left-20 w-8 h-8 border border-white rounded-full"></div>
        </div>

        {/* Main Title - Centered */}
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-6 animate-fade-in">छांव योजना</h1>
          <p className="text-xl text-white/90 max-w-lg leading-relaxed mx-auto">
            स्वास्थ्य शिविर प्रबंधन प्रणाली में आपका स्वागत है।<br />
            बेहतर स्वास्थ्य सेवा के लिए एक कदम आगे।
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
                  <Heart className="h-10 w-10 text-primary-500" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">छांव</h1>
                    <p className="text-xs text-gray-600">स्वास्थ्य शिविर प्रबंधन</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                एडमिन लॉगिन
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                प्रबंधन पैनल में प्रवेश के लिए अपनी जानकारी दर्ज करें
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    ईमेल पता / यूज़रनेम
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
                      <span className="text-gray-400 text-sm">👤</span>
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
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 text-gray-600">
                      मुझे याद रखें
                    </label>
                  </div>
                  <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">
                    पासवर्ड भूल गए?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 ${
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
                      <span className="mr-2">🔐</span>
                      लॉगिन करें
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Security Note */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                🔒 यह एक सुरक्षित सरकारी पोर्टल है
              </p>
            </div>

            {/* Doctor Portal Link */}
            <div className="text-center mt-4">
              <a 
                href="/doctor/login" 
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                👨‍⚕️ डॉक्टर पोर्टल में लॉगिन करें
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
