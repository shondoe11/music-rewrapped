// client/src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import TopTracksChart from './TopTracksChart';
import TopAlbumsChart from './TopAlbumsChart';
import FavoriteGenresEvolution from './FavoriteGenresEvolution';
import TopArtistsChart from './TopArtistsChart';
import { getSpotifyTopTracks, getSpotifyTopAlbums, getSpotifyTopArtists } from '../api';
import { toast } from 'react-toastify';

const Dashboard = ({ data, userId }) => {
  const timeFrames = [
    { label: 'Last 4 Weeks', value: 'short_term' },
    { label: 'Last 6 Months', value: 'medium_term' },
    { label: 'All Time', value: 'long_term' },
  ];

  const [tracksTimeFrame, setTracksTimeFrame] = useState('short_term');
  const [albumsTimeFrame, setAlbumsTimeFrame] = useState('short_term');
  const [artistsTimeFrame, setArtistsTimeFrame] = useState('short_term');
  const [topTracks, setTopTracks] = useState([]);
  const [topAlbums, setTopAlbums] = useState([]);
  const [topArtists, setTopArtists] = useState([]);

  const handleTracksTimeFrameChange = (e) => {
    setTracksTimeFrame(e.target.value);
  };

  const handleAlbumsTimeFrameChange = (e) => {
    setAlbumsTimeFrame(e.target.value);
  };

  const handleArtistsTimeFrameChange = (e) => {
    setArtistsTimeFrame(e.target.value);
  };

  useEffect(() => {
    async function fetchTopTracks() {
      try {
        const result = await getSpotifyTopTracks(userId, tracksTimeFrame);
        setTopTracks(result.tracks);
        const selectedFrame = timeFrames.find(tf => tf.value === tracksTimeFrame);
        toast.success(`Your Top Tracks data switched to ${selectedFrame.label} successfully.`);
      } catch (err) {
        console.error('failed to fetch top tracks:', err);
        const selectedFrame = timeFrames.find(tf => tf.value === tracksTimeFrame);
        toast.error(`Error switching Your Top Tracks data to ${selectedFrame.label}.`);
      }
    }
    if (userId) {
      fetchTopTracks();
    }
  }, [userId, tracksTimeFrame]);

  useEffect(() => {
    async function fetchTopAlbums() {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/spotify/top-albums?user_id=${userId}&time_frame=${albumsTimeFrame}`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch top albums from Spotify');
        }
        const result = await response.json();
        setTopAlbums(result.albums);
        const selectedFrame = timeFrames.find(tf => tf.value === albumsTimeFrame);
        toast.success(`Your Top Albums data switched to ${selectedFrame.label} successfully.`);
      } catch (err) {
        console.error('failed to fetch top albums:', err);
        const selectedFrame = timeFrames.find(tf => tf.value === albumsTimeFrame);
        toast.error(`Error switching Your Top Albums data to ${selectedFrame.label}.`);
      }
    }
    if (userId) {
      fetchTopAlbums();
    }
  }, [userId, albumsTimeFrame]);

  useEffect(() => {
    async function fetchTopArtists() {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/spotify/top-artists?user_id=${userId}&time_frame=${artistsTimeFrame}&limit=12`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch top artists from Spotify');
        }
        const result = await response.json();
        setTopArtists(result.artists);
        const selectedFrame = timeFrames.find(tf => tf.value === artistsTimeFrame);
        toast.success(`Your Top Artists data switched to ${selectedFrame.label} successfully.`);
      } catch (err) {
        console.error('failed to fetch top artists:', err);
        const selectedFrame = timeFrames.find(tf => tf.value === artistsTimeFrame);
        toast.error(`Error switching Your Top Artists data to ${selectedFrame.label}.`);
      }
    }
    if (userId) {
      fetchTopArtists();
    }
  }, [userId, artistsTimeFrame]);

  return (
    <div className="container mx-auto p-4">
      {/* Top Tracks */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="group relative inline-block">
            <h2 className="text-4xl font-semibold">Your Top Tracks</h2>
            <span className="absolute left-0 -bottom-1 block h-0.5 bg-green-500 w-0 group-hover:w-full transition-all duration-300"></span>
          </div>
          <select 
            value={tracksTimeFrame} 
            onChange={handleTracksTimeFrameChange} 
            className="bg-gray-800 text-green-500 font-semibold text-xl p-1 rounded border border-gray-800 focus:border-green-500 focus:outline-none"
          >
            {timeFrames.map((frame) => (
              <option key={frame.value} value={frame.value}>
                {frame.label}
              </option>
            ))}
          </select>
        </div>
        <TopTracksChart songs={topTracks} />
      </section>
      
      {/* Top Albums */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="group relative inline-block">
            <h2 className="text-4xl font-semibold">Your Top Albums</h2>
            <span className="absolute left-0 -bottom-1 block h-0.5 bg-green-500 w-0 group-hover:w-full transition-all duration-300"></span>
          </div>
          <select 
            value={albumsTimeFrame} 
            onChange={handleAlbumsTimeFrameChange} 
            className="bg-gray-800 text-green-500 font-semibold text-xl p-1 rounded border border-gray-800 focus:border-green-500 focus:outline-none"
          >
            {timeFrames.map((frame) => (
              <option key={frame.value} value={frame.value}>
                {frame.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Top albums are calculated by grouping your most listened-to tracks by album.
        </p>
        <TopAlbumsChart albums={topAlbums} />
      </section>
      
      {/* Top Artists Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="group relative inline-block">
            <h2 className="text-4xl font-semibold">Top Artists</h2>
            <span className="absolute left-0 -bottom-1 block h-0.5 bg-green-500 w-0 group-hover:w-full transition-all duration-300"></span>
          </div>
          <select 
            value={artistsTimeFrame} 
            onChange={handleArtistsTimeFrameChange} 
            className="bg-gray-800 text-green-500 font-semibold text-xl p-1 rounded border border-gray-800 focus:border-green-500 focus:outline-none"
          >
            {timeFrames.map((frame) => (
              <option key={frame.value} value={frame.value}>
                {frame.label}
              </option>
            ))}
          </select>
        </div>
        <TopArtistsChart artists={topArtists} />
      </section>

      {/* Favorite Genres Evolution */}
      <section className="mb-8">
        <FavoriteGenresEvolution userId={userId} />
      </section>
    </div>
  );
};

export default Dashboard;
