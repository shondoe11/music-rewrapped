import React, { useEffect, useMemo } from "react";
import Dashboard from "../components/Dashboard";
import { getCurrentUser } from "../api";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Iridescence from "../styles/backgrounds/Iridescence";
import BlurText from "../styles/text-animations/BlurText";
import SplitText from "../styles/text-animations/SplitText";

const Home = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const greetingText = useMemo(() => {
  if (!user) return "Hi there!";
  return `Hi there, ${user.display_name || user.email}!`;
  }, [user]);
  
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await getCurrentUser();
        login(response.user);
      } catch (err) {
        console.error("failed to fetch user:", err);
        toast.error("Authenticate with Spotify first to view 'Home'");
        navigate('/spotify-login');
      }
    }
    if (!user) {
      fetchUser();
    }
  }, [user, login, navigate]);

  if (!user) return <p>Loading...</p>;


  return (
    <div className="relative w-full min-h-screen overflow-hidden" style={{ fontFamily: "'Circular', sans-serif" }}>
      <div className="fixed inset-0 w-full h-full z-0" style={{ zIndex: -1 }}>
        <Iridescence 
          color={[1, 1, 1]}
          mouseReact={true} 
          amplitude={0.1} 
          speed={0.7}
        />
      </div>
      <div className="relative z-10 text-slate-800 p-8">
        <header className="m-14 text-center">
          <div className="flex flex-col items-center mb-36 mt-44">
            <BlurText
              text="Welcome to Music Re-Wrapped"
              delay={50}
              animateBy="letters"
              direction="top"
              className="text-7xl font-bold"
              suffix={
                <span className="inline-flex items-center justify-center relative">
                  <div className="w-10 h-10 bg-green-500 rounded-full absolute opacity-20 animate-ping"></div>
                  <div className="w-4 h-4 bg-green-500 rounded-full relative"></div>
                </span>
              }
              suffixDelay={300}
            />
          </div>
          <SplitText
          text={greetingText}
          className="text-5xl font-semibold"
          delay={200}
          animationFrom={{ opacity: 0, transform: 'translate3d(0,30px,0)' }}
          animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
          easing="easeOutCubic"
          threshold={0.1}
          textAlign="center"
          />
          <div className="flex flex-col items-center mt-36 mb-52">
            <BlurText
              text="Scroll down to learn more about your music taste"
              delay={30}
              animateBy="words"
              direction="top"
              className="text-xl mb-4"
              threshold={0.05}
            />
            <BlurText
              text=""
              delay={0}
              threshold={0.05}
              direction="top"
              suffix={
                <div className="w-6 h-10 border-2 border-slate-800 rounded-full flex justify-center p-1">
                  <div className="w-1 h-3 bg-green-400 rounded-full animate-bounce"></div>
                </div>
              }
              suffixDelay={2000}
            />
          </div>
        </header>
        <Dashboard userId={user.id} />
      </div>
    </div>
  );
};

export default Home;