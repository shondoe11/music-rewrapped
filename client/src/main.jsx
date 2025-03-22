import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './globals.css'
//* use spotify design guidelines for fonts/colors as per https://developer.spotify.com/documentation/design
import { AuthProvider } from './context/AuthProvider.jsx'
import 'react-toastify/dist/ReactToastify.css';
import { Bounce, Flip, Slide, ToastContainer, Zoom } from 'react-toastify'
import SplashCursor from './styles/animations/SplashCursor.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SplashCursor 
      DENSITY_DISSIPATION={5}
      COLOR_UPDATE_SPEED={15}
      SPLAT_RADIUS={0.1}
      SPLAT_FORCE={9000}
      TRANSPARENT={true}
    />
    <AuthProvider>
      <App />
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Flip}
        />
    </AuthProvider>
  </React.StrictMode>,
)