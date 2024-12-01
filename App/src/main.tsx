import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './OuterApp/LandingPage.tsx';
import RegisterPage from './OuterApp/RegisterPage.tsx';
import LoginPage from './OuterApp/LoginPage.tsx';
import NotFoundPage from './HelperPages/NotFoundPage.tsx';
import App from './App.tsx';
import ProgressPage from './InnerApp/ProgressPage.tsx';
import Contact from './OuterApp/Contact.tsx';
import Inbox from './InnerApp/Inbox.tsx';
import SendMail from './InnerApp/SendMail.tsx';
import Layout from './InnerApp/Layout.tsx';
import Home from './InnerApp/Home.tsx';
import Account from './InnerApp/Account.tsx';
import AboutUs from './OuterApp/AboutUs.tsx';
import Kanban from './InnerApp/Kanban/Kanban.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <NotFoundPage />,
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
    element: <AboutUs matrixWidth={100} matrixHeight={100}/>
  },
  {
    path: "/mail/send",
    element: <SendMail />,
  },
  {
    path: "/home",
    element: <Layout />, // Layout wraps its child routes
    children: [
      { index: true, element: <Home /> }, // Default child route for "/home"
      { path: "inbox", element: <Inbox /> }, // Renders Inbox under "/home/inbox"
      { path: "mail/send", element: <SendMail /> }, // Renders SendMail under "/home/send"
      { path: "account", element: <Account /> },
      { path: "kanban", element: <Kanban /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
