import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('regular');
  const [storeHistory, setStoreHistory] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/rewrapped/register`,
        {
          username,
          password,
          role,
          store_listening_history: storeHistory
        },
        { withCredentials: true } //~ check sesh cookies sent
      );
      if (response.data.message) {
        toast.success(response.data.message);
        navigate('/profile');
      } else {
        toast.info('Registration completed');
      }
    } catch (error) {
      console.error('registration error:', error.response.data);
      toast.error(error.response.data.error || 'Registration error occurred');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Re-Wrapped Registration</h1>
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
        <div className="mb-4">
          <label className="block text-white mb-2">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 rounded border border-gray-700 text-black"
          >
            <option value="regular">Music Fan</option>
            <option value="promoter">Event Promoter</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={storeHistory}
              onChange={(e) => setStoreHistory(e.target.checked)}
              className="form-checkbox"
              required
            />
            <span className="ml-2">I permit Re-Wrapped to store my listening history and other Spotify related information.</span>
          </label>
        </div>
        <button type="submit" className="w-full py-2 bg-green-500 hover:bg-green-600 rounded">
          Register
        </button>
      </form>
      <p className="mt-4">
        Don't have an account? <a href="/register" className="text-green-500">Register</a>
      </p>
    </div>
  );
};

export default Register;