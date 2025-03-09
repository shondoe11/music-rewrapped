import React from "react";

const TopTracksChart = ({ songs }) => {
    if (!songs || songs.length === 0) {
        return <p>No top tracks available.</p>
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {songs.map((song, index) => (
          <a 
            key={index}
            href={song.spotify_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div
              className="flex items-center p-2 border rounded shadow-sm"
              style={{ backgroundColor: '#FFF9C4' }}
            >
              <span 
                className="mr-4 font-bold text-3xl" 
                style={{ color: '#111827', minWidth: '2em', textAlign: 'center' }}
              >
                {index + 1}
              </span>
              <img
                src={song.artwork_url}
                alt={song.track_name}
                className="w-16 h-16 mr-4 rounded"
              />
              <div>
                <h3 className="font-bold text-xl" style={{ color: '#1DB954' }}>
                  {song.track_name}
                </h3>
                <p className="text-base" style={{ color: '#1DB954' }}>
                  {song.artists.map(artist => artist.name).join(', ')}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    );
};

export default TopTracksChart;