import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ScrollReset from './components/utils/ScrollReset';
import Home from './pages/Home';
import SpotifyLogin from './pages/SpotifyLogin';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import EventsPage from './pages/EventsPage';
import PromoterPanel from './pages/PromoterPanel';
import ReWrapped from './pages/ReWrapped';
import About from './pages/About';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { useAuth } from './hooks/useAuth';
import { UserProvider } from './context/UserContext';

const RootRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    //& delay navigation to allow JWT processing
    const hasTokenParam = window.location.search.includes('token=');
    
    //~ if token in URL, wait briefly fr processing
    if (hasTokenParam) {
      console.log('Token detected in URL, processing authentication');
      //~ short delay to allow token processing
      setTimeout(() => {
        if (user) {
          navigate('/home');
        }
      }, 500);
    } else if (user) {
      navigate('/home');
    } else {
      navigate('/spotify-login');
    }
  }, [user, navigate]);
  
  return null;
};

function App() {
  return (
    <UserProvider>
      <Router>
        <ScrollReset />
        <Navbar />
        <Routes>
          <Route path='/' element={<RootRedirect />} />
          <Route path='/about' element={<About />} />
          <Route path='/spotify-login' element={<SpotifyLogin />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/home' element={<Home />} />
          <Route path="/rewrapped" element={<ReWrapped />} />
          <Route path='/events' element={<EventsPage />} />
          <Route path="/promoter-panel" element={<PromoterPanel />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;