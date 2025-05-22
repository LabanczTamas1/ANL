import React, { useState, useEffect } from "react";
import { Eye, EyeOff, User, Mail, Key, Save, AlertCircle } from "lucide-react";
import axios from "axios"; // Make sure to install axios if not already installed
import { useLanguage } from '../hooks/useLanguage';

const Account = () => {
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [isOAuth, setIsOAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { t } = useLanguage();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const userData = response.data.user;
        
        setFormData({
          ...formData,
          firstname: userData.firstName || "",
          lastname: userData.lastName || "",
          email: userData.email || "",
          username: userData.username || ""
        });
        
        // Set OAuth status
        setIsOAuth(userData.provider === "google");
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error(t('notAuthenticated'));
      
      const response = await axios.put(`${API_BASE_URL}/api/user/profile`, {
        firstName: formData.firstname,
        lastName: formData.lastname,
        email: formData.email,
        username: formData.username
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update token if a new one is returned
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
      }
      
      setSuccess(t('successMessage'));
    } catch (err) {
      setError(err.response?.data?.error || t('failedUpdate'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validate password match
    if (formData.newPassword !== formData.confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error(t('notAuthenticated'));
      
      const response = await axios.put(`${API_BASE_URL}/api/user/profile`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(t('passwordUpdated'));
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      setError(err.response?.data?.error || t('failedPassword'));
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
      {/* Header Section */}
      <div className="flex items-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div className="flex items-center justify-center bg-[#65558F] text-white rounded-full w-16 h-16 text-2xl font-bold mr-4">
          {formData.firstname && formData.lastname 
            ? `${formData.firstname[0]}${formData.lastname[0]}` 
            : "??"
          }
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            {formData.firstname} {formData.lastname}
          </h1>
          <p className="text-gray-500 dark:text-gray-300">{t('manageAccount')}</p>
        </div>
      </div>
      
      {/* Success and Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-md">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Account Details Section */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{t('accountDetails')}</h2>
          <form onSubmit={handleAccountSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200">
                  <User size={18} className="text-[#65558F]" />
                  {t('firstName')}
                </label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-[#65558F] focus:border-transparent"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200">
                  <User size={18} className="text-[#65558F]" />
                  {t('lastName')}
                </label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-[#65558F] focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200">
                  <Mail size={18} className="text-[#65558F]" />
                  {t('email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-[#65558F] focus:border-transparent"
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200">
                  <User size={18} className="text-[#65558F]" />
                  {t('username')}
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-[#65558F] focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-[#65558F] text-white rounded-md hover:bg-opacity-90 transition-all duration-200 font-medium disabled:bg-opacity-70"
            >
              <Save size={18} />
              {loading ? t('saving') : t('saveChanges')}
            </button>
          </form>
        </div>

        {/* Password Section */}
        <div className="lg:w-1/3 bg-white dark:bg-gray-700 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-600">
          <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
            <Key size={20} className="text-[#65558F]" />
            {t('changePassword')}
          </h2>
          
          {isOAuth ? (
            <div className="flex items-start p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md mb-4">
              <AlertCircle size={20} className="text-blue-500 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                {t('oauthMessage')}
              </p>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="font-medium text-gray-700 dark:text-gray-200">{t('currentPassword')}</label>
                <div className="relative">
                  <input
                    type={passwordVisibility.currentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder={t('enterCurrentPassword')}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md pr-10 focus:ring-2 focus:ring-[#65558F] focus:border-transparent"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300 hover:text-[#65558F] dark:hover:text-[#65558F]"
                    onClick={() => togglePasswordVisibility('currentPassword')}
                  >
                    {passwordVisibility.currentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="font-medium text-gray-700 dark:text-gray-200">{t('newPassword')}</label>
                <div className="relative">
                  <input
                    type={passwordVisibility.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder={t('enterNewPassword')}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md pr-10 focus:ring-2 focus:ring-[#65558F] focus:border-transparent"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300 hover:text-[#65558F] dark:hover:text-[#65558F]"
                    onClick={() => togglePasswordVisibility('newPassword')}
                  >
                    {passwordVisibility.newPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="font-medium text-gray-700 dark:text-gray-200">{t('confirmNewPassword')}</label>
                <div className="relative">
                  <input
                    type={passwordVisibility.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder={t('confirmPassword')}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md pr-10 focus:ring-2 focus:ring-[#65558F] focus:border-transparent"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300 hover:text-[#65558F] dark:hover:text-[#65558F]"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                  >
                    {passwordVisibility.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-[#65558F] text-white rounded-md hover:bg-opacity-90 transition-all duration-200 font-medium disabled:bg-opacity-70"
              >
                {loading ? t('updating') : t('updatePassword')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;