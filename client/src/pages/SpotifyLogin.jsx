import React, { useEffect, useRef, useState } from "react";
import { getCurrentUser } from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Aurora from "../styles/backgrounds/Aurora";
import Magnet from "../styles/animations/Magnet";
import RotatingText from "../styles/text-animations/RotatingText";
import GradientText from "../styles/text-animations/GradientText";
import SplashCursor from "../styles/animations/SplashCursor";
import { useAuth } from "../hooks/useAuth";
import Crosshair from "../styles/animations/Crosshair";

const SpotifyLogin = () => {
  const navigate = useNavigate();
  const { storeToken } = useAuth();
  const [showCrosshair, setShowCrosshair] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const learnMoreTextRef = useRef(null);
  const [crosshairVisible, setCrosshairVisible] = useState(false);

  useEffect(() => {
    //& check fr token in URL params (frm OAuth redirect)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      //~ store token w cross-browser compatibility
      storeToken(token);
      
      //~ clean URL by removing token
      window.history.replaceState({}, document.title, window.location.pathname);
      
      //~ smol delay ensure token is stored bef checking auth
      setTimeout(() => {
        checkAuth();
      }, 300);
    } else {
      checkAuth();
    }
    
    async function checkAuth() {
      try {
        const response = await getCurrentUser();
        if (response.user) {
          toast.success("Authentication success. redirecting...");
          navigate('/home');
        }
      } catch (err) {
        toast.error("Failed to fetch authentication status");
        console.error("failed to fetch user:", err);
      }
    }
  }, [navigate, storeToken]);
  
  //& handle mouse movement & show crosshair
  useEffect(() => {
    const handleMouseMove = () => {
      if (!showCrosshair) {
        setShowCrosshair(true);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [showCrosshair]);
  
  useEffect(() => {
    if (!learnMoreTextRef.current || !containerRef.current) return;
    
    const handleMousePosition = (e) => {
      const learnMoreRect = learnMoreTextRef.current.getBoundingClientRect();
      if (e.clientY > learnMoreRect.bottom) {
        setCrosshairVisible(true);
      } else {
        setCrosshairVisible(false);
      }
    };
    
    window.addEventListener('mousemove', handleMousePosition);
    
    return () => {
      window.removeEventListener('mousemove', handleMousePosition);
    };
  }, [learnMoreTextRef, containerRef]);

  
  const handleLogin = () => {
    //& in dev mode, prioritize local server
    const baseUrl = import.meta.env.DEV ? 'http://localhost:5001' : (import.meta.env.VITE_BASE_URL || 'https://music-rewrapped.onrender.com');
    
    //& store current origin to help w cross-browser redirects
    sessionStorage.setItem('auth_origin', window.location.origin);
    
    window.location.href = `${baseUrl}/auth/login`;
    if (import.meta.env.DEV) {
      console.log(`Redirecting to: ${baseUrl}/auth/login`);
    }
  };

  return (
    <div 
      className="relative w-full min-h-screen overflow-hidden"
      ref={containerRef}
    >
      <SplashCursor 
      DENSITY_DISSIPATION={10}
      COLOR_UPDATE_SPEED={15}
      SPLAT_RADIUS={0.1}
      SPLAT_FORCE={4000}
      TRANSPARENT={true}
      />
      {showCrosshair && crosshairVisible && <Crosshair containerRef={containerRef} color="rgba(0, 255, 255, 0.4)" />}

      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-black">
        <Aurora
          colorStops={["#191414", "#1DB954", "#FFFFFF"]}
          blend={0.25}
          amplitude={1}
          speed={2}
        />
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <h1 className="text-5xl font-bold mb-4 flex items-center" style={{ fontFamily: "'Circular', sans-serif" }}>
          <span>Music Re-</span>
          <RotatingText
            texts={['Wrapped', 'Framed', 'Visualized']}
            mainClassName="text-green-500"
            staggerFrom="last"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={3000}
          />
        </h1>

        <div ref={learnMoreTextRef}>
          <GradientText 
            colors={["#1DB954", "#4079ff", "#1DB954", "#ff4079", "#1DB954"]} 
            animationSpeed={6.5}
            className="text-lg mb-8"
            style={{ fontFamily: "'Circular', sans-serif" }}
          >
            Learn more about your music taste.
          </GradientText>
        </div>
        
        <Magnet padding={125} disabled={false} magnetStrength={1}>
          <button
            ref={buttonRef}
            onClick={handleLogin}
            className="px-8 py-4 bg-gray-800 hover:bg-green-500 rounded-full text-xl font-semibold transition-colors duration-300"
            style={{ fontFamily: "'Circular', sans-serif" }}
          >
            Login with Spotify
          </button>
        </Magnet>
        
      </div>
    </div>
  );
};

export default SpotifyLogin;