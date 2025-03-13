import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { user, login } = useAuth();

  //& profile data state frm backend (spotify-synced data)
  const [profileData, setProfileData] = useState({
    profile_image_url: '',
    display_name: '',
    email: '',
    country: '',
    followers: '',
    username: '' //~ re-wrapped username (immutable)
  });

  //& state to toggle showing/hiding spotify followers
  const [showFollowers, setShowFollowers] = useState(true);

  //& state for password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  //& state for interest preferences
  const [preferences, setPreferences] = useState({
    favoriteArtists: '',
    favoriteGenres: '',
    favoriteVenues: ''
  });

  //& fetch updated user profile data from backend
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/auth/user`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          login(data.user);
          setProfileData({
            profile_image_url: data.user.profile_image_url || '',
            display_name: data.user.display_name || 'N/A',
            email: data.user.email || 'N/A',
            country: data.user.country || 'N/A',
            followers: data.user.followers || 'N/A',
            username: data.user.username || 'N/A'
          });
        }
      })
      .catch(err => {
        console.error('Failed to fetch profile data:', err);
        toast.error('Failed to load profile data');
      });
  }, []);

  //& handler: followers visibility toggle
  const handleToggleFollowers = () => {
    setShowFollowers(!showFollowers);
  };

  //& pw input change handler
  const handlePasswordInputChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  //& pw submission change handler
  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    //& post password change data to backend endpoint
    fetch(`${import.meta.env.VITE_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        user_id: user.id,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          toast.success(data.message);
          setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        } else {
          toast.error(data.error || 'Failed to change password');
        }
      })
      .catch(err => {
        console.error('Password change error:', err);
        toast.error('Failed to change password');
      });
  };

  //& Interest preference change input handler
  const handlePreferenceChange = (e) => {
    setPreferences({ ...preferences, [e.target.name]: e.target.value });
  };

  //& save interests handler
  const handleSavePreferences = (e) => {
    e.preventDefault();
    //& post preferences to backend endpoint
    fetch(`${import.meta.env.VITE_BASE_URL}/user/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        user_id: user.id,
        favoriteArtists: preferences.favoriteArtists,
        favoriteGenres: preferences.favoriteGenres,
        favoriteVenues: preferences.favoriteVenues
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          toast.success(data.message);
        } else {
          toast.error(data.error || 'Failed to save preferences');
        }
      })
      .catch(err => {
        console.error('Preferences save error:', err);
        toast.error('Failed to save preferences');
      });
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
              <p className="text-lg">Username: {profileData.username}</p>
            </div>
            <div className="mt-4">
              <p><span className="font-bold">Email:</span> {profileData.email}</p>
              <p><span className="font-bold">Country:</span> {profileData.country}</p>
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
            </div>
          </div>
          {/* Settings */}
          <div className="w-full md:w-2/3 space-y-8">
            {/* Change PW */}
            <div className="bg-gray-800 p-4 rounded shadow">
              <h3 className="text-2xl font-semibold mb-4">Change Password</h3>
              <form onSubmit={handleChangePassword}>
                <div className="mb-4">
                  <label className="block mb-1">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full p-2 rounded border border-gray-700 bg-gray-700 text-green-500 focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full p-2 rounded border border-gray-700 bg-gray-700 text-green-500 focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full p-2 rounded border border-gray-700 bg-gray-700 text-green-500 focus:border-green-500 focus:outline-none"
                  />
                </div>
                <button type="submit" className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded">
                  Change Password
                </button>
              </form>
            </div>
            {/* Interest Preferences */}
            <div className="bg-gray-800 p-4 rounded shadow">
              <h3 className="text-2xl font-semibold mb-4">Interest Preferences</h3>
              <form onSubmit={handleSavePreferences}>
                <div className="mb-4">
                  <label className="block mb-1">Favorite Artists (comma-separated)</label>
                  <input
                    type="text"
                    name="favoriteArtists"
                    value={preferences.favoriteArtists}
                    onChange={handlePreferenceChange}
                    className="w-full p-2 rounded border border-gray-700 bg-gray-700 text-green-500 focus:border-green-500 focus:outline-none"
                    placeholder="Artist 1, Artist 2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Favorite Genres (comma-separated)</label>
                  <input
                    type="text"
                    name="favoriteGenres"
                    value={preferences.favoriteGenres}
                    onChange={handlePreferenceChange}
                    className="w-full p-2 rounded border border-gray-700 bg-gray-700 text-green-500 focus:border-green-500 focus:outline-none"
                    placeholder="Genre 1, Genre 2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Favorite Event Venues (comma-separated)</label>
                  <input
                    type="text"
                    name="favoriteVenues"
                    value={preferences.favoriteVenues}
                    onChange={handlePreferenceChange}
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