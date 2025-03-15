import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Register = () => {
  const { register, watch, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  
  const onSubmit = (data) => {
    axios.post(`${import.meta.env.VITE_BASE_URL}/auth/rewrapped/register`, data, { withCredentials: true })
      .then(res => {
        if (res.data.message) {
          toast.success(res.data.message);
          navigate('/profile');
        } else {
          toast.info('Registration completed');
        }
      })
      .catch(err => {
        console.error('registration error:', err.response.data);
        toast.error(err.response.data.error || 'Registration error occurred');
      });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Re-Wrapped Registration</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm">
        <div className="mb-4">
          <label className="block text-white mb-2">Username</label>
          <input
            type="text"
            {...register("username", { required: "Username is required" })}
            className="w-full p-2 rounded border border-gray-700 text-black"
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2">Password</label>
          <input
            type="password"
            {...register("password", { 
              required: "Password is required", 
              minLength: { value: 8, message: "Password must be at least 8 characters" },
              pattern: { 
                value: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/,
                message: "Password must contain at least one uppercase letter and one special character"
              }
            })}
            className="w-full p-2 rounded border border-gray-700 text-black"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2">Confirm Password</label>
          <input
            type="password"
            {...register("confirmPassword", { 
              required: "Please confirm your password", 
              validate: value => value === watch("password") || "Passwords do not match"
            })}
            className="w-full p-2 rounded border border-gray-700 text-black"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2">Role</label>
          <select {...register("role", { required: "Role is required" })} className="w-full p-2 rounded border border-gray-700 text-black">
            <option value="">Select a role</option>
            <option value="regular">Music Fan</option>
            <option value="promoter">Event Promoter</option>
          </select>
          {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
        </div>
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              {...register("store_listening_history", { required: "Consent is required" })}
              className="form-checkbox"
            />
            <span className="ml-2">I permit Re-Wrapped to store my listening history and other Spotify related information.</span>
          </label>
          {errors.store_listening_history && <p className="text-red-500 text-sm">{errors.store_listening_history.message}</p>}
        </div>
        <button type="submit" className="w-full py-2 bg-green-500 hover:bg-green-600 rounded">
          Register
        </button>
      </form>
      <p className="mt-4">
        Already have an account? <a href="/login" className="text-green-500">Login</a>
      </p>
    </div>
  );
};

export default Register;