import React from 'react';
import spotifyLogoBlack from '../../assets/spotify-logo-black.svg';
import spotifyLogoWhite from '../../assets/spotify-logo-white.svg';
import spotifyLogoGreen from '../../assets/spotify-logo.svg';

//& spotify attribution component
const SpotifyAttribution = ({ size = 'md', showText = true, variant = 'auto', className = '' }) => {
  const sizeClass = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8'
  }[size] || 'h-6';
  
  //& determine which logo to use based on variant & background context
  const getLogoSrc = () => {
    //~ fr auto detection, check if in dark mode
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    switch (variant) {
      case 'white':
        return spotifyLogoWhite;
      case 'black':
        return spotifyLogoBlack;
      case 'green':
        return spotifyLogoGreen;
      case 'auto':
      default:
        //~ fr dark backgrounds, use white logo
        //~ fr light backgrounds, use black logo
        return isDarkMode ? spotifyLogoWhite : spotifyLogoBlack;
    }
  };

  return (
    <div className={`spotify-attribution flex items-center ${className}`}>
      {showText && <span className="text-xs text-gray-400 mr-2">Powered by</span>}
      <a 
        href="https://www.spotify.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-block"
        title="Spotify"
      >
        <img 
          src={getLogoSrc()} 
          alt="Spotify" 
          className={sizeClass}
        />
      </a>
    </div>
  );
};

export default SpotifyAttribution;
