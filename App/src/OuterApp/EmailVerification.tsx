import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import BackgroundWrapper from "./components/BackgroundWrapper";
import { useLanguage } from "../hooks/useLanguage";

const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  // Get email from localStorage on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (!storedEmail) {
      setError(t("verify.emailNotFound"));
    }
    setEmail(storedEmail);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError(t("verify.emailNotFound"));
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError(t("verify.invalidCode"));
      return;
    }

    // TEMPORARY BACKDOOR: Automatically verify if code is 999998
    if (code === "999998") {
      console.log("Temporary backdoor code used for verification"); // optional log
      localStorage.removeItem("email"); // optional: clear stored email
      navigate("/home");
      return; // skip API call
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
        credentials: "include",
      });

      if (res.status === 200) {
        localStorage.removeItem("email");
        navigate("/home");
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body?.error || t("verify.verificationFailed"));
      }
    } catch (err) {
      console.error(err);
      setError(t("verify.networkError"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendMessage(null);

    if (!email) {
      setResendMessage(t("verify.emailNotFound"));
      return;
    }

    setResendLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      if (res.status === 200) {
        setResendMessage(t("verify.codeResent"));
      } else {
        const body = await res.json().catch(() => ({}));
        setResendMessage(body?.error || t("verify.failedResend"));
      }
    } catch (err) {
      console.error(err);
      setResendMessage(t("verify.resendNetworkError"));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <BackgroundWrapper>
      <Navbar />
      <div className="flex flex-col items-center justify-center h-screen pt-16 px-4 text-white">
        <div className="bg-white/5 backdrop-blur p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-3xl font-bold mb-4">{t("verify.title")}</h2>
          <p className="text-gray-300 mb-6">
            {t("verify.instructionsBefore")}{" "}
            <strong>{email || "..."}</strong> {t("verify.instructionsAfter")}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/, ""))}
              className="w-32 text-center text-lg p-2 rounded-lg mb-4 text-black"
              placeholder={t("verify.codePlaceholder")}
            />

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <button
              type="submit"
              disabled={loading || !email}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition"
            >
              {loading ? t("verify.verifying") : t("verify.verify")}
            </button>
          </form>

          <p className="text-sm text-gray-400 mt-4">
            {t("verify.didntReceive")}{" "}
            <button
              onClick={handleResend}
              disabled={resendLoading || !email}
              className="underline text-purple-400"
            >
              {resendLoading ? t("verify.resending") : t("verify.resend")}
            </button>
          </p>
          {resendMessage && <p className="text-green-400 text-sm mt-2">{resendMessage}</p>}
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default EmailVerification;
