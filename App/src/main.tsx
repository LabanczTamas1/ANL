import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './OuterApp/LandingPage.tsx';
import Register from './OuterApp/Register.tsx';
import NotFoundPage from './HelperPages/NotFoundPage.tsx';
import App from './App.tsx';

const router = createBrowserRouter([{
  path: '/',
  element: <LandingPage/>,
  errorElement: <NotFoundPage/>
},
{
  path: '/register',
  element: <Register/>
}
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
