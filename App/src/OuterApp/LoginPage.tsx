import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";

const googleLogo = "/GoogleLogo.svg";
const FacebookLogo = "/FacebookLogo.svg";

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
      const response = await fetch(`${API_BASE_URL}/api/v1/user/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();

        const token = responseData.accessToken || responseData.token;
        localStorage.setItem("authToken", token);
        localStorage.setItem("userId", responseData.userId);
        localStorage.setItem(
          "username",
          responseData.user?.username || data.email.split("@")[0]
        );
        localStorage.setItem(
          "userEmail",
          responseData.user?.email || data.email
        );

        localStorage.setItem(
          "verified",
          responseData.user?.verified === "true" ? "true" : "false"
        );

        const fullName = responseData.user?.name || "";
        const nameParts = fullName.split(" ");
        const firstName = responseData.user?.firstName || nameParts[0] || "";
        const lastName =
          responseData.user?.lastName || nameParts.slice(1).join(" ") || "";

        localStorage.setItem("fullName", fullName);
        localStorage.setItem("firstName", firstName);
        localStorage.setItem("lastName", lastName);
        localStorage.setItem(
          "superRole",
          `${responseData.user?.role || "user"}`
        );

        if (responseData.user?.verified !== "true") {
          alert(t("loginSuccessful"));
          navigate("/check-email");
        } else {
          alert(t("loginSuccessful"));
          navigate("/home/progress-tracker");
        }
      } else {
        const errorData = await response.json();
        alert(`${t("loginFailed")} ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert(`An error occurred. Please try again later.\n${error}`);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const facebook = () =>
    window.open(`${API_BASE_URL}/auth/facebook`, "_self");

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
      <div className="relative z-10 flex justify-center items-center min-h-[calc(100vh-5rem)] px-4 pt-16 sm:pt-4 pb-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md p-8 rounded-2xl border border-line-glass shadow-2xl"
          style={{
            background: "rgba(20, 20, 30, 0.7)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-center text-white">
            {t("loginTitle")}
          </h2>

          {/* ── Social buttons ── */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 mb-3 p-3 rounded-xl border border-line-glass text-white hover:bg-white/5 transition"
            onClick={handleGoogleLogin}
          >
            <img src={googleLogo} alt="Google" className="h-5 w-5" />
            {t("continueWithGoogle")}
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-line-glass text-white hover:bg-white/5 transition"
            onClick={facebook}
          >
            <img src={FacebookLogo} alt="Facebook" className="h-5 w-5" />
            {t("continueWithFacebook")}
          </button>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-line-glass" />
            <span className="text-sm text-content-muted">{t("or")}</span>
            <div className="flex-1 h-px bg-line-glass" />
          </div>

          {/* ── Email ── */}
          <div className="mb-4">
            <input
              id="email"
              type="text"
              placeholder={t("emailPlaceholder")}
              className={`w-full p-3 rounded-xl border bg-surface-overlay text-white placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand-focus transition ${
                errors.email ? "border-status-error" : "border-line-dark"
              }`}
              {...register("email", {
                required: t("emailRequired"),
                pattern: {
                  value:
                    /^(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}|[a-zA-Z0-9._]{3,20})$/,
                  message: t("invalidEmailOrUsername"),
                },
              })}
            />
            {errors.email && (
              <p className="text-status-error text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* ── Password ── */}
          <div className="mb-6 relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("passwordPlaceholder")}
              className={`w-full p-3 pr-12 rounded-xl border bg-surface-overlay text-white placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand-focus transition ${
                errors.password ? "border-status-error" : "border-line-dark"
              }`}
              {...register("password", {
                required: t("passwordRequired"),
                minLength: { value: 6, message: t("passwordTooShort") },
              })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-content-muted hover:text-white transition"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && (
              <p className="text-status-error text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* ── Forgot password ── */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-content-muted hover:text-white underline transition"
            >
              Forgot password?
            </button>
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold transition shadow-lg shadow-brand/20"
          >
            {t("loginButton")}
          </button>

          {/* ── Footer links ── */}
          <div className="text-sm text-content-muted mt-6 text-center space-x-1">
            <span>Don't have an account?</span>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-brand-hover underline hover:text-white transition"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
