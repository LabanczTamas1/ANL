import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import LandingPage from "./OuterApp/LandingPage.tsx";
import RegisterPage from "./OuterApp/RegisterPage.tsx";
import LoginPage from "./OuterApp/LoginPage.tsx";
import NotFoundPage from "./HelperPages/NotFoundPage.tsx";
// import App from "./App.tsx";
import ProgressPage from "./InnerApp/ProgressPage.tsx";
import Contact from "./OuterApp/Contact.tsx";
import Inbox from "./InnerApp/Inbox.tsx";
import SendMail from "./InnerApp/SendMail.tsx";
import Layout from "./InnerApp/Layout.tsx";
import Home from "./InnerApp/Home.tsx";
import Account from "./InnerApp/Account.tsx";
import AboutUs from "./OuterApp/AboutUs.tsx";
import Kanban from "./InnerApp/Kanban/Kanban.tsx";
import AdminPage from "./InnerApp/AdminPage.tsx";
import Booking from "./InnerApp/Booking/Booking.tsx";
import Availability from "./InnerApp/Booking/Availability.tsx";
import PrivacyPolicy from "./OuterApp/Informations.tsx/PrivacyPolicy.tsx";
import CookiePolicy from "./OuterApp/Informations.tsx/CookiePolicy.tsx";
import InformationsLayout from "./OuterApp/Informations.tsx/InformationsLayout.tsx";
import AddAvailability from "./InnerApp/Booking/AddAvailability.tsx";
import DeleteAvailability from "./InnerApp/Booking/DeleteAvailability.tsx";
import EmptyPage from "./HelperPages/EmptyPage.tsx";
import ProgressTracker from "./InnerApp/ProgressTracker/ProgressTracker.tsx";
import { HelmetProvider } from "react-helmet-async";
import Onboarding from "./InnerApp/Onboarding/Onboarding.tsx";
import UserManagement from "./InnerApp/UserManagement/UserManagement.tsx";
import Statistics from "./InnerApp/Statistics/Statistics.tsx";
import TermsAndConditions from "./OuterApp/Informations.tsx/TermsAndConditions.tsx";
import Services from "./OuterApp/Services.tsx";
import MessageDetail from "./InnerApp/components/MessageDetail.tsx";
import { ReactNode } from "react";
import OAuthCallback from "./services/OauthCallback.tsx";
import LanguageSwitcherPage from "./InnerApp/LanguageSwitcherPage.tsx";
import { LanguageProvider } from './hooks/useLanguage';
import { translations } from './translations/translations';
import { NotificationProvider } from './contexts/NotificationContext';
import SuccessfulBooking from "./InnerApp/Booking/SuccessfulBooking.tsx";

// Admin Protected Route Component
const AdminRoute = ({ children }: { children: ReactNode }) => {
  // Check if user is admin based on localStorage
  const isAdmin = localStorage.getItem('name') === 'admin';
  
  if (!isAdmin) {
    // Redirect to home page if not admin
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <NotFoundPage />,
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
    path: "/mail/send",
    element: <SendMail />,
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
    element: <Layout />,
    children: [
      { index: true, element: <Home /> }, // Default child route for "/home"
      { path: "mail/inbox", element: <Inbox /> }, // Renders Inbox under "/home/inbox"
      { path: "mail/inbox/:details", element: <MessageDetail /> },
      { path: "mail/send", element: <SendMail /> }, // Renders SendMail under "/home/send"
      { path: "account", element: <Account /> },
      { path: "kanban", element: <Kanban /> },
      // Protected admin route
      { 
        path: "adminpage", 
        element: <AdminRoute><AdminPage /></AdminRoute> 
      },
      { path: "booking", element: <Booking /> },
      { path: "successful-booking", element: <SuccessfulBooking /> },
      { path: "progress-tracker", element: <ProgressTracker /> },
      {
        path: "booking/availability",
        element: <Availability />,
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
        element: <AdminRoute><UserManagement /></AdminRoute>,
      },
      // Protected statistics route (assuming this is also admin-only)
      {
        path: "statistics",
        element: <AdminRoute><Statistics /></AdminRoute>,
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
        element: <><TermsAndConditions /><PrivacyPolicy /></>,
      },
    ],
  },
  {
    path: "onboarding",
    element: <Onboarding />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
    <LanguageProvider translations={translations} defaultLanguage="english">
    <NotificationProvider>
      <RouterProvider router={router} />
      </NotificationProvider>
      </LanguageProvider>
    </HelmetProvider>
  </StrictMode>
);