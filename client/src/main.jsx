import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './globals.css'
//* use spotify design guidelines for fonts/colors as per https://developer.spotify.com/documentation/design
import { AuthProvider } from './context/AuthProvider.jsx'
import 'react-toastify/dist/ReactToastify.css';
import { Bounce, Flip, Slide, ToastContainer, Zoom } from 'react-toastify'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
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