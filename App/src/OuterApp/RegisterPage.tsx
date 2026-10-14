import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import SocialLoginButtons from "./components/SocialLoginButtons";
import FormInput from "./components/FormInput";
import CheckboxInput from "./components/CheckboxInput";
import SubmitButton from "./components/SubmitButton";
import { usePostHog } from "@posthog/react";
import { useLanguage } from "../hooks/useLanguage";

interface RegisterFormInputs {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

interface RegisterFormProps {
  /** Called when the user asks to switch to the login form. When provided,
   * this is used instead of a hard navigation so the parent can animate the
   * transition while still updating the URL. */
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const posthog = usePostHog();
  const { t } = useLanguage();

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
        posthog.identify(payload.email, {
          email: payload.email,
          username: payload.username,
          first_name: payload.firstName,
          last_name: payload.lastName,
        });
        posthog.capture("user_signed_up", {
          method: "email",
          username: payload.username,
        });
        setInfoMessage(
          t("register.successMessage")
        );
        setTimeout(() => navigate("/check-email"), 1000);
      } else {
        const body = await res.json().catch(() => ({}));
        const err =
          body?.error || body?.message || t("register.failedStatus", { status: String(res.status) });
        setGlobalError(err);
      }
    } catch (err) {
      console.error("Registration error:", err);
      posthog.captureException(err instanceof Error ? err : new Error(String(err)));
      setGlobalError(t("register.networkError"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    posthog.capture("user_signed_up_with_google");
    window.location.href = `${API_BASE_URL}/auth/google`;
  };
  const handleFacebookLogin = () => {
    posthog.capture("user_signed_up_with_facebook");
    window.location.href = `${API_BASE_URL}/auth/oauth/facebook`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-center text-white">{t("register.title")}</h2>

          <SocialLoginButtons
            onGoogleLogin={handleGoogleLogin}
            onFacebookLogin={handleFacebookLogin}
          />

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-line-glass" />
            <span className="text-sm text-content-muted">{t("or")}</span>
            <div className="flex-1 h-px bg-line-glass" />
          </div>

          {/* Name inputs */}
          <div className="flex lg:flex-row flex-col justify-center">
            <div className="mb-4 lg:pr-2 flex-1">
              <FormInput
                id="firstName"
                type="text"
                placeholder={t("register.firstName")}
                register={register("firstName", {
                  required: t("register.firstNameRequired"),
                  minLength: { value: 2, message: t("register.tooShort") },
                  pattern: { value: /^[\p{L}\p{M}'-]{2,}$/u, message: t("register.invalidName") },
                })}
                error={errors.firstName}
              />
            </div>

            <div className="mb-4 lg:pl-2 flex-1">
              <FormInput
                id="lastName"
                type="text"
                placeholder={t("register.lastName")}
                register={register("lastName", {
                  required: t("register.lastNameRequired"),
                  minLength: { value: 2, message: t("register.tooShort") },
                  pattern: { value: /^[\p{L}\p{M}'-]{2,}$/u, message: t("register.invalidName") },
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
              placeholder={t("register.email")}
              register={register("email", {
                required: t("register.emailRequired"),
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t("register.invalidEmail") },
                maxLength: { value: 254, message: t("register.emailTooLong") },
              })}
              error={errors.email}
            />
          </div>

          {/* Username input */}
          <div className="mb-4">
            <FormInput
              id="username"
              type="text"
              placeholder={t("register.usernameCompany")}
              register={register("username", {
                required: t("register.usernameRequired"),
                minLength: { value: 3, message: t("register.usernameMin") },
                maxLength: { value: 50, message: t("register.tooLong") },
                pattern: { value: /^[a-zA-Z0-9._-]{3,50}$/, message: t("register.invalidUsername") },
              })}
              error={errors.username}
            />
          </div>

          {/* Password input */}
          <div className="mb-4">
            <FormInput
              id="password"
              type="password"
              placeholder={t("register.password")}
              register={register("password", {
                required: t("register.passwordRequired"),
                minLength: { value: 12, message: t("register.passwordMin") },
                validate: (v) => {
                  const checks = [
                    /[A-Z]/.test(v) || t("register.addUppercase"),
                    /[a-z]/.test(v) || t("register.addLowercase"),
                    /[0-9]/.test(v) || t("register.addNumber"),
                    /[^A-Za-z0-9]/.test(v) || t("register.addSymbol"),
                  ];
                  return checks.find((c) => typeof c === "string") || true;
                },
              })}
              error={errors.password}
              showPassword={showPassword}
              onTogglePassword={togglePassword}
            />
            <div className="text-xs text-content-muted mt-1">
              {t("register.passwordHint")}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <FormInput
              id="confirmPassword"
              type="password"
              placeholder={t("register.confirmPassword")}
              register={register("confirmPassword", {
                required: t("register.confirmRequired"),
                validate: (v) => v === watch("password") || t("register.passwordsNoMatch"),
              })}
              error={errors.confirmPassword}
              showPassword={showConfirmPassword}
              onTogglePassword={toggleConfirmPassword}
            />
          </div>

          {/* Terms */}
          <div className="mb-4">
            <CheckboxInput
              register={register("terms", { required: t("register.mustAcceptTerms") })}
              error={errors.terms}
              label={
                <div>
                  {t("register.acceptThe")}{" "}
                  <a href="/terms" className="text-brand-hover underline hover:text-white transition" target="_blank" rel="noreferrer">{t("register.termsOfUse")}</a>{" "}
                  {t("register.and")}{" "}
                  <a href="/privacy" className="text-brand-hover underline hover:text-white transition" target="_blank" rel="noreferrer">{t("privacyPolicy")}</a>.
                </div>
              }
            />
          </div>

          {globalError && <p className="text-sm text-status-error mb-3">{globalError}</p>}
          {infoMessage && <p className="text-sm text-green-400 mb-3">{infoMessage}</p>}

          <SubmitButton text={loading ? t("register.creating") : t("register.title")} disabled={loading} />

          <div className="text-sm text-content-muted mt-4">
            {t("register.alreadyHaveAccount")}{" "}
            <button type="button" onClick={() => (onSwitchToLogin ? onSwitchToLogin() : navigate("/login"))} className="text-brand-hover underline hover:text-white transition">{t("register.signIn")}</button>
            {" — "}
            <button type="button" onClick={() => navigate("/forgot-password")} className="text-brand-hover underline hover:text-white transition">{t("register.forgotPassword")}</button>
          </div>
    </form>
  );
};

export default RegisterForm;
