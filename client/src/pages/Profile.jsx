import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { getCurrentUser, getUserPreferences, updateUserPreferences, changePassword } from '../api';
import Threads from '../styles/backgrounds/Threads';
import CircularText from '../styles/text-animations/CircularText';

const Profile = () => {
  const { user, login } = useAuth();
  const [profileData, setProfileData] = useState({
    profile_image_url: '',
    display_name: '',
    email: '',
    country: '',
    followers: '',
    username: ''
  });
  const [prefs, setPrefs] = useState({
    favoriteArtists: '',
    favoriteGenres: '',
    favoriteVenues: ''
  });
  const [showFollowers, setShowFollowers] = useState(true);
  //& custom animation ref
  const circleContainerRef = useRef(null);
  //& manual hover state
  const [isCircleHovering, setIsCircleHovering] = useState(false);
  //& react-hook-form fr pw change
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword
  } = useForm();

  //& react-hook-form fr prefs w/ default values
  const {
    register: registerPrefs,
    handleSubmit: handlePrefsSubmit,
    reset: resetPrefs
  } = useForm({ defaultValues: prefs });

  useEffect(() => {
    resetPrefs(prefs);
  }, [prefs, resetPrefs]);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await getCurrentUser();
        if (response.user) {
          login(response.user);
          setProfileData({
            profile_image_url: response.user.profile_image_url || '',
            display_name: response.user.display_name || 'N/A',
            email: response.user.email || 'N/A',
            country: response.user.country || 'N/A',
            followers: response.user.followers || 'N/A',
            username: response.user.username || 'N/A',
            spotify_id: response.user.spotify_id || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
        toast.error('Failed to load profile data');
      }
    }
    fetchUserData();
  }, []);

  useEffect(() => {
    async function fetchPreferences() {
      if (user && user.id) {
        try {
          const response = await getUserPreferences(user.id);
          if (response.preferences) {
            setPrefs(response.preferences);
          }
        } catch (err) {
          console.error('Failed to fetch preferences:', err);
          toast.error('Failed to fetch preferences');
        }
      }
    }
    fetchPreferences();
  }, [user?.id]);

  //& event handlers fr both mouse enter & leave
  const handleCircleMouseEnter = () => {
    setIsCircleHovering(true);
  };

  const handleCircleMouseLeave = () => {
    setIsCircleHovering(false);
  };

  const handleToggleFollowers = () => {
    setShowFollowers(!showFollowers);
  };

  const onPasswordSubmit = async (data) => {
    try {
      const response = await changePassword(user.id, data.currentPassword, data.newPassword);
      if (response.message) {
        toast.success(response.message);
        resetPassword();
      } else {
        toast.error(response.error || 'Failed to change password');
      }
    } catch (err) {
      console.error('Password change error:', err);
      toast.error('Failed to change password');
    }
  };

  const onPrefsSubmit = async (data) => {
    try {
      const response = await updateUserPreferences(user.id, {
        favoriteArtists: data.favoriteArtists,
        favoriteGenres: data.favoriteGenres,
        favoriteVenues: data.favoriteVenues
      });
      
      if (response.message) {
        toast.success(response.message);
        setPrefs({
          favoriteArtists: data.favoriteArtists,
          favoriteGenres: data.favoriteGenres,
          favoriteVenues: data.favoriteVenues
        });
      } else {
        toast.error(response.error || 'Failed to save preferences');
      }
    } catch (err) {
      console.error('Preferences save error:', err);
      toast.error('Failed to save preferences');
    }
  };

  //& circular text based on user role
  const getCircularText = () => {
    if (user && user.role === 'promoter') {
      return 'RE-WRAPPED⋆CERTIFIED⋆PROMOTER⋆';
    }
    return 'RE-WRAPPED⋆CERTIFIED⋆USER⋆';
  };

  //& text color based on user role
  const getCircularTextColor = () => {
    if (user && user.role === 'promoter') {
      return '#f97316'; //~ orange-500
    }
    return '#10b981'; //~ green-500
  };

  //& clickable profile img
  const getSpotifyProfileUrl = () => {
    if (profileData.spotify_id) {
      return `https://open.spotify.com/user/${profileData.spotify_id}`;
    }
    return '#';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 relative">
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full">
          <Threads 
            color={[0.118, 0.843, 0.376]} 
            amplitude={5} 
            distance={0.1}
            enableMouseInteraction={true}
          />
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-5xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">Your Profile</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Info Card */}
          <div className="w-full md:w-1/3 backdrop-blur-sm bg-gray-900/60 p-8 rounded-2xl border border-gray-800 shadow-lg shadow-green-500/10 transition-all duration-300 hover:shadow-green-500/20">
            <div className="flex flex-col items-center">
              {/* Profile Image w Circular Text - combined hover state */}
              <div 
                ref={circleContainerRef}
                className="relative w-[240px] h-[240px] flex items-center justify-center mx-auto mb-6 group"
                onMouseEnter={handleCircleMouseEnter}
                onMouseLeave={handleCircleMouseLeave}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full">
                    <CircularText
                      text={getCircularText()}
                      spinDuration={isCircleHovering ? 2 : 8} //~ faster on hover
                      fontSize="1.5rem"
                      radius={110}
                      textColor={getCircularTextColor()}
                      reverse={false}
                    />
                  </div>
                </div>
                
                <div className="relative z-10 w-40 h-40 flex items-center justify-center">
                  <a 
                    href={getSpotifyProfileUrl()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full h-full block cursor-pointer transition-all duration-300 group-hover:scale-105"
                  >
                    {profileData.profile_image_url ? (
                      <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-700 group-hover:border-green-500 transition-all duration-300 shadow-lg shadow-black/40">
                        <img
                          src={profileData.profile_image_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-700 group-hover:border-green-500 transition-all duration-300 shadow-lg shadow-black/40">
                        <span className="text-5xl font-bold text-green-200">
                          {profileData.display_name ? profileData.display_name.slice(0, 2).toUpperCase() : ''}
                        </span>
                      </div>
                    )}
                  </a>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">{profileData.display_name}</h2>
              
              <div className="mt-2 flex items-center justify-center">
                <span className="text-sm bg-gray-800 rounded-full px-3 py-1 border border-green-500/30">
                  {user?.role === 'promoter' ? 'Promoter' : 'Music Fan'}
                </span>
              </div>
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="flex flex-col space-y-1 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                <div className="flex justify-between">
                  <span className="text-gray-400">Email</span>
                  <span className="text-white font-medium">{profileData.email}</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                <div className="flex justify-between">
                  <span className="text-gray-400">Country</span>
                  <span className="text-white font-medium">{profileData.country}</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                <div className="flex justify-between">
                  <span className="text-gray-400">Spotify Followers</span>
                  <div className="flex items-center">
                    <span className="text-white font-medium">
                      {showFollowers ? profileData.followers : 'Hidden'}
                    </span>
                    <button
                      onClick={handleToggleFollowers}
                      className="ml-2 text-green-500 hover:text-green-400"
                    >
                      {showFollowers ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 italic mt-2">
                These details are synced from your Spotify profile. To update, please change them on Spotify.
              </p>
              
              <div className="mt-6 space-y-3">
                <div className="flex flex-col space-y-1 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                  <span className="text-gray-400">Username</span>
                  <span className="text-white font-semibold">{profileData.username}</span>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Your Interests</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">Favorite Artists</span>
                      <p className="text-white">{prefs.favoriteArtists || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <span className="text-gray-400 text-sm">Favorite Genres</span>
                      <p className="text-white">{prefs.favoriteGenres || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <span className="text-gray-400 text-sm">Favorite Venues</span>
                      <p className="text-white">{prefs.favoriteVenues || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Settings Column */}
          <div className="w-full md:w-2/3 space-y-8">
            {/* Change Password Card */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-700/50 transition-all duration-300 hover:shadow-green-500/5">
              <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">Change Password</h3>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-gray-300">Current Password</label>
                    <input
                      type="password"
                      {...registerPassword('currentPassword', { required: 'Current password is required' })}
                      className="w-full p-3 rounded-xl border border-gray-700 bg-gray-700/80 text-green-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-red-400 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-gray-300">New Password</label>
                    <input
                      type="password"
                      {...registerPassword('newPassword', {
                        required: 'New password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' },
                        pattern: {
                          value: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/,
                          message: "Password must contain at least one uppercase letter and one special character"
                        }
                      })}
                      className="w-full p-3 rounded-xl border border-gray-700 bg-gray-700/80 text-green-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-red-400 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-gray-300">Confirm New Password</label>
                    <input
                      type="password"
                      {...registerPassword('confirmPassword', {
                        required: 'Please confirm your new password',
                        validate: value =>
                          value === watchPassword('newPassword') || 'Passwords do not match'
                      })}
                      className="w-full p-3 rounded-xl border border-gray-700 bg-gray-700/80 text-green-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-400 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Change Password
                </button>
              </form>
            </div>
            
            {/* Interest Preferences Card */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-700/50 transition-all duration-300 hover:shadow-green-500/5">
              <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">Interest Preferences</h3>
              <form onSubmit={handlePrefsSubmit(onPrefsSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-gray-300">Favorite Artists</label>
                    <input
                      type="text"
                      {...registerPrefs('favoriteArtists')}
                      className="w-full p-3 rounded-xl border border-gray-700 bg-gray-700/80 text-green-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      placeholder="Artist 1, Artist 2, Artist 3"
                    />
                    <p className="text-gray-400 text-xs mt-1">Enter artists separated by commas</p>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-gray-300">Favorite Genres</label>
                    <input
                      type="text"
                      {...registerPrefs('favoriteGenres')}
                      className="w-full p-3 rounded-xl border border-gray-700 bg-gray-700/80 text-green-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      placeholder="Rock, Pop, Jazz"
                    />
                    <p className="text-gray-400 text-xs mt-1">Enter genres separated by commas</p>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-gray-300">Favorite Event Venues</label>
                    <input
                      type="text"
                      {...registerPrefs('favoriteVenues')}
                      className="w-full p-3 rounded-xl border border-gray-700 bg-gray-700/80 text-green-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      placeholder="Venue 1, Venue 2, Venue 3"
                    />
                    <p className="text-gray-400 text-xs mt-1">Enter venues separated by commas</p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 112 0v2H9V4z" />
                    </svg>
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>
            
            {/* Integration Card */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-700/50 transition-all duration-300 hover:shadow-green-500/5">
              <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">Spotify Connection</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#1DB954" className="mr-4">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  <div>
                    <h4 className="font-semibold">Spotify Account</h4>
                    <p className="text-gray-400 text-sm">Your account is connected</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                  <span className="text-green-500 text-sm">Connected</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-400">
                <p>Your Spotify account is used to provide personalized music recommendations and analytics.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;