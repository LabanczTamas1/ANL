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

        const response = await axios.get(`${API_BASE_URL}/api/v1/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // getProfile returns the user object directly (no wrapper)
        const userData = response.data;
        
        setFormData(prev => ({
          ...prev,
          firstname: userData.firstName || "",
          lastname: userData.lastName || "",
          email: userData.email || "",
          username: userData.username || ""
        }));

        // OAuth users have no hashedPassword — check role field presence as proxy
        // If provider info is stored in Redis it will appear here
        setIsOAuth(!!(userData.provider && userData.provider !== "local"));
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(t('failedUpdate'));
      }
    };

    fetchUserData();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

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

      // modifyUserData supports firstName, lastName, email, username in one call
      await axios.patch(`${API_BASE_URL}/api/v1/user/modifyUserData`, {
        firstName: formData.firstname,
        lastName: formData.lastname,
        email: formData.email,
        username: formData.username
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(t('successMessage'));
    } catch (err: any) {
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
      
      await axios.patch(`${API_BASE_URL}/api/v1/user/change-password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(t('passwordUpdated'));
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    } catch (err: any) {
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
    <div className="max-w-5xl mx-auto bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-10 transition-colors duration-300">
      {/* Header Section */}
      <div className="flex items-center mb-10 border-b border-gray-200 dark:border-gray-700 pb-8">
        <div className="flex items-center justify-center bg-[#65558F] text-white rounded-full w-20 h-20 text-3xl font-bold mr-5">
          {formData.firstname && formData.lastname 
            ? `${formData.firstname[0]}${formData.lastname[0]}` 
            : "??"
          }
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            {formData.firstname} {formData.lastname}
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-300">{t('manageAccount')}</p>
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

      <div className="flex flex-col gap-8">
        {/* Account Details Section */}
        <div>
          <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">{t('accountDetails')}</h2>
          <form onSubmit={handleAccountSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* First Name */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-200">
                  <User size={20} className="text-[#65558F]" />
                  {t('firstName')}
                </label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  className="w-full p-4 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-[#65558F] focus:border-transparent"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-200">
                  <User size={20} className="text-[#65558F]" />
                  {t('lastName')}
                </label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  className="w-full p-4 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-[#65558F] focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-200">
                  <Mail size={20} className="text-[#65558F]" />
                  {t('email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-4 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-[#65558F] focus:border-transparent"
                />
              </div>

              {/* Username */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-200">
                  <User size={20} className="text-[#65558F]" />
                  {t('username')}
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full p-4 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-[#65558F] focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 text-base bg-[#65558F] text-white rounded-md hover:bg-opacity-90 transition-all duration-200 font-medium disabled:bg-opacity-70"
            >
              <Save size={18} />
              {loading ? t('saving') : t('saveChanges')}
            </button>
          </form>
        </div>

        {/* Password Section */}
        <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow border border-gray-100 dark:border-gray-600">
          <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white flex items-center gap-2">
            <Key size={22} className="text-[#65558F]" />
            {t('changePassword')}
          </h2>
          
          {isOAuth ? (
            <div className="flex items-start p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md mb-4">
              <AlertCircle size={20} className="text-blue-500 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-blue-700 dark:text-blue-300 text-base">
                {t('oauthMessage')}
              </p>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-base font-medium text-gray-700 dark:text-gray-200">{t('currentPassword')}</label>
                <div className="relative">
                  <input
                    type={passwordVisibility.currentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder={t('enterCurrentPassword')}
                    className="w-full p-4 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md pr-12 focus:ring-2 focus:ring-[#65558F] focus:border-transparent"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300 hover:text-[#65558F] dark:hover:text-[#65558F]"
                    onClick={() => togglePasswordVisibility('currentPassword')}
                  >
                    {passwordVisibility.currentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-base font-medium text-gray-700 dark:text-gray-200">{t('newPassword')}</label>
                <div className="relative">
                  <input
                    type={passwordVisibility.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder={t('enterNewPassword')}
                    className="w-full p-4 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md pr-12 focus:ring-2 focus:ring-[#65558F] focus:border-transparent"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300 hover:text-[#65558F] dark:hover:text-[#65558F]"
                    onClick={() => togglePasswordVisibility('newPassword')}
                  >
                    {passwordVisibility.newPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-base font-medium text-gray-700 dark:text-gray-200">{t('confirmNewPassword')}</label>
                <div className="relative">
                  <input
                    type={passwordVisibility.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder={t('confirmPassword')}
                    className="w-full p-4 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md pr-12 focus:ring-2 focus:ring-[#65558F] focus:border-transparent"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300 hover:text-[#65558F] dark:hover:text-[#65558F]"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                  >
                    {passwordVisibility.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-3.5 text-base bg-[#65558F] text-white rounded-md hover:bg-opacity-90 transition-all duration-200 font-medium disabled:bg-opacity-70"
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