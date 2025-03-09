import React from "react";

const TopArtistsChart = ({ artists }) => {
    if (!artists || artists.length === 0) {
        return <p>No top artists available.</p>
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artists.map((artist, index) => (
          <div 
            key={index} 
            className="flex items-center p-4 border rounded shadow-sm"
            style={{ backgroundColor: '#FFEBEE' }}
          >
            <span 
              className="mr-4 font-bold text-3xl" 
              style={{ color: '#111827', minWidth: '2em', textAlign: 'center' }}
            >
              {index + 1}
            </span>
            <a 
              href={artist.spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <img 
                src={artist.artist_image_url} 
                alt={artist.artist_name} 
                className="w-16 h-16 rounded-full mr-4"
              />
              <div className="text-lg font-semibold" style={{ color: '#1DB954' }}>
                {artist.artist_name}
              </div>
            </a>
          </div>
        ))}
      </div>
    );
};

export default TopArtistsChart;