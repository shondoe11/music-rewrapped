import React, { useEffect, useState, useRef } from 'react';
import RecentlyPlayedTracks from './RecentlyPlayedTracks';
import TopTracksChart from './TopTracksChart';
import TopAlbumsChart from './TopAlbumsChart';
import FavoriteGenresEvolution from './FavoriteGenresEvolution';
import TopArtistsChart from './TopArtistsChart';
import { getSpotifyTopTracks, getSpotifyTopAlbums, getSpotifyTopArtists, getRecentlyPlayedTracks } from '../api';
import { toast } from 'react-toastify';

const TimeRangeSelector = ({ selectedValue, onChange, className = '' }) => {
  const timeRanges = [
    { label: 'All Time', value: 'long_term' },
    { label: 'Last 6 Months', value: 'medium_term' },
    { label: 'Last 4 Weeks', value: 'short_term' }
  ];

  return (
    <div className={`flex w-full md:w-auto rounded-lg bg-gray-100/10 backdrop-blur-sm border border-gray-300/20 overflow-hidden ${className}`}>
      {timeRanges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange({ target: { value: range.value } })}
          className={`flex-1 md:flex-none px-3 py-2 text-sm md:text-base transition-all duration-300 ${
            selectedValue === range.value
              ? 'bg-gray-800/60 text-green-500 font-semibold' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};

const RefreshButton = ({ onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`p-3 bg-gray-100/10 backdrop-blur-sm hover:bg-gray-800/50 text-gray-400 hover:text-green-500 rounded-lg flex items-center justify-center transition-all duration-300 border border-gray-300/20 ${className}`}
    aria-label="Refresh recently played tracks"
    title="Refresh recently played tracks"
  >
    <div className="flex items-center justify-center w-full">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span className="ml-2 md:hidden">Refresh</span>
    </div>
  </button>
);

const Dashboard = ({ userId }) => {
  //& time frame states
  const [tracksTimeFrame, setTracksTimeFrame] = useState('long_term');
  const [albumsTimeFrame, setAlbumsTimeFrame] = useState('long_term');
  const [artistsTimeFrame, setArtistsTimeFrame] = useState('long_term');
  
  //& data states
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [topAlbums, setTopAlbums] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  
  //& refs to track initial load state fr each section
  const isInitialRecentlyPlayedLoad = useRef(true);
  const isInitialTracksLoad = useRef(true);
  const isInitialAlbumsLoad = useRef(true);
  const isInitialArtistsLoad = useRef(true);

  const timeFrames = [
    { label: 'Last 4 Weeks', value: 'short_term' },
    { label: 'Last 6 Months', value: 'medium_term' },
    { label: 'All Time', value: 'long_term' },
  ];

  //& handle time frame changes w user interaction flags
  const handleTracksTimeFrameChange = (e) => {
    isInitialTracksLoad.current = false; //~ user interact, not initial load
    setTracksTimeFrame(e.target.value);
  };

  const handleAlbumsTimeFrameChange = (e) => {
    isInitialAlbumsLoad.current = false;
    setAlbumsTimeFrame(e.target.value);
  };

  const handleArtistsTimeFrameChange = (e) => {
    isInitialArtistsLoad.current = false;
    setArtistsTimeFrame(e.target.value);
  };

  const fetchRecentlyPlayed = async () => {
    try {
      const result = await getRecentlyPlayedTracks(userId, 50);
      setRecentlyPlayed(result.tracks);
      
      if (!isInitialRecentlyPlayedLoad.current) {
        toast.success('Your Recently Played Tracks have been refreshed.');
      } else {
        isInitialRecentlyPlayedLoad.current = false;
      }
    } catch (err) {
      console.error('failed to fetch recently played tracks:', err);
      
      if (!isInitialRecentlyPlayedLoad.current) {
        toast.error('Error refreshing Your Recently Played Tracks.');
      }
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRecentlyPlayed();
    }
  }, [userId]);

  const handleRefreshRecentlyPlayed = () => {
    isInitialRecentlyPlayedLoad.current = false;
    fetchRecentlyPlayed();
  };

  useEffect(() => {
    async function fetchTopTracks() {
      try {
        const result = await getSpotifyTopTracks(userId, tracksTimeFrame, 50);
        setTopTracks(result.tracks);
        
        //& only show toast if not initial load
        if (!isInitialTracksLoad.current) {
          const selectedFrame = timeFrames.find(tf => tf.value === tracksTimeFrame);
          toast.success(`Your Top Tracks data switched to ${selectedFrame.label} successfully.`);
        } else {
          isInitialTracksLoad.current = false;
        }
      } catch (err) {
        console.error('failed to fetch top tracks:', err);
        
        //& only show error toast if not initial load
        if (!isInitialTracksLoad.current) {
          const selectedFrame = timeFrames.find(tf => tf.value === tracksTimeFrame);
          toast.error(`Error switching Your Top Tracks data to ${selectedFrame.label}.`);
        }
      }
    }
    
    if (userId) {
      fetchTopTracks();
    }
  }, [userId, tracksTimeFrame]);

  useEffect(() => {
    async function fetchTopAlbums() {
      try {
        const result = await getSpotifyTopAlbums(userId, albumsTimeFrame, 50);
        setTopAlbums(result.albums);
        
        if (!isInitialAlbumsLoad.current) {
          const selectedFrame = timeFrames.find(tf => tf.value === albumsTimeFrame);
          toast.success(`Your Top Albums data switched to ${selectedFrame.label} successfully.`);
        } else {
          isInitialAlbumsLoad.current = false;
        }
      } catch (err) {
        console.error('failed to fetch top albums:', err);
        
        if (!isInitialAlbumsLoad.current) {
          const selectedFrame = timeFrames.find(tf => tf.value === albumsTimeFrame);
          toast.error(`Error switching Your Top Albums data to ${selectedFrame.label}.`);
        }
      }
    }
    
    if (userId) {
      fetchTopAlbums();
    }
  }, [userId, albumsTimeFrame]);

  useEffect(() => {
  async function fetchTopArtists() {
    try {
      const result = await getSpotifyTopArtists(userId, artistsTimeFrame, 50);
      setTopArtists(result.artists);
      
      if (!isInitialArtistsLoad.current) {
        const selectedFrame = timeFrames.find(tf => tf.value === artistsTimeFrame);
        toast.success(`Your Top Artists data switched to ${selectedFrame.label} successfully.`);
      } else {
        isInitialArtistsLoad.current = false;
      }
    } catch (err) {
      console.error('failed to fetch top artists:', err);
      
      if (!isInitialArtistsLoad.current) {
        const selectedFrame = timeFrames.find(tf => tf.value === artistsTimeFrame);
        toast.error(`Error switching Your Top Artists data to ${selectedFrame.label}.`);
      }
    }
  }
  
  if (userId) {
    fetchTopArtists();
  }
}, [userId, artistsTimeFrame]);

  return (
    <div className="container mx-auto p-4">

      {/* Recently Played */}
      <section className="mt-32 mb-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="group relative inline-block">
            <h2 className="text-3xl md:text-4xl font-semibold">Recently Played</h2>
            <span className="absolute left-0 -bottom-1 block h-0.5 bg-green-500 w-0 group-hover:w-full transition-all duration-300"></span>
          </div>
          <div className="w-full md:w-auto">
            <RefreshButton onClick={handleRefreshRecentlyPlayed} className="w-full md:w-auto" />
          </div>
        </div>
        <RecentlyPlayedTracks tracks={recentlyPlayed} />
      </section>
      
      {/* Top Tracks */}
      <section className="mb-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="group relative inline-block">
            <h2 className="text-3xl md:text-4xl font-semibold">Your Top Tracks</h2>
            <span className="absolute left-0 -bottom-1 block h-0.5 bg-green-500 w-0 group-hover:w-full transition-all duration-300"></span>
          </div>
          <div className="w-full md:w-auto">
            <TimeRangeSelector 
              selectedValue={tracksTimeFrame} 
              onChange={handleTracksTimeFrameChange}
            />
          </div>
        </div>
        <TopTracksChart songs={topTracks} />
      </section>
      
      {/* Top Albums */}
      <section className="mb-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="group relative inline-block">
            <h2 className="text-3xl md:text-4xl font-semibold">Your Top Albums</h2>
            <span className="absolute left-0 -bottom-1 block h-0.5 bg-green-500 w-0 group-hover:w-full transition-all duration-300"></span>
          </div>
          <div className="w-full md:w-auto">
            <TimeRangeSelector 
              selectedValue={albumsTimeFrame} 
              onChange={handleAlbumsTimeFrameChange}
            />
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Top albums are calculated by grouping your most listened-to tracks by album.
        </p>
        <TopAlbumsChart albums={topAlbums} />
      </section>
      
      {/* Top Artists */}
      <section className="mb-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="group relative inline-block">
            <h2 className="text-3xl md:text-4xl font-semibold">Top Artists</h2>
            <span className="absolute left-0 -bottom-1 block h-0.5 bg-green-500 w-0 group-hover:w-full transition-all duration-300"></span>
          </div>
          <div className="w-full md:w-auto">
            <TimeRangeSelector 
              selectedValue={artistsTimeFrame} 
              onChange={handleArtistsTimeFrameChange}
            />
          </div>
        </div>
        <TopArtistsChart artists={topArtists} />
      </section>

      {/* Favorite Genres Evolution */}
      <section className="mb-8">
        <div className="group relative inline-block">
          <h2 className="text-3xl md:text-4xl font-semibold">Favorite Genres Evolution</h2>
          <span className="absolute left-0 -bottom-1 block h-0.5 bg-green-500 w-0 group-hover:w-full transition-all duration-300"></span>
        </div>
        <FavoriteGenresEvolution userId={userId} />
      </section>
    </div>
  );
};

export default Dashboard;