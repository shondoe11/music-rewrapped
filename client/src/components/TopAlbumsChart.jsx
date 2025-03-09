import React from "react";

const TopAlbumsChart = ({ albums }) => {
    if (!albums || albums.length === 0) {
        return <p>No top albums available.</p>
    }

    const top10Albums = albums.slice(0, 10);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {top10Albums.map((album, index) => (
          <a 
            key={index}
            href={album.spotify_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div
              className="flex items-center p-2 border rounded shadow-sm"
              style={{ backgroundColor: '#E3F2FD' }}
            >
              <span 
                className="mr-4 font-bold text-3xl" 
                style={{ color: '#111827', minWidth: '2em', textAlign: 'center' }}
              >
                {index + 1}
              </span>
              <img
                src={album.album_image_url}
                alt={album.album_name}
                className="w-16 h-16 mr-4 rounded"
              />
              <div>
                <h3 className="font-bold text-xl" style={{ color: '#1DB954' }}>
                  {album.album_name}
                </h3>
                <p className="text-base" style={{ color: '#1DB954' }}>
                  {album.album_artists}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    );
};

export default TopAlbumsChart;