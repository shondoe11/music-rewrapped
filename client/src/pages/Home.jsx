import React, { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";
import { getHomeData } from "../api";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user, login } = useAuth();
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/user`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          login(data.user);
        } else {
          window.location.href = `${import.meta.env.VITE_BASE_URL}/auth/login`;
        }
      } catch (err) {
        console.error("failed to fetch user:", err);
        window.location.href = `${import.meta.env.VITE_BASE_URL}/auth/login`;
      }
    }

    if (!user) {
      fetchUser();
    }
  }, [user, login, navigate]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getHomeData(user.id);
        setHomeData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen" style={{ fontFamily: "'Circular', sans-serif" }}>
      <header className="m-14 text-center">
        <h1 className="text-8xl font-bold mb-32 mt-56">
          Welcome to Music Re-Wrapped
          <span 
            style={{
              display: 'inline-block',
              width: '0.2em',
              height: '0.2em',
              backgroundColor: '#1DB954',
              borderRadius: '50%',
              marginLeft: '0.2em'
            }}
          ></span>
        </h1>
        <h2 className="text-5xl font-semibold mb-32">Hi there, {user.display_name || user.email}!</h2>
        <h3 className="text-xl mb-16">Scroll down to learn more about your music taste ↓</h3>
      </header>
      <Dashboard data={homeData} userId={user.id} />
    </div>
  );
};

export default Home;