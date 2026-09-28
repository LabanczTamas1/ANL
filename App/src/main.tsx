import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import posthog from "posthog-js";
import { PostHogErrorBoundary, PostHogProvider } from "@posthog/react";
import { onCLS, onFCP, onLCP, onTTFB, onINP } from "web-vitals";

posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN, {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  defaults: "2026-01-30",
  opt_out_capturing_by_default: true,
  // Dead-click detection schedules a timeout + DOM-mutation check on every
  // click, adding per-tap main-thread work that makes taps feel laggy on
  // low-end mobile. We don't use the signal, so turn it off.
  capture_dead_clicks: false,
  // Session replay (rrweb) is enabled on all devices. It was previously
  // disabled on mobile while chasing navbar lag, but the real cause was the
  // decorative ambient backgrounds (see index.css mobile paint guard), so
  // replay can safely run on phones again.
});

// Re-enable capturing if the user already consented in a previous visit
const existingConsent = localStorage.getItem('cookieConsent');
const existingPrefs = localStorage.getItem('cookiePreferences');
if (existingConsent === 'true') {
  const prefs = existingPrefs ? JSON.parse(existingPrefs) : null;
  // Opt in only if analytics was explicitly allowed (or old banner that stored 'true' with no prefs)
  if (!prefs || prefs.analytics === true) {
    posthog.opt_in_capturing();
  }
}

function reportWebVital({ name, delta, value, id, rating }: { name: string; delta: number; value: number; id: string; rating: string }) {
  posthog.capture("web_vitals", {
    metric_name: name,
    metric_value: value,
    metric_delta: delta,
    metric_id: id,
    metric_rating: rating,
  });
}

onCLS(reportWebVital);
onFCP(reportWebVital);
onLCP(reportWebVital);
onTTFB(reportWebVital);
onINP(reportWebVital);
import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import BasicLoader from "./Loaders/BasicLoader.tsx";
// Eagerly loaded: the landing page is the LCP element for "/", and
// NotFoundPage is the router errorElement — both must render immediately.
import LandingPage from "./OuterApp/LandingPage.tsx";
import NotFoundPage from "./HelperPages/NotFoundPage.tsx";

// Route components are lazy-loaded so each one ships as its own chunk. This
// keeps the initial JS bundle small instead of shipping every page up front.
const RegisterPage = lazy(() => import("./OuterApp/RegisterPage.tsx"));
const LoginPage = lazy(() => import("./OuterApp/LoginPage.tsx"));
const ProgressPage = lazy(() => import("./InnerApp/ProgressPage.tsx"));
const Contact = lazy(() => import("./OuterApp/Contact.tsx"));
const Inbox = lazy(() => import("./InnerApp/Inbox.tsx"));
const SendMail = lazy(() => import("./InnerApp/SendMail.tsx"));
const Layout = lazy(() => import("./InnerApp/Layout.tsx"));
const Home = lazy(() => import("./InnerApp/Home.tsx"));
const Account = lazy(() => import("./InnerApp/Account.tsx"));
const AboutUs = lazy(() => import("./OuterApp/AboutUs.tsx"));
const Kanban = lazy(() => import("./InnerApp/Kanban/Kanban.tsx"));
const AdminPage = lazy(() => import("./InnerApp/AdminPage/index.tsx"));
const Booking = lazy(() => import("./InnerApp/Booking/Booking.tsx"));
const Availability = lazy(() => import("./InnerApp/Booking/Availability.tsx"));
const AvailabilityOverview = lazy(() => import("./InnerApp/Booking/AvailabilityOverview.tsx"));
const PrivacyPolicy = lazy(() => import("./OuterApp/Informations.tsx/PrivacyPolicy.tsx"));
const CookiePolicy = lazy(() => import("./OuterApp/Informations.tsx/CookiePolicy.tsx"));
const InformationsLayout = lazy(() => import("./OuterApp/Informations.tsx/InformationsLayout.tsx"));
const AddAvailability = lazy(() => import("./InnerApp/Booking/AddAvailability.tsx"));
const DeleteAvailability = lazy(() => import("./InnerApp/Booking/DeleteAvailability.tsx"));
const EmptyPage = lazy(() => import("./HelperPages/EmptyPage.tsx"));
const ProgressTracker = lazy(() => import("./InnerApp/ProgressTracker/ProgressTracker.tsx"));
const CalendarPage = lazy(() => import("./InnerApp/CalendarPage.tsx"));
const ProgressAdmin = lazy(() => import("./InnerApp/ProgressTracker/ProgressAdmin.tsx"));
const Onboarding = lazy(() => import("./InnerApp/Onboarding/Onboarding.tsx"));
const UserManagement = lazy(() => import("./InnerApp/UserManagement/UserManagement.tsx"));
const Statistics = lazy(() => import("./InnerApp/Statistics/Statistics.tsx"));
const TermsAndConditions = lazy(() => import("./OuterApp/Informations.tsx/TermsAndConditions.tsx"));
const Services = lazy(() => import("./OuterApp/Services.tsx"));
const MessageDetail = lazy(() => import("./InnerApp/components/MessageDetail.tsx"));
const OAuthCallback = lazy(() => import("./services/OauthCallback.tsx"));
const LanguageSwitcherPage = lazy(() => import("./InnerApp/LanguageSwitcherPage.tsx"));
const SuccessfulBooking = lazy(() => import("./InnerApp/Booking/SuccessfulBooking.tsx"));
const BookingConfirmation = lazy(() => import("./OuterApp/BookingConfirmation.tsx"));
const EmailVerification = lazy(() => import("./OuterApp/EmailVerification.tsx"));
const ForgotPasswordPage = lazy(() => import("./OuterApp/ForgotPasswordPage.tsx"));
const DesignPlaygroundLayout = lazy(() => import("./OuterApp/DesignPlayground/DesignPlaygroundLayout.tsx"));
const PlaygroundOverview = lazy(() => import("./OuterApp/DesignPlayground/PlaygroundOverview.tsx"));
const PlaygroundComponentPage = lazy(() => import("./OuterApp/DesignPlayground/PlaygroundComponentPage.tsx"));
const LastOutComing = lazy(() => import("./InnerApp/SentEmails"));
const CalendarCallback = lazy(() => import("./InnerApp/AdminPage/CalendarCallback.tsx"));
const AddReview = lazy(() => import("./InnerApp/AddReview.tsx"));
import { ReactNode } from "react";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./hooks/useLanguage";
import { translations } from "./translations/translations";
import { NotificationProvider } from "./contexts/NotificationContext";

