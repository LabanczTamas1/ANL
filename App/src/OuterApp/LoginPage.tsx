import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "./Navbar";
import stars from "/public/LoginStars.svg";
import googleLogo from "/public/GoogleLogo.svg";
import FacebookLogo from "/public/FacebookLogo.svg";
import { useNavigate } from 'react-router-dom';

interface LoginFormInputs {
  identifier: string; // This will be used for email or username
  password: string;
}

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        alert('Login Successful!');
        console.log('User:', responseData);

        localStorage.setItem("authToken", responseData.token);
        localStorage.setItem("name", responseData.user.username);
        localStorage.setItem("userId", responseData.user.userId);
        localStorage.setItem("firstName", responseData.user.firstName);
        localStorage.setItem("lastName", responseData.user.lastName);

        navigate('/progress');
      } else {
        const errorData = await response.json();
        alert(`Login failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  const google = () => window.open("http://localhost:3000/auth/google", "_self");
  const facebook = () => window.open("http://localhost:3000/auth/facebook", "_self");

  return (
    <>
      <div className="relative">
        <div className="absolute lg:h-screen h-[120vh] inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${stars})`, opacity: 1 }}></div>
      </div>
      <Navbar />
      <div className="relative h-[75vh] flex justify-center text-white">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-[4rem] font-bold mb-6 text-center">Login</h2>
          <button type="button" className="w-full flex justify-center mb-4 p-2 rounded border border-white" onClick={google}>
            <img src={googleLogo} alt="Google Logo" className="h-6 mr-3" /> Continue with Google
          </button>
          <button type="button" className="w-full flex justify-center p-2 rounded border border-white" onClick={facebook}>
            <img src={FacebookLogo} alt="Facebook Logo" className="h-6 mr-3" /> Continue with Facebook
          </button>
          <div className="text-center my-5">or</div>
          
          <div className="mb-4">
            <input
              id="identifier"
              type="text"
              placeholder="Email or Username"
              className={`w-full p-2 rounded border bg-[#080A0D] ${errors.identifier ? "border-red-500" : "border-gray-600"}`}
              {...register("identifier", {
                required: "Email or Username is required",
                validate: (value) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(value) || /^[a-zA-Z0-9._-]{3,}$/.test(value) || "Enter a valid email or username",
              })}
            />
            {errors.identifier && <p className="text-red-500 text-sm mt-1">{errors.identifier.message}</p>}
          </div>
          
          <div className="mb-4 relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={`w-full p-2 pr-10 rounded border bg-[#080A0D] text-white ${errors.password ? "border-red-500" : "border-gray-600"}`}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" },
              })}
            />
            <button type="button" className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-200" onClick={() => setShowPassword(prev => !prev)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          
          <button type="submit" className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded">
            Login
          </button>
        </form>
      </div>
    </>
  );
};

export default LoginPage;
