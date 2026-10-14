import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { usePostHog } from "@posthog/react";
import posthog from "posthog-js";

const googleLogo = "/GoogleLogo.svg";
const FacebookLogo = "/FacebookLogo.svg";

interface LoginFormInputs {
  email: string;
  password: string;
}

interface LoginPageProps {
  /** Called when the user asks to switch to the register form. When provided,
   * this is used instead of a hard navigation so the parent can animate the
   * transition while still updating the URL. */
  onSwitchToRegister?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { t } = useLanguage();
  const posthog = usePostHog();

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

        // Sync consent from backend — so the user doesn't see the banner again
        // if they already made a decision from another device or a previous session.
        const serverConsent = responseData.user?.cookie_consent;
        if (serverConsent === "true") {
          const analyticsAllowed = responseData.user?.analytics_consent === "true";
          localStorage.setItem("cookieConsent", "true");
          localStorage.setItem(
            "cookiePreferences",
            JSON.stringify({ essential: true, analytics: analyticsAllowed })
          );
          if (analyticsAllowed) {
            posthog.opt_in_capturing();
          } else {
            posthog.opt_out_capturing();
          }
        }
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

        const userId = responseData.userId || responseData.user?.id;
        const username = responseData.user?.username || data.email.split("@")[0];
        posthog.identify(userId || username, {
          email: responseData.user?.email || data.email,
          username,
        });
        posthog.capture("user_signed_in", {
          method: "email",
          user_id: userId,
        });

        if (responseData.user?.verified !== "true") {
          alert(t("loginSuccessful"));
          navigate("/check-email");
        } else {
          alert(t("loginSuccessful"));
          navigate("/home/progress-tracker");
        }
      } else {
        const errorData = await response.json();
        posthog.capture("$exception", { message: `Login failed: ${errorData.error}` });
        alert(`${t("loginFailed")} ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error during login:", error);
      posthog.captureException(error instanceof Error ? error : new Error(String(error)));
      alert(`${t("login.genericError")}\n${error}`);
    }
  };

  const handleGoogleLogin = () => {
    posthog.capture("user_signed_in_with_google");
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const facebook = () => {
    posthog.capture("user_signed_in_with_facebook");
    window.open(`${API_BASE_URL}/auth/facebook`, "_self");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
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
              {t("login.forgotPassword")}
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
            <span>{t("login.noAccount")}</span>
            <button
              type="button"
              onClick={() =>
                onSwitchToRegister ? onSwitchToRegister() : navigate("/register")
              }
              className="text-brand-hover underline hover:text-white transition"
            >
              {t("login.signUp")}
            </button>
          </div>
    </form>
  );
};

export default LoginPage;