// Admin Protected Route Component
const AdminRoute = ({ children }: { children: ReactNode }) => {
  // Check if user is admin based on localStorage
  const isAdmin = localStorage.getItem("name") === "admin";

  if (!isAdmin) {
    // Redirect to home page if not admin
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

// Allows admins and owners (based on superRole) to access management views
const ManagerRoute = ({ children }: { children: ReactNode }) => {
  const role = localStorage.getItem("superRole");
  if (role !== "admin" && role !== "owner") {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

// Root layout that scrolls to top on every navigation
const RootLayout = () => (
  <>
    <ScrollToTop />
    <Suspense fallback={<BasicLoader />}>
      <Outlet />
    </Suspense>
  </>
);

// Requires valid authToken AND verified status
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) return <Navigate to="/login" replace />;

  const verified = localStorage.getItem('verified');
  if (verified !== 'true') return <Navigate to="/check-email" replace />;

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
  {
    path: "/empty",
    element: <EmptyPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/oauth-callback",
    element: <OAuthCallback />,
  },
  {
    path: "/check-email",
    element: <EmailVerification />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/design-playground",
    element: <DesignPlaygroundLayout />,
    children: [
      { index: true, element: <PlaygroundOverview /> },
      { path: ":slug", element: <PlaygroundComponentPage /> },
    ],
  },
  {
    path: "/progress",
    element: <ProgressPage />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/aboutus",
    element: <AboutUs />,
  },
  {
    path: "/services",
    element: <Services />,
  },
  {
    path: "/mail/send-mail",
    element: <SendMail />,
  },
  { path: "booking", element: <Booking /> },
  {
    path: "/booking/confirmation/:token",
    element: <BookingConfirmation />,
  },
  {
    path: "/admin/calendar-callback",
    element: <CalendarCallback />,
  },
  {
    path: "/information",
    element: <InformationsLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "privacy-policy", element: <PrivacyPolicy /> },
      { path: "terms-and-conditions", element: <TermsAndConditions /> },
      { path: "cookie-policy", element: <CookiePolicy /> },
    ],
  },

  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Home /> }, // Default child route for "/home"
      { path: "mail/inbox", element: <Inbox /> }, // Renders Inbox under "/home/inbox"
      { path: "mail/inbox/:details", element: <MessageDetail /> },
      { path: "mail/send", element: <SendMail /> }, // Renders SendMail under "/home/send"
      {
        path: "mail/last-outgoing",
        element: <LastOutComing />,
      },
      { path: "account", element: <Account /> },
      { path: "kanban", element: <Kanban /> },
      // Protected admin route
      {
        path: "adminpage",
        element: (
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        ),
      },
      { path: "booking", element: <Booking /> },
      { path: "calendar", element: <CalendarPage /> },
      { path: "successful-booking", element: <SuccessfulBooking /> },
      { path: "progress-tracker", element: <ProgressTracker /> },
      {
        path: "progress-management",
        element: (
          <ManagerRoute>
            <ProgressAdmin />
          </ManagerRoute>
        ),
      },
      {
        path: "booking/availability",
        element: <Availability />,
      },
      {
        path: "booking/availability/overview",
        element: (
          <AdminRoute>
            <AvailabilityOverview />
          </AdminRoute>
        ),
      },
      {
        path: "booking/availability/add-availability",
        element: <AddAvailability />,
      },
      {
        path: "booking/availability/delete-availability",
        element: <DeleteAvailability />,
      },
      // Protected user management route (assuming this is also admin-only)
      {
        path: "user-management",
        element: (
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        ),
      },
      // Protected statistics route (assuming this is also admin-only)
      {
        path: "statistics",
        element: (
          <AdminRoute>
            <Statistics />
          </AdminRoute>
        ),
      },
      {
        path: "add-review",
        element: <AddReview />,
      },
      {
        path: "language-selection",
        element: <LanguageSwitcherPage />,
      },
      {
        path: "privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "cookie-policy",
        element: <CookiePolicy />,
      },
      {
        path: "terms-and-policy",
        element: (
          <>
            <TermsAndConditions />
            <PrivacyPolicy />
          </>
        ),
      },
    ],
  },
  {
    path: "onboarding",
    element: <Onboarding />,
  },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <PostHogErrorBoundary>
        <HelmetProvider>
          <LanguageProvider translations={translations} defaultLanguage="english">
            <NotificationProvider>
              <RouterProvider router={router} />
            </NotificationProvider>
          </LanguageProvider>
        </HelmetProvider>
      </PostHogErrorBoundary>
    </PostHogProvider>
  </StrictMode>,
);
