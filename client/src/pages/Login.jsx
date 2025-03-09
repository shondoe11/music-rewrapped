import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/user`, {
          credentials: 'include'
        });
        if (response.ok) {
          toast.success("Authentication success. redirecting...")
          navigate('/home');
        }
      } catch (err) {
        toast.error("failed to fetch authentication status");
        console.error("failed to fetch user:", err);
      }
    }
    checkAuth();
  }, [navigate]);

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BASE_URL}/auth/login`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "'Circular', sans-serif" }}>Music Re-Wrapped</h1>
      <p className="text-lg mb-8" style={{ fontFamily: "'Circular', sans-serif" }}>
        Learn more about your music taste with Music Re-Wrapped.
      </p>
      <button 
        onClick={handleLogin} 
        className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-full text-xl font-semibold"
        style={{ fontFamily: "'Circular', sans-serif" }}
      >
        Login with Spotify
      </button>
    </div>
  );
};

export default Login;