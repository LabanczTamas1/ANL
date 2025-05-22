import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "./Navbar";
import stars from "/public/LoginStars.svg";
import googleLogo from "/public/GoogleLogo.svg";
import FacebookLogo from "/public/FacebookLogo.svg";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';

interface LoginFormInputs {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Login response:', responseData);

        // Store all necessary data in localStorage
        localStorage.setItem("authToken", responseData.token);
        localStorage.setItem("userId", responseData.userId);
        localStorage.setItem("userName", responseData.user?.username || data.email.split('@')[0]);
        localStorage.setItem("userEmail", responseData.user?.email || data.email);
        
        // Handle name data
        const fullName = responseData.user?.name || '';
        const nameParts = fullName.split(' ');
        const firstName = responseData.user?.firstName || nameParts[0] || '';
        const lastName = responseData.user?.lastName || nameParts.slice(1).join(' ') || '';
        
        localStorage.setItem("fullName", fullName);
        localStorage.setItem("firstName", firstName);
        localStorage.setItem("lastName", lastName);
        
        // Special role handling
        if (responseData.user?.role === "admin") {
          localStorage.setItem("superRole", "admin");
        }

        // Log what was stored
        console.log('Stored in localStorage:', {
          authToken: responseData.token,
          userId: responseData.userId,
          userName: localStorage.getItem("userName"),
          userEmail: localStorage.getItem("userEmail"),
          fullName: localStorage.getItem("fullName"),
          firstName: localStorage.getItem("firstName"),
          lastName: localStorage.getItem("lastName")
        });

        alert(t('loginSuccessful'));
        navigate('/progress');
      } else {
        const errorData = await response.json();
        alert(`${t('loginFailed')} ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert(`An error occurred. Please try again later.\n${error}`);
    }
  };

  // Updated to use the correct Google OAuth endpoint
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  // You can keep this if you have Facebook auth set up
  const facebook = () => window.open(`${API_BASE_URL}/auth/facebook`, "_self");

  return (
    <>
      <div className="relative">
        <div className="absolute lg:h-screen h-[120vh] inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${stars})`, opacity: 1 }}></div>
      </div>
      <Navbar />
      <div className="relative h-[75vh] flex justify-center text-white">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-[4rem] font-bold mb-6 text-center">{t('loginTitle')}</h2>
          <button 
            type="button" 
            className="w-full flex justify-center mb-4 p-2 rounded border border-white" 
            onClick={handleGoogleLogin}
          >
            <img src={googleLogo} alt="Google Logo" className="h-6 mr-3" /> {t('continueWithGoogle')}
          </button>
          <button type="button" className="w-full flex justify-center p-2 rounded border border-white" onClick={facebook}>
            <img src={FacebookLogo} alt="Facebook Logo" className="h-6 mr-3" /> {t('continueWithFacebook')}
          </button>
          <div className="text-center my-5">{t('or')}</div>
          
          <div className="mb-4">
            <input
              id="email"
              type="text"
              placeholder={t('emailPlaceholder')}
              className={`w-full p-2 rounded border bg-[#080A0D] ${errors.email ? "border-red-500" : "border-gray-600"}`}
              {...register("email", {
                required: t('emailRequired'),
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: t('invalidEmail')
                }
              })}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          
          <div className="mb-4 relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t('passwordPlaceholder')}
              className={`w-full p-2 pr-10 rounded border bg-[#080A0D] text-white ${errors.password ? "border-red-500" : "border-gray-600"}`}
              {...register("password", {
                required: t('passwordRequired'),
                minLength: { value: 6, message: t('passwordTooShort') },
              })}
            />
            <button 
              type="button" 
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-200" 
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          
          <button type="submit" className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded">
            {t('loginButton')}
          </button>
        </form>
      </div>
    </>
  );
};

export default LoginPage;