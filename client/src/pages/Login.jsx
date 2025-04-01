import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { login } from '../api';
import Ballpit from '../styles/backgrounds/Ballpit';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role !== 'guest') {
        toast.info("You are already logged in / You already have an account tied to this Spotify id!");
        navigate('/profile');
      } else {
        toast.info("Please register to upgrade your account.");
        navigate('/register');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(username, password);

      if (response.message) {
        toast.success(response.message);
        navigate('/profile');
      } else {
        toast.success('Login successful');
        navigate('/profile');
      }
    } catch (error) {
      console.error('login error:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Invalid username or password. Please try again.');
        } else if (error.response.status === 404) {
          toast.error('User not found. Please check your username.');
        } else if (error.response.data && error.response.data.error) {
          toast.error(error.response.data.error);
        } else {
          toast.error('Login failed. Please try again later.');
        }
      } else if (error.message) {
        toast.error(`Authentication error: ${error.message}`);
      } else {
        toast.error('Login error occurred. Please try again.');
      }
    }
  };

  //& toggle pw visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white relative overflow-hidden">
      {/* Ballpit BG */}
      <div className="absolute inset-0 z-0">
        <Ballpit 
          count={555} 
          gravity={0.15} 
          friction={1} 
          wallBounce={0.9} 
          followCursor={false}
          colors={[0x1DB954, 0x121212, 0xffffff]}
          ambientColor={2021216}
          ambientIntensity={5}
          lightIntensity={300}
          maxSize={0.8}
          minSize={0.3}
        />
      </div>
      
      {/* Content Layer */}
      <div 
        className="relative z-10 backdrop-blur-sm bg-gray-900/50 p-8 rounded-xl border border-gray-700/50 shadow-xl max-w-md w-full transform transition-all duration-500 hover:shadow-green-500/20"
        style={{
          backdropFilter: 'blur(16px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Re-Wrapped Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block text-gray-300 mb-2 font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800/70 text-green-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all duration-300"
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="group">
            <label className="block text-gray-300 mb-2 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800/70 text-green-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all duration-300 pr-12"
                placeholder="Enter your password"
                required
              />
              <button 
                type="button" 
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-500 focus:outline-none transition-colors duration-300"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            Login
          </button>
        </form>
        
        <p className="mt-8 text-center text-gray-400">
          Don't have an account? 
          <a href="/register" className="ml-2 text-green-500 hover:text-green-400 transition-colors">
            Register
          </a>
        </p>
        
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-2xl"></div>
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
};

export default Login;