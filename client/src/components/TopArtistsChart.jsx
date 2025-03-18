import React from "react"; 
import CircularGallery from "../styles/components/CircularGallery";  

const TopArtistsChart = ({ artists }) => {   
  if (!artists || artists.length === 0) {     
    return <div className="no-artists">No top artists available.</div>;   
  }    
  
  return (     
    <div className="top-artists-container">          
      <CircularGallery artists={artists} />     
    </div>   
  ); 
};  

export default TopArtistsChart;