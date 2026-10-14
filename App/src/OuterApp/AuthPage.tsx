import React, { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

/**
 * AuthPage hosts both the login and register forms inside a single, persistent
 * page shell. Switching between the two updates the URL (`/login` <-> `/register`)
 * without a reload and plays a 3D card-flip transition as one form morphs into
 * the other.
 *
 * It is mounted as a pathless layout route in the router so the component stays
 * alive across both URLs — that's what keeps the transition smooth instead of
 * remounting the page.
 */
const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const mode: "login" | "register" =
    location.pathname === "/register" ? "register" : "login";

  const goToRegister = useCallback(() => navigate("/register"), [navigate]);
  const goToLogin = useCallback(() => navigate("/login"), [navigate]);

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
        {/* The card morphs its size to fit whichever form is active. `layout`
            drives the smooth width/height metamorphosis. */}
        <motion.div
          layout
          transition={{ layout: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
          className="w-full max-w-md p-8 rounded-2xl border border-line-glass shadow-2xl overflow-hidden"
          style={{
            background: "rgba(20, 20, 30, 0.7)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0, scale: 0.92, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
            >
              {mode === "login" ? (
                <LoginPage onSwitchToRegister={goToRegister} />
              ) : (
                <RegisterPage onSwitchToLogin={goToLogin} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
