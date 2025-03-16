import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { login } from '../api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
        toast.info('Login successful');
      }
    } catch (error) {
      console.error('login error:', error);
      toast.error(error || 'Login error occurred');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Rewrapped Login</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="mb-4">
          <label className="block text-white mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 rounded border border-gray-700 text-black"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded border border-gray-700 text-black"
            required
          />
        </div>
        <button type="submit" className="w-full py-2 bg-green-500 hover:bg-green-600 rounded">
          Login
        </button>
      </form>
      <p className="mt-4">
        Don't have an account? <a href="/register" className="text-green-500">Register</a>
      </p>
    </div>
  );
};

export default Login;