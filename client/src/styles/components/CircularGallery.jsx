import React, { useState, useRef, useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';

const CircularGallery = ({ artists }) => {   
  const [currentIndex, setCurrentIndex] = useState(0);   
  const containerRef = useRef(null);   
  const [isDragging, setIsDragging] = useState(false);   
  const [startX, setStartX] = useState(0);   
  const [_scrollLeft, setScrollLeft] = useState(0);
  const [dragDirection, setDragDirection] = useState(null);
  const [dragDistance, setDragDistance] = useState(0);

  const itemsPerPage = 10;
  const _itemsToShow = Math.min(artists.length, itemsPerPage); 
  
  const totalPages = Math.ceil(artists.length / itemsPerPage);
    
  const handleMouseDown = (e) => {     
    setIsDragging(true);     
    setStartX(e.pageX - containerRef.current.offsetLeft);     
    setScrollLeft(containerRef.current.scrollLeft);
    setDragDistance(0);
    setDragDirection(null);
  };      

  const handleMouseUp = () => {
    if (isDragging) {
      if (Math.abs(dragDistance) > 50) {
        if (dragDirection === 'right' && currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
        } else if (dragDirection === 'left' && currentIndex < totalPages - 1) {
          setCurrentIndex(prev => prev + 1);
        }
      }
      setIsDragging(false);
      setDragDistance(0);
      setDragDirection(null);
    }
  };      

  const handleMouseMove = (e) => {     
    if (!isDragging) return;     
    e.preventDefault();     
    const x = e.pageX - containerRef.current.offsetLeft;     
    const distance = x - startX;
    
    const direction = distance < 0 ? 'left' : 'right';
    setDragDirection(direction);
    setDragDistance(distance);

    containerRef.current.style.transform = `translateX(${distance * 0.1}px)`;
  };      

  const handleArtistClick = (url) => {
    if (Math.abs(dragDistance) < 5) {
      window.open(url, '_blank');
    }
  };    

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    setDragDistance(0);
    setDragDirection(null);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const distance = x - startX;
    
    const direction = distance < 0 ? 'left' : 'right';
    setDragDirection(direction);
    setDragDistance(distance);
    
    containerRef.current.style.transform = `translateX(${distance * 0.1}px)`;
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  useEffect(() => {
    if (!isDragging && containerRef.current) {
      containerRef.current.style.transform = '';
    }
  }, [isDragging]);

  useEffect(() => {     
    const interval = setInterval(() => {       
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPages);     
    }, 8000);          
    
    return () => clearInterval(interval);   
  }, [artists.length, totalPages]);      

  const scrollbarHideStyle = {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };

  return (     
    <div className="mt-4">
      <div className="bg-gray-100/10 backdrop-blur-sm rounded-xl border border-gray-300/20 shadow-lg overflow-hidden">      
        <div className="flex flex-col items-center w-full relative">       
          <div 
            className={`relative w-full py-8 px-4 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none transition-transform duration-300`}
            ref={containerRef}         
            style={{
              ...scrollbarHideStyle,
              minHeight: '320px',
            }}
            onMouseDown={handleMouseDown}         
            onMouseUp={handleMouseUp}         
            onMouseLeave={handleMouseUp}         
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >         
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentIndex}
                className="flex flex-wrap justify-center w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {artists.slice(currentIndex * itemsPerPage, (currentIndex + 1) * itemsPerPage).map((artist, index) => (           
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.03,
                    }}
                    key={currentIndex * itemsPerPage + index}             
                    className="w-1/5 min-w-[130px] px-3 mb-6 text-center relative transition-transform duration-300 ease-in-out"
                    onClick={() => handleArtistClick(artist.spotify_url)}
                  >             
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 text-green-500 absolute -top-1 -left-1 z-10 font-bold text-sm shadow-md">
                      <span>{currentIndex * itemsPerPage + index + 1}</span>
                    </div>  
                    
                    <div className="group">         
                      <div className="relative">
                        <img               
                          src={artist.artist_image_url || artist.image_url}               
                          alt={artist.artist_name}
                          className="w-full h-auto aspect-square rounded-full object-cover cursor-pointer transition-transform duration-300 ease-in-out group-hover:scale-105 shadow-md"
                          onError={(e) => {                     
                            e.target.src = 'https://picsum.photos/seed/'+(currentIndex * itemsPerPage + index)+'/200?grayscale&blur=2';                   
                          }}                 
                        />  
                        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>           
                      </div>
                      <h3 className="mt-3 font-bold text-xl text-slate-800 group-hover:text-green-500 transition-colors duration-300 whitespace-nowrap overflow-hidden text-ellipsis px-1">                  
                        {artist.artist_name}               
                      </h3>
                    </div>
                  </motion.div>           
                ))}
              </motion.div>
            </AnimatePresence>
          </div>              
          
          {totalPages > 1 && (
            <div className="flex justify-center mb-4">         
              {Array.from({ length: totalPages }).map((_, index) => (           
                <button
                  key={index}             
                  className={`w-2.5 h-2.5 rounded-full mx-1 border-0 cursor-pointer transition-colors duration-300 ease-in-out ${currentIndex === index ? 'bg-green-500' : 'bg-gray-800'}`}             
                  onClick={() => setCurrentIndex(index)}             
                  aria-label={`Go to page ${index + 1}`}           
                />         
              ))}       
            </div>
          )}
        </div>     
      </div>
    </div>
  ); 
};  

export default CircularGallery;