import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import Home from './pages/Home';
import SpotifyLogin from './pages/SpotifyLogin';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Events from './pages/Events';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Navigate to='/spotify-login' />} />
        <Route path='/spotify-login' element={<SpotifyLogin />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/home' element={<Home />} />
        <Route path='/events' element={<Events />} />
        <Route path='/profile' element={<Profile />} />
      </Routes>
    </Router>
  )
}

export default App;