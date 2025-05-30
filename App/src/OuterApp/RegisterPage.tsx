import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import stars from '/public/LandingPage.svg';
import googleLogo from '/public/GoogleLogo.svg';
import FacebookLogo from '/public/FacebookLogo.svg';

interface RegisterFormInputs {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormInputs>();

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      // Format the data to match backend expectations
      const payload = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
        username: data.username
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        const responseData = await response.json();
        
        // Store ALL necessary data in localStorage
        localStorage.setItem('authToken', responseData.token);
        localStorage.setItem('userId', responseData.userId);
        localStorage.setItem('userName', data.username);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('fullName', `${data.firstName} ${data.lastName}`);
        localStorage.setItem('firstName', data.firstName);
        localStorage.setItem('lastName', data.lastName);
        
        // Log to verify storage is working
        console.log('Saved to localStorage:', {
          authToken: responseData.token,
          userId: responseData.userId,
          userName: data.username,
          userEmail: data.email,
          fullName: `${data.firstName} ${data.lastName}`
        });
        
        alert('Registration Successful!');
        navigate('/progress');
      } else {
        const errorData = await response.json();
        alert(`Registration failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('An error occurred. Please try again later.');
    }
  };
  
  // Handle Google OAuth login
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <>
    <div className="relative">
    {/* Background SVG */}
    <div
      className="absolute lg:h-screen h-[120vh] inset-0 bg-no-repeat bg-cover bg-center z-0"
      style={{ backgroundImage: `url(${stars})`, opacity: 1 }}
    ></div>
    </div>
    <Navbar />
    <div className="relative h-screen flex justify-center text-white">
    
      <form
        onSubmit={handleSubmit(onSubmit)}
        className=" p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-[4rem] font-bold mb-6 text-center">Register</h2>

        <button 
          type="button"
          onClick={handleGoogleLogin}
          className='w-full flex justify-center mb-4 p-2 rounded border border-white'
        >
          <img src={googleLogo} alt="Google Logo" className="h-6 mr-3" />Continue with Google
        </button>
        <button type="button" className='w-full flex justify-center p-2 rounded border border-white'>
          <img src={FacebookLogo} alt="Facebook Logo" className="h-6 mr-3" />Continue with Facebook
        </button>
        <div className='text-center my-5'>or</div>
        {/* Rest of the form remains unchanged */}
        <div className='flex lg:flex-row flex-col justify-center'>
        <div className="mb-4 lg:pr-2">
          <input
            id="firstName"
            type="text"
            placeholder="First Name"
            className={`w-full p-2 rounded border bg-[#080A0D] ${
              errors.firstName ? "border-red-500" : "[#080A0D]"
            }`}
            {...register("firstName", {
              required: "First name is required",
              pattern: {
                value: /^[a-zA-Z\u00C0-\u017F]+$/,
                message: "Only letters are allowed",
              },
            })}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="mb-4 lg:pl-2">
          <input
            id="lastName"
            type="text"
            placeholder="Last Name"
            className={`w-full p-2 rounded border bg-[#080A0D] ${
              errors.lastName ? "border-red-500" : "[#080A0D]"
            }`}
            {...register("lastName", {
              required: "Last name is required",
              pattern: {
                value: /^[a-zA-Z]+$/,
                message: "Only letters are allowed",
              },
            })}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>
        </div>

        <div className="mb-4">
          <input
            id="email"
            type="email"
            placeholder="Email"
            className={`w-full p-2 rounded border bg-[#080A0D] ${
              errors.email ? "border-red-500" : "[#080A0D]"
            }`}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <input
            id="username"
            type="text"
            placeholder="Username / Company Name"
            className={`w-full p-2 rounded border bg-[#080A0D] ${
              errors.username ? "border-red-500" : "[#080A0D]"
            }`}
            {...register("username", {
              required: "Username is required",
            })}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <input
            id="password"
            type="password"
            placeholder="Password"
            className={`w-full p-2 rounded border bg-[#080A0D] ${
              errors.password ? "border-red-500" : "[#080A0D]"
            }`}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            className={`w-full p-2 rounded border bg-[#080A0D] ${
              errors.confirmPassword ? "border-red-500" : "[#080A0D]"
            }`}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              {...register("terms", {
                required: "You must accept the terms and conditions",
              })}
            />
            <div>     
            Yes, I accept the <a href="#" className="text-purple-500 underline">Terms of Use</a> and <a href="#" className="text-purple-500 underline">conditions</a>.
            </div>
          </label>
          {errors.terms && (
            <p className="text-red-500 text-sm mt-1">{errors.terms.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
        >
          Register
        </button>
      </form>
    </div>
    </>
  );
};

export default RegisterForm;