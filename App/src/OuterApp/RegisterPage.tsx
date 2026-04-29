import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import SocialLoginButtons from "./components/SocialLoginButtons";
import FormInput from "./components/FormInput";
import CheckboxInput from "./components/CheckboxInput";
import SubmitButton from "./components/SubmitButton";
import Navbar from "./Navbar";

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

      const res = await fetch(`${API_BASE_URL}/api/v1/user/auth/register`, {
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
    <div className="relative min-h-screen bg-surface-overlay overflow-hidden">
      {/* ── Ambient background (matches homepage CTA section) ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse at 20% 50%, rgba(101,85,143,0.4) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 50%, rgba(122,164,159,0.4) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 100%, rgba(101,85,143,0.3) 0%, transparent 50%)
              `,
            }}
          />
        </div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand/20 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-teal/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Content ── */}
      <div className="relative z-10 flex justify-center items-center min-h-[calc(100vh-5rem)] px-4 pt-20 pb-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md p-8 rounded-2xl border border-line-glass shadow-2xl"
          style={{
            background: "rgba(20, 20, 30, 0.7)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-center text-white">Register</h2>

          <SocialLoginButtons
            onGoogleLogin={handleGoogleLogin}
            onFacebookLogin={handleFacebookLogin}
          />

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-line-glass" />
            <span className="text-sm text-content-muted">or</span>
            <div className="flex-1 h-px bg-line-glass" />
          </div>

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
            <div className="text-xs text-content-muted mt-1">
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
                  <a href="/terms" className="text-brand-hover underline hover:text-white transition" target="_blank" rel="noreferrer">Terms of Use</a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-brand-hover underline hover:text-white transition" target="_blank" rel="noreferrer">Privacy Policy</a>.
                </div>
              }
            />
          </div>

          {globalError && <p className="text-sm text-status-error mb-3">{globalError}</p>}
          {infoMessage && <p className="text-sm text-green-400 mb-3">{infoMessage}</p>}

          <SubmitButton text={loading ? "Creating…" : "Register"} disabled={loading} />

          <div className="text-sm text-content-muted mt-4">
            Already have an account?{" "}
            <button type="button" onClick={() => navigate("/login")} className="text-brand-hover underline hover:text-white transition">Sign in</button>
            {" — "}
            <button type="button" onClick={() => navigate("/forgot-password")} className="text-brand-hover underline hover:text-white transition">Forgot password?</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
