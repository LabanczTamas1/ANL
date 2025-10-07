import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import SocialLoginButtons from "./components/SocialLoginButtons";
import FormInput from "./components/FormInput";
import CheckboxInput from "./components/CheckboxInput";
import SubmitButton from "./components/SubmitButton";
import StaticNavbar from "./StaticNavbar";
import InfiniteBackgroundWrapper from "./components/InfiniteBackgroundWrapper";

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
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormInputs>({ mode: "onBlur" });

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const onSubmit = async (data: RegisterFormInputs) => {
    setGlobalError(null);
    setInfoMessage(null);
    setLoading(true);
    try {
      const payload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        username: data.username.trim(),
      };

      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (res.status === 201) {
        localStorage.setItem("email", payload.email);
        setInfoMessage(
          "Registration successful — please check your inbox to verify your email."
        );
        setTimeout(() => navigate("/check-email"), 1000);
      } else {
        const body = await res.json().catch(() => ({}));
        const err =
          body?.error || body?.message || `Registration failed (status ${res.status})`;
        setGlobalError(err);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setGlobalError("Network or server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/oauth/google`;
  };
  const handleFacebookLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/oauth/facebook`;
  };

  return (
    <InfiniteBackgroundWrapper>
      <StaticNavbar />

      <div className="relative flex justify-center items-start px-4 py-10 text-white">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 rounded-lg shadow-lg w-full max-w-md bg-white/5 backdrop-blur"
        >
          <h2 className="text-4xl font-bold mb-6 text-center text-white">Register</h2>

          <SocialLoginButtons
            onGoogleLogin={handleGoogleLogin}
            onFacebookLogin={handleFacebookLogin}
          />

          <div className="text-center my-4 text-sm text-gray-300">or</div>

          {/* Name inputs */}
          <div className="flex lg:flex-row flex-col justify-center">
            <div className="mb-4 lg:pr-2 flex-1">
              <FormInput
                id="firstName"
                type="text"
                placeholder="First Name"
                register={register("firstName", {
                  required: "First name is required",
                  minLength: { value: 2, message: "Too short" },
                  pattern: { value: /^[\p{L}\p{M}'-]{2,}$/u, message: "Invalid name" },
                })}
                error={errors.firstName}
              />
            </div>

            <div className="mb-4 lg:pl-2 flex-1">
              <FormInput
                id="lastName"
                type="text"
                placeholder="Last Name"
                register={register("lastName", {
                  required: "Last name is required",
                  minLength: { value: 2, message: "Too short" },
                  pattern: { value: /^[\p{L}\p{M}'-]{2,}$/u, message: "Invalid name" },
                })}
                error={errors.lastName}
              />
            </div>
          </div>

          {/* Email input */}
          <div className="mb-4">
            <FormInput
              id="email"
              type="email"
              placeholder="Email"
              register={register("email", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
                maxLength: { value: 254, message: "Email too long" },
              })}
              error={errors.email}
            />
          </div>

          {/* Username input */}
          <div className="mb-4">
            <FormInput
              id="username"
              type="text"
              placeholder="Username / Company Name"
              register={register("username", {
                required: "Username is required",
                minLength: { value: 3, message: "At least 3 characters" },
                maxLength: { value: 50, message: "Too long" },
                pattern: { value: /^[a-zA-Z0-9._-]{3,50}$/, message: "Invalid username" },
              })}
              error={errors.username}
            />
          </div>

          {/* Password input */}
          <div className="mb-4">
            <FormInput
              id="password"
              type="password"
              placeholder="Password"
              register={register("password", {
                required: "Password is required",
                minLength: { value: 12, message: "At least 12 characters" },
                validate: (v) => {
                  const checks = [
                    /[A-Z]/.test(v) || "Add uppercase",
                    /[a-z]/.test(v) || "Add lowercase",
                    /[0-9]/.test(v) || "Add number",
                    /[^A-Za-z0-9]/.test(v) || "Add symbol",
                  ];
                  return checks.find((c) => typeof c === "string") || true;
                },
              })}
              error={errors.password}
              showPassword={showPassword}
              onTogglePassword={togglePassword}
            />
            <div className="text-xs text-gray-300 mt-1">
              Use at least 12 characters — mix upper/lowercase letters, numbers and symbols.
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <FormInput
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              register={register("confirmPassword", {
                required: "Please confirm your password",
                validate: (v) => v === watch("password") || "Passwords do not match",
              })}
              error={errors.confirmPassword}
              showPassword={showConfirmPassword}
              onTogglePassword={toggleConfirmPassword}
            />
          </div>

          {/* Terms */}
          <div className="mb-4">
            <CheckboxInput
              register={register("terms", { required: "You must accept the terms" })}
              error={errors.terms}
              label={
                <div>
                  Yes, I accept the{" "}
                  <a href="/terms" className="text-purple-400 underline" target="_blank" rel="noreferrer">Terms of Use</a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-purple-400 underline" target="_blank" rel="noreferrer">Privacy Policy</a>.
                </div>
              }
            />
          </div>

          {globalError && <p className="text-sm text-red-400 mb-3">{globalError}</p>}
          {infoMessage && <p className="text-sm text-green-300 mb-3">{infoMessage}</p>}

          <SubmitButton text={loading ? "Creating…" : "Register"} disabled={loading} />

          <div className="text-sm text-gray-300 mt-4">
            Already have an account?{" "}
            <button type="button" onClick={() => navigate("/login")} className="underline">Sign in</button>
            {" — "}
            <button type="button" onClick={() => navigate("/forgot-password")} className="underline">Forgot password?</button>
          </div>
        </form>
      </div>
    </InfiniteBackgroundWrapper>
  );
};

export default RegisterForm;
