import React, { useState, useEffect, useRef } from "react"; 
import CircularGallery from "../styles/components/CircularGallery";  

const TopArtistsChart = ({ artists }) => {   
  const [isVisible, setIsVisible] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const containerRef = useRef(null);
  const artistsRef = useRef(null);
  
  //& check if artists data valid & ready to use
  useEffect(() => {
    if (artists && Array.isArray(artists) && artists.length > 0) {
      artistsRef.current = artists;
      setIsDataReady(true);
    } else {
      setIsDataReady(false);
    }
  }, [artists]);
  
  //& handle visibility detection w intersection observer (maintain observer & update visibility both ways)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        //~ update isVisible based on current intersection state
        setIsVisible(entries[0].isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    //& capture current ref value to avoid stale refs in cleanup
    const currentRef = containerRef.current;
    
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    //~ clean up observer on component unmount
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  //? debug - log when component renders w no artists
  useEffect(() => {
    if (!artists || !Array.isArray(artists)) {
      console.log('TopArtistsChart: artists prop is not an array', artists);
    } else if (artists.length === 0) {
      console.log('TopArtistsChart: artists array is empty');
    }
  }, [artists]);

  //& handle loading state w placeholder
  if (!isDataReady) {     
    return (
      <div className="top-artists-container" ref={containerRef} style={{ minHeight: "320px" }}>
        <div className="flex justify-center items-center h-full">
          <div className="text-gray-400 text-center">
            <div className="animate-pulse mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6a2 2 0 00-2-2H5a2 2 0 00-2 2v13a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p>Loading top artists data...</p>
          </div>
        </div>
      </div>
    );   
  }    

  //& ensure artists have properties expected by CircularGallery
  const formattedArtists = artists.map(artist => ({
    artist_name: artist.artist_name,
    artist_image_url: artist.artist_image_url,
    spotify_url: artist.spotify_url,
    genres: artist.genres || []
  }));

  return (     
    <div 
      className="top-artists-container" 
      ref={containerRef} 
      style={{ 
        minHeight: "320px" //~ ensure container has height even when content fade in
      }}
    >          
      <div 
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease'
        }}
      >
        <CircularGallery artists={formattedArtists} />
      </div>    
    </div>   
  ); 
};  

export default TopArtistsChart;