import React, { useEffect, useMemo, useState } from "react";
import Dashboard from "../components/Dashboard";
import { getCurrentUser } from "../api";
import { useAuth } from "../hooks/useAuth";
import useUser from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Iridescence from "../styles/backgrounds/Iridescence";
import BlurText from "../styles/text-animations/BlurText";
import SplitText from "../styles/text-animations/SplitText";

const Home = () => {
  const { user, login } = useAuth();
  const { spotifyUser, spotifyLoading } = useUser();
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const greetingText = useMemo(() => {
    //~ 1st try use Spotify user data frm context
    if (spotifyUser && spotifyUser.display_name) {
      return `Hi there, ${spotifyUser.display_name}!`;
    }
    //~ fall back auth user if avail
    if (user) {
      return `Hi there, ${user.display_name || user.email}!`;
    }
    //~ default greeting
    return "Hi there!";
  }, [user, spotifyUser]);
  
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

  //& handle scroll event show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      //~ show button when user scroll past 500px
      if (window.scrollY > 500) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!user && spotifyLoading) return <p>Loading...</p>;

  return (
    <div className="relative w-full min-h-screen overflow-hidden" style={{ fontFamily: "'Circular', sans-serif" }}>
      <div className="fixed inset-0" 
        style={{ 
          zIndex: -10, 
          pointerEvents: 'auto',
          height: '100vh',
          width: '100vw'
        }}
      >
        <Iridescence 
          color={[1, 1, 1]}
          mouseReact={true} 
          amplitude={0.3}
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
                  <div className="w-1 h-3 bg-green-500 rounded-full animate-bounce"></div>
                </div>
              }
              suffixDelay={2000}
            />
          </div>
        </header>
        <Dashboard userId={user?.id} />
        
        {/* Back to Top */}
        {showScrollTop && (
          <button 
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 bg-gray-100/10 backdrop-blur-sm hover:bg-gray-800/50 text-gray-400 hover:text-green-500 rounded-full flex items-center justify-center transition-all duration-300 border border-gray-300/20 shadow-lg z-50"
            aria-label="Back to top"
            title="Back to top"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;