import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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
import InformationsLayout from "./OuterApp/Informations.tsx/InformationsLayout.tsx";
import AddAvailability from "./InnerApp/Booking/AddAvailability.tsx";
import DeleteAvailability from "./InnerApp/Booking/DeleteAvailability.tsx";
import EmptyPage from "./HelperPages/EmptyPage.tsx";
import ProgressTracker from "./InnerApp/ProgressTracker/ProgressTracker.tsx";
import BookingSuccess from "./InnerApp/Booking/BookingSuccess.tsx";
import { HelmetProvider } from "react-helmet-async";
import Onboarding from "./InnerApp/Onboarding/Onboarding.tsx";

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
    path: "/progress",
    element: <ProgressPage />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/mail/inbox",
    element: <Inbox />,
  },
  {
    path: "/aboutus",
    element: <AboutUs matrixWidth={100} matrixHeight={100} />,
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
    ],
  },

  {
    path: "/home",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> }, // Default child route for "/home"
      { path: "inbox", element: <Inbox /> }, // Renders Inbox under "/home/inbox"
      { path: "mail/send", element: <SendMail /> }, // Renders SendMail under "/home/send"
      { path: "account", element: <Account /> },
      { path: "kanban", element: <Kanban /> },
      { path: "adminpage", element: <AdminPage /> },
      { path: "booking", element: <Booking /> },
      { path: "successful-booking", element: <BookingSuccess /> },
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
    ],
  },
  {
    path: "onboarding",
    element: <Onboarding/>,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </StrictMode>
);
