import React, { useEffect } from 'react';
import {BrowserRouter as Router, Routes, Route, useNavigate} from 'react-router-dom'
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
import { useAuth } from './hooks/useAuth';

const RootRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/spotify-login');
    }
  }, [user, navigate]);
  
  return null;
};

function App() {
  return (
    <Router>
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
      </Routes>
    </Router>
  )
}

export default App;