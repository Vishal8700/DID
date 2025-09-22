import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import './AppRegistration.css';

function AppRegistration() {
  const navigate = useNavigate();
  const { addAppCreatedNotification } = useNotifications();
  const [formData, setFormData] = useState({
    appName: '',
    developerName: '',
    organizationName: '',
    profession: '',
    email: '',
    description: '',
    category: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const professions = [
    'Student', 'Developer', 'Entrepreneur', 'Researcher', 
    'Designer', 'Product Manager', 'CTO', 'Founder', 'Other'
  ];

  const categories = [
    'Blockchain', 'Crypto', 'Gaming', 'Social Media', 
    'Identity Management', 'Supply Chain', 'Healthcare', 'Education', 'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.appName.trim()) newErrors.appName = 'App name is required';
    if (!formData.developerName.trim()) newErrors.developerName = 'Developer name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.profession) newErrors.profession = 'Profession is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('Testnet_auth_token');
      const response = await fetch('http://localhost:5000/api/register-app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        // Store app ID for setup page
        localStorage.setItem('registered_app_id', result.appId);
        // Add app creation notification
        addAppCreatedNotification(formData.appName, result.appId);
        navigate('/app-setup');
      } else {
        setErrors({ submit: result.error || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce animation-delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse animation-delay-3000"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white rounded-full opacity-20 animate-ping animation-delay-500"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-violet-300 rounded-full opacity-30 animate-ping animation-delay-1500"></div>
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-purple-300 rounded-full opacity-40 animate-ping animation-delay-2500"></div>
      </div>

      <div className="relative w-full max-w-7xl flex gap-8 items-start">
        {/* Left Side - Form */}
        <div className="flex-1 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            
            <h1 className="text-4xl font-bold text-white mb-2">Register Your DApp</h1>
            <p className="text-xl text-slate-300">Create your decentralized application with SIWE authentication</p>
          </div>

          {/* Registration Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Row 1: App Name and Developer Name */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label htmlFor="appName" className="block text-sm font-medium text-white mb-2">
                  Application Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="appName"
                    name="appName"
                    value={formData.appName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="My Awesome dApp"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                {errors.appName && <p className="mt-1 text-sm text-red-400">{errors.appName}</p>}
              </div>

              <div>
                <label htmlFor="developerName" className="block text-sm font-medium text-white mb-2">
                  Developer Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="developerName"
                    name="developerName"
                    value={formData.developerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                {errors.developerName && <p className="mt-1 text-sm text-red-400">{errors.developerName}</p>}
              </div>
            </div>

            {/* Row 2: Email and Organization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-white mb-2">
                  Organization / College Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="organizationName"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="MIT, Google, Startup Inc."
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Profession and Category */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-white mb-2">
                  Profession *
                </label>
                <select
                  id="profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="" className="bg-slate-800">Select profession</option>
                  {professions.map(prof => (
                    <option key={prof} value={prof} className="bg-slate-800">{prof}</option>
                  ))}
                </select>
                {errors.profession && <p className="mt-1 text-sm text-red-400">{errors.profession}</p>}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
                  App Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="" className="bg-slate-800">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 4: Description (Full Width) */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                App Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                placeholder="Brief description of your application and its key features..."
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-300 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button Section */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="px-12 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering Application...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Register Application
                  </div>
                )}
              </button>
            </div>
          </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-slate-400">
              Already have an app? 
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-violet-400 hover:text-violet-300 ml-1 underline"
              >
                Go to Dashboard
              </button>
            </p>
          </div>
        </div>

        {/* Right Side*/}
        <div className="hidden lg:flex flex-1 max-w-md items-center justify-center mt-26">
        <div className="relative w-full h-165 rounded-3xl overflow-hidden shadow-2xl">
          
          <img
            src="./123456.jpg"
            alt="Blockchain Development"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/40"></div>

          <div className="relative z-10 flex flex-col items-center justify-end h-full text-center p-6 pb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Build the Future</h3>
            <p className="text-slate-300 text-sm">
              Create decentralized applications with cutting-edge blockchain technology
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default AppRegistration;
