import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register as registerUser } from '../api';
import Ballpit from '../styles/backgrounds/Ballpit';

const Register = () => {
  const { register, watch, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  
  //& pw visibility toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  //& consent checkbox state
  const [consentChecked, setConsentChecked] = useState(false);
  
  const onSubmit = async (data) => {
    try {
      const response = await registerUser(data);
      if (response.message) {
        toast.success(response.message);
        navigate('/profile');
      } else {
        toast.success('Registration completed successfully!');
        navigate('/profile');
      }
    } catch (error) {
      console.error('registration error:', error);
      
      //& check fr specific error types
      if (error.response) {
        //~ server responded w error status code
        if (error.response.status === 400) {
          if (error.response.data && error.response.data.error) {
            //~ handle specific 400 err cases
            if (error.response.data.error.includes('Username already exists')) {
              toast.error('This username is already taken. Please choose a different username.');
            } else if (error.response.data.error.includes('Password')) {
              toast.error(error.response.data.error);
            } else if (error.response.data.error.includes('Consent')) {
              toast.error('You must consent to store listening history to continue.');
            } else if (error.response.data.error.includes('already have an account')) {
              toast.error('You already have a Re-Wrapped account linked to this Spotify ID.');
            } else {
              //~ generic 400 error w message
              toast.error(error.response.data.error);
            }
          } else {
            //~ generic 400 error w/o specific msg
            toast.error('Registration failed. Please check your information and try again.');
          }
        } else if (error.response.status === 500) {
          toast.error('Server error occurred. Please try again later.');
        } else {
          //~ other status codes
          toast.error(`Registration error: ${error.response.data?.error || 'Unknown error'}`);
        }
      } else if (error.message) {
        //~ network / other client-side errors
        if (error.message.includes('Network Error')) {
          toast.error('Network error. Please check your internet connection and try again.');
        } else {
          toast.error(`Registration error: ${error.message}`);
        }
      } else {
        //~ fallback fr unexpected err formats
        toast.error('Registration failed. Please try again later.');
      }
    }
  };

  //& pw visibility handlers
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white relative overflow-hidden">
      {/* Ballpit BG */}
      <div className="absolute inset-0 z-0">
        <Ballpit 
          count={555} 
          gravity={0.15} 
          friction={1} 
          wallBounce={0.9} 
          followCursor={true}
          colors={[0x4ADE80, 0x3B82F6, 0xF472B6]}
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
        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Re-Wrapped Registration</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="group">
            <label className="block text-gray-300 mb-2 font-medium">Username</label>
            <input
              type="text"
              {...register("username", { required: "Username is required" })}
              className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800/70 text-green-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all duration-300"
              placeholder="Choose a username"
            />
            {errors.username && <p className="text-red-400 text-sm mt-2 font-medium">{errors.username.message}</p>}
          </div>
          
          <div className="group">
            <label className="block text-gray-300 mb-2 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", { 
                  required: "Password is required", 
                  minLength: { value: 8, message: "Password must be at least 8 characters" },
                  pattern: { 
                    value: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/,
                    message: "Password must contain at least one uppercase letter and one special character"
                  }
                })}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800/70 text-green-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all duration-300 pr-12"
                placeholder="Create a secure password"
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
            {errors.password && <p className="text-red-400 text-sm mt-2 font-medium">{errors.password.message}</p>}
          </div>
          
          <div className="group">
            <label className="block text-gray-300 mb-2 font-medium">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword", { 
                  required: "Please confirm your password", 
                  validate: value => value === watch("password") || "Passwords do not match"
                })}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800/70 text-green-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all duration-300 pr-12"
                placeholder="Confirm your password"
              />
              <button 
                type="button" 
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-500 focus:outline-none transition-colors duration-300"
              >
                {showConfirmPassword ? (
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
            {errors.confirmPassword && <p className="text-red-400 text-sm mt-2 font-medium">{errors.confirmPassword.message}</p>}
          </div>
          
          <div className="group">
            <label className="block text-gray-300 mb-2 font-medium">Role</label>
            <div className="relative">
              <select 
                {...register("role", { required: "Role is required" })} 
                className="w-full p-3 pl-4 pr-10 rounded-lg border border-gray-700 bg-gray-800/70 text-green-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all duration-300 appearance-none"
              >
                <option value="">Select a role</option>
                <option value="regular">Music Fan</option>
                <option value="promoter">Event Promoter</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            {errors.role && <p className="text-red-400 text-sm mt-2 font-medium">{errors.role.message}</p>}
          </div>
          
          <div className="group pt-2">
            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                {...register("store_listening_history", { required: "Consent is required" })}
                className="mt-1 rounded border-gray-700 bg-gray-800 text-green-500 focus:ring-green-500 focus:ring-offset-0 transition-colors cursor-pointer"
                onChange={(e) => setConsentChecked(e.target.checked)}
              />
              <span className={`text-sm ${consentChecked ? 'text-green-500' : 'text-red-400'} transition-colors duration-300 group-hover:text-white`}>
                I permit Re-Wrapped to store my listening history and other Spotify related information.
              </span>
            </label>
            {errors.store_listening_history && (
              <p className="text-red-400 text-sm mt-2 font-medium">{errors.store_listening_history.message}</p>
            )}
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 mt-6 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            Register
          </button>
        </form>
        
        <p className="mt-8 text-center text-gray-400">
          Already have an account? 
          <a href="/login" className="ml-2 text-green-500 hover:text-green-400 transition-colors">
            Login
          </a>
        </p>
        
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-2xl"></div>
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
};

export default Register;