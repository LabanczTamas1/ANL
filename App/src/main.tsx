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

const router = createBrowserRouter([{
  path: '/',
  element: <LandingPage/>,
  errorElement: <NotFoundPage/>
},
{
  path: '/register',
  element: <RegisterPage/>
},
{
  path: '/login',
  element: <LoginPage/>
},
{
  path: '/progress',
  element: <ProgressPage />
},
{
  path: '/contact',
  element: <Contact />
}
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
