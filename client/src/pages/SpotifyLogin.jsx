import React, { useEffect } from "react";
import { getCurrentUser } from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Aurora from "../styles/backgrounds/Aurora";
import Magnet from "../styles/animations/Magnet";
import RotatingText from "../styles/text-animations/RotatingText";
import GradientText from "../styles/text-animations/GradientText";

const SpotifyLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
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
    checkAuth();
  }, [navigate]);

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BASE_URL}/auth/login`;
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
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
        <GradientText 
          colors={["#1DB954", "#4079ff", "#1DB954", "#ff4079", "#1DB954"]} 
          animationSpeed={6.5}
          className="text-lg mb-8"
          style={{ fontFamily: "'Circular', sans-serif" }}
        >
          Learn more about your music taste.
        </GradientText>
        <Magnet padding={125} disabled={false} magnetStrength={1}>
          <button
            onClick={handleLogin}
            className="px-8 py-4 bg-gray-800 hover:bg-green-500 rounded-full text-xl font-semibold"
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