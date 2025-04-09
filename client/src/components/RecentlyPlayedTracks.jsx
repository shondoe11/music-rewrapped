import React from "react";
import AnimatedList from "../styles/components/AnimatedList";

const RecentlyPlayedTracks = ({ tracks }) => {
  if (!tracks || tracks.length === 0) {
    return <p>No recently played tracks available.</p>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins}m ago`; //~ shorter format fr mobile
    } else if (diffHours < 24) {
      return `${diffHours}h ago`; //~ shorter format fr mobile
    } else if (diffDays < 7) {
      return `${diffDays}d ago`; //~ shorter format fr mobile
    } else {
      //~ shorter date format fr older plays
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const handleTrackSelect = (track) => {
    if (track.spotify_url) {
      window.open(track.spotify_url, "_blank", "noopener,noreferrer");
    }
  };

  const renderTrackItem = (track, index, isSelected) => (
    <div
      className={`flex items-center p-3 rounded-lg transition-all duration-300 h-full ${
        isSelected 
          ? 'bg-gray-900/80 backdrop-blur-sm border border-green-500/30 shadow-lg shadow-green-500/10 scale-[1.02]' 
          : 'hover:bg-gray-900/60 hover:backdrop-blur-sm hover:shadow-md border border-transparent'
      }`}
    >
      <span
        className={`mr-3 md:mr-8 font-medium text-sm md:text-base min-w-[3.5em] md:min-w-[4.5em] text-center transition-colors duration-300 ${
          isSelected ? 'text-green-400' : 'text-gray-500'
        }`}
      >
        {formatDate(track.played_at)}
      </span>
      
      <img
        src={track.artwork_url}
        alt={track.track_name}
        className={`w-12 h-12 md:w-16 md:h-16 rounded md:rounded-md mr-3 md:mr-20 transition-all duration-300 object-cover ${
          isSelected ? 'shadow-md shadow-green-500/20 scale-[1.05]' : 'hover:scale-[1.05]'
        }`}
      />
      
      <div className="flex-1 min-w-0 mr-3 md:mr-6">
        {/* Mobile */}
        <div className="block md:hidden">
          <h3 className={`font-bold text-lg truncate transition-colors duration-300 ${
            isSelected ? 'text-green-400' : 'text-slate-800'
          }`}>
            {track.track_name}
          </h3>
          <p className={`text-sm truncate transition-colors duration-300 ${
            isSelected ? 'text-gray-300' : 'text-slate-500'
          }`}>
            {track.artists ? track.artists.map(artist => artist.name).join(', ') : ''}
          </p>
        </div>
        
        {/* Desktop */}
        <div className="hidden md:flex items-center space-x-8 w-full">
          <div className="w-1/2">
            <h3 className={`font-bold text-xl truncate transition-colors duration-300 ${
              isSelected ? 'text-green-400' : 'text-slate-800'
            }`}>
              {track.track_name}
            </h3>
          </div>
          <div className="w-1/2">
            <p className={`text-base truncate transition-colors duration-300 ${
              isSelected ? 'text-gray-300' : 'text-slate-500'
            }`}>
              {track.artists ? track.artists.map(artist => artist.name).join(', ') : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0">
        <button 
          className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full transition-all duration-300 ${
            isSelected 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-800 hover:bg-green-500 hover:text-white'
          }`}
          aria-label="Play track"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="mt-4">
      <div className="bg-gray-100/10 backdrop-blur-sm rounded-xl border border-gray-300/20 shadow-lg overflow-hidden">
        <AnimatedList
          items={tracks}
          renderItem={renderTrackItem}
          onItemSelect={handleTrackSelect}
          showGradients={false}
          enableArrowNavigation={true}
          displayScrollbar={true}
          className="w-full"
          itemDelay={0.01}
          initialScale={0.98}
          animationDuration={0.15}
          triggerOnce={true}
        />
      </div>
    </div>
  );
};

export default RecentlyPlayedTracks;