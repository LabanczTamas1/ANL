import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../services/api/authApi";

type Step = "email" | "reset";

interface EmailFormInputs {
  email: string;
}

interface ResetFormInputs {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const emailForm = useForm<EmailFormInputs>();
  const resetForm = useForm<ResetFormInputs>();

  const handleEmailSubmit = async (data: EmailFormInputs) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await forgotPassword({ email: data.email.trim().toLowerCase() });
      setEmail(data.email.trim().toLowerCase());
      setMessage("If that email exists, a reset code has been sent. Check your inbox.");
      setStep("reset");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (data: ResetFormInputs) => {
    if (data.newPassword !== data.confirmPassword) {
      resetForm.setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await resetPassword({
        email,
        code: data.code.trim(),
        newPassword: data.newPassword,
      });
      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-surface-overlay overflow-hidden">
      {/* ── Ambient background ── */}
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
      <div className="relative z-10 flex justify-center items-center min-h-[calc(100vh-5rem)] px-4 pt-16 sm:pt-4 pb-10">
        <div
          className="w-full max-w-md p-8 rounded-2xl border border-line-glass shadow-2xl"
          style={{
            background: "rgba(20, 20, 30, 0.7)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-center text-white">
            {step === "email" ? "Forgot Password" : "Reset Password"}
          </h2>
          <p className="text-content-muted text-center mb-8 text-sm">
            {step === "email"
              ? "Enter your email and we'll send you a 6-digit reset code."
              : `Enter the code sent to ${email} and choose a new password.`}
          </p>

          {/* ── Messages ── */}
          {message && (
            <p className="text-sm text-green-400 mb-4 text-center">{message}</p>
          )}
          {error && (
            <p className="text-sm text-status-error mb-4 text-center">{error}</p>
          )}

          {/* ── Step 1: Email ── */}
          {step === "email" && (
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)}>
              <div className="mb-6">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`w-full p-3 rounded-xl border bg-surface-overlay text-white placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand-focus transition ${
                    emailForm.formState.errors.email
                      ? "border-status-error"
                      : "border-line-dark"
                  }`}
                  {...emailForm.register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  })}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-status-error text-sm mt-1">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition shadow-lg shadow-brand/20"
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          )}

          {/* ── Step 2: Code + New Password ── */}
          {step === "reset" && (
            <form onSubmit={resetForm.handleSubmit(handleResetSubmit)}>
              {/* Code */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="6-digit code"
                  maxLength={6}
                  className={`w-full p-3 rounded-xl border bg-surface-overlay text-white placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand-focus transition text-center text-2xl tracking-[0.5em] ${
                    resetForm.formState.errors.code
                      ? "border-status-error"
                      : "border-line-dark"
                  }`}
                  {...resetForm.register("code", {
                    required: "Reset code is required",
                    pattern: {
                      value: /^\d{6}$/,
                      message: "Code must be 6 digits",
                    },
                  })}
                />
                {resetForm.formState.errors.code && (
                  <p className="text-status-error text-sm mt-1">
                    {resetForm.formState.errors.code.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="mb-4 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  className={`w-full p-3 pr-12 rounded-xl border bg-surface-overlay text-white placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand-focus transition ${
                    resetForm.formState.errors.newPassword
                      ? "border-status-error"
                      : "border-line-dark"
                  }`}
                  {...resetForm.register("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-content-muted hover:text-white transition"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {resetForm.formState.errors.newPassword && (
                  <p className="text-status-error text-sm mt-1">
                    {resetForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-6 relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  className={`w-full p-3 pr-12 rounded-xl border bg-surface-overlay text-white placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand-focus transition ${
                    resetForm.formState.errors.confirmPassword
                      ? "border-status-error"
                      : "border-line-dark"
                  }`}
                  {...resetForm.register("confirmPassword", {
                    required: "Please confirm your password",
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-content-muted hover:text-white transition"
                  onClick={() => setShowConfirm((p) => !p)}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-status-error text-sm mt-1">
                    {resetForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition shadow-lg shadow-brand/20"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              {/* Resend */}
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setMessage(null);
                  setError(null);
                  resetForm.reset();
                }}
                className="w-full mt-3 text-sm text-content-muted hover:text-white transition text-center"
              >
                Didn't receive a code? Go back
              </button>
            </form>
          )}

          {/* ── Footer links ── */}
          <div className="text-sm text-content-muted mt-6 text-center space-x-1">
            <span>Remember your password?</span>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-brand-hover underline hover:text-white transition"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
