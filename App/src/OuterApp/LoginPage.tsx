import React from "react";
import { useForm } from "react-hook-form";
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

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      // Send a POST request to the backend login endpoint using fetch
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Check if the login request was successful
      if (response.ok) {
        const responseData = await response.json();
        alert('Login Successful!');
        console.log('User:', responseData);

        localStorage.setItem("authToken", responseData.token);
        localStorage.setItem("name", responseData.user.username);
        localStorage.setItem("userId", responseData.user.userId);

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

  const google = () => {
    window.open("http://localhost:3000/auth/google", "_self");
  };

  const facebook = () => {
    window.open("http://localhost:3000/auth/facebook", "_self");
  };

  return (
    <>
      <div className="relative">
        {/* Background SVG */}
        <div
          className="absolute lg:h-screen h-[120vh] h-sm:h-[200vh] inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${stars})`, opacity: 1 }}
        ></div>
      </div>
      <Navbar />
      <div className="relative h-[100vh] flex justify-center text-white">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 rounded-lg shadow-lg w-full max-w-md"
        >
          <h2 className="text-[4rem] font-bold mb-6 text-center">Login</h2>

          <button
            type="button"
            className="w-full flex justify-center mb-4 p-2 rounded border border-white"
            onClick={google}
          >
            <img src={googleLogo} alt="Google Logo" className="h-6 mr-3" />
            Continue with Google
          </button>
          <button
            type="button"
            className="w-full flex justify-center p-2 rounded border border-white"
            onClick={facebook}
          >
            <img src={FacebookLogo} alt="Facebook Logo" className="h-6 mr-3" />
            Continue with Facebook
          </button>
          <div className="text-center my-5">or</div>

          {/* Identifier (Email/Username) */}
          <div className="mb-4">
            <input
              id="identifier"
              type="text"
              placeholder="Email or Username"
              className={`w-full p-2 rounded border bg-[#080A0D] ${
                errors.identifier ? "border-red-500" : "[#080A0D]"
              }`}
              {...register("identifier", {
                required: "Email or Username is required",
                validate: (value) =>
                  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(
                    value
                  ) ||
                  /^[a-zA-Z0-9._-]{3,}$/.test(value) ||
                  "Enter a valid email or username",
              })}
            />
            {errors.identifier && (
              <p className="text-red-500 text-sm mt-1">
                {errors.identifier.message}
              </p>
            )}
          </div>

          {/* Password */}
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

          <button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
          >
            Login
          </button>
        </form>
      </div>
    </>
  );
};

export default LoginPage;
