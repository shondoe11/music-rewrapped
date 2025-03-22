import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { getCurrentUser, getUserPreferences, updateUserPreferences, changePassword } from '../api';

const Profile = () => {
  const { user, login } = useAuth();
  //~ profile data state frm backend (spotify-synced data)
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
          username: response.user.username || 'N/A'
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Your Profile</h1>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Info */}
          <div className="w-full md:w-1/3">
            <div className="flex flex-col items-center">
              {profileData.profile_image_url ? (
                <img
                  src={profileData.profile_image_url}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mb-4"
                />
              ) : (
                //& fallback img
                <div className="w-32 h-32 rounded-full bg-gray-500 flex items-center justify-center mb-4">
                  <span className="text-4xl text-green-200">
                    {profileData.display_name ? profileData.display_name.slice(0, 2).toUpperCase() : ''}
                  </span>
                </div>
              )}
            <h2 className="text-2xl font-semibold">{profileData.display_name}</h2>
            </div>
            <div className="mt-4">
              <p>
                <span className="font-bold">Email:</span> {profileData.email}
              </p>
              <p>
                <span className="font-bold">Country:</span> {profileData.country}
              </p>
              <div className="flex items-center mt-2">
                <p>
                  <span className="font-bold">Spotify Followers:</span>{' '}
                  {showFollowers ? profileData.followers : 'Hidden'}
                </p>
                <button
                  onClick={handleToggleFollowers}
                  className="ml-2 text-green-500 hover:text-green-400"
                >
                  {showFollowers ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                These details are synced from your Spotify profile. To update, please change them on Spotify.
              </p>
              <div className="mt-4">
                <p>
                  <span className='font-bold'>Username:</span> <a className='text-green-300'>{profileData.username}</a>
                </p>
                <p className="font-bold ml-9">Interests</p>
                <p>Favorite Artists:
                  <a className='text-green-300'> {prefs.favoriteArtists || 'N/A'}</a>
                </p>
                <p>Favorite Genres: 
                  <a className='text-green-300'> {prefs.favoriteGenres || 'N/A'}</a>
                </p>
                <p>Favorite Venues: 
                  <a className='text-green-300'> {prefs.favoriteVenues || 'N/A'}</a>
                </p>
              </div>
            </div>
          </div>
          {/* Settings */}
          <div className="w-full md:w-2/3 space-y-8">
            {/* Change Password */}
            <div className="bg-gray-800 p-4 rounded shadow">
              <h3 className="text-2xl font-semibold mb-4">Change Password</h3>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                <div className="mb-4">
                  <label className="block mb-1">Current Password</label>
                  <input
                    type="password"
                    {...registerPassword('currentPassword', { required: 'Current password is required' })}
                    className="w-full p-2 rounded border border-gray-700 bg-gray-700 text-green-500 focus:border-green-500 focus:outline-none"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-red-500 text-sm">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block mb-1">New Password</label>
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
                    className="w-full p-2 rounded border border-gray-700 bg-gray-700 text-green-500 focus:border-green-500 focus:outline-none"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-red-500 text-sm">{passwordErrors.newPassword.message}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    {...registerPassword('confirmPassword', {
                      required: 'Please confirm your new password',
                      validate: value =>
                        value === watchPassword('newPassword') || 'Passwords do not match'
                    })}
                    className="w-full p-2 rounded border border-gray-700 bg-gray-700 text-green-500 focus:border-green-500 focus:outline-none"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-sm">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
                <button type="submit" className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded">
                  Change Password
                </button>
              </form>
            </div>
            {/* Interest Preferences */}
            <div className="bg-gray-800 p-4 rounded shadow">
              <h3 className="text-2xl font-semibold mb-4">Interest Preferences</h3>
              <form onSubmit={handlePrefsSubmit(onPrefsSubmit)}>
                <div className="mb-4">
                  <label className="block mb-1">Favorite Artists (comma-separated)</label>
                  <input
                    type="text"
                    {...registerPrefs('favoriteArtists')}
                    className="w-full p-2 rounded border border-gray-700 bg-gray-700 text-green-500 focus:border-green-500 focus:outline-none"
                    placeholder="Artist 1, Artist 2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Favorite Genres (comma-separated)</label>
                  <input
                    type="text"
                    {...registerPrefs('favoriteGenres')}
                    className="w-full p-2 rounded border border-gray-700 bg-gray-700 text-green-500 focus:border-green-500 focus:outline-none"
                    placeholder="Genre 1, Genre 2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Favorite Event Venues (comma-separated)</label>
                  <input
                    type="text"
                    {...registerPrefs('favoriteVenues')}
                    className="w-full p-2 rounded border border-gray-700 bg-gray-700 text-green-500 focus:border-green-500 focus:outline-none"
                    placeholder="Venue 1, Venue 2"
                  />
                </div>
                <button type="submit" className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded">
                  Save Preferences
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;