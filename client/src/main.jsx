import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './globals.css';
import './styles/browser-compatibility.css';
//* use spotify design guidelines for fonts/colors as per https://developer.spotify.com/documentation/design
import { AuthProvider } from './context/AuthProvider.jsx';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce, Flip, Slide, ToastContainer, Zoom } from 'react-toastify';
import ClickSpark from './styles/animations/ClickSpark.jsx';
import { isSafari, isFirefox, applyCompatibilityClasses } from './utils/browserDetection';

//& browser compatibility classes to root element
document.addEventListener('DOMContentLoaded', () => {
  applyCompatibilityClasses(document.documentElement);
  
  //~ handling fr Safari SVG issues
  if (isSafari()) {
    document.documentElement.classList.add('safari-svg-fix');
    //~ force redraw SVG elements in Safari
    setTimeout(() => {
      document.querySelectorAll('svg').forEach(svg => {
        const display = svg.style.display;
        svg.style.display = 'none';
        svg.offsetHeight; // Trigger reflow
        svg.style.display = display;
      });
    }, 100);
  }
  
  //~ Firefox-specific fixes
  if (isFirefox()) {
    document.documentElement.classList.add('firefox-fix');
  }
});

//& Browser feature detection & fallbacks
const applyFeatureDetection = () => {
  //~ check backdrop-filter support
  if (!('backdropFilter' in document.documentElement.style) && 
      !('-webkit-backdrop-filter' in document.documentElement.style)) {
    document.documentElement.classList.add('no-backdrop-filter');
  }
  
  //~ check background-clip: text support
  const tempElement = document.createElement('div');
  tempElement.style.backgroundClip = 'text';
  if (tempElement.style.backgroundClip !== 'text') {
    document.documentElement.classList.add('no-bg-clip-text');
  }
};

applyFeatureDetection();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClickSpark
      sparkColor='#00FF6E'
      sparkSize={14}
      sparkRadius={10}
      sparkCount={12}
      duration={500}
    >
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
    </ClickSpark>
  </React.StrictMode>,
);