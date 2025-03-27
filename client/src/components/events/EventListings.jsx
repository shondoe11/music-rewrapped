import React from 'react';
import { motion } from 'framer-motion';
import EventCard from './EventCard';
import Loader from '../../styles/Loader';
import { formatExternalEventDateTime } from '../../utils/eventUtils';

const EventListings = ({ 
    events, 
    loading, 
    handleSaveEvent, 
    country, 
    currentPage,
    setCurrentPage,
    totalPages,
    setInputCode,
    setCountry
    }) => {
    //& animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    //& paged event list based on current pg
    const paginatedEvents = events.slice(
        (currentPage - 1) * 6, //~ 6 items per pg
        currentPage * 6
    );

    if (loading) {
        return (
        <div className="flex justify-center items-center h-64">
            <Loader />
        </div>
        );
    }

    return (
        <section className="mb-16">
        <motion.div 
            className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
        >
            <div className="group relative">
            <h2 className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Event Listings
            </h2>
            <div className="absolute left-0 -bottom-1 h-1 bg-gradient-to-r from-blue-400 to-purple-500 w-0 group-hover:w-full transition-all duration-500 rounded-full"></div>
            </div>
            <div className="flex items-center text-gray-400 text-sm">
            <span className="mr-2">Showing events in</span>
            <span className="font-bold text-white bg-gradient-to-r from-blue-400 to-purple-500 rounded px-2 py-1">{country}</span>
            </div>
        </motion.div>
        
        <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {paginatedEvents.length > 0 ? (
            paginatedEvents.map(event => (
                <motion.div 
                key={`external-${event.id || event.name}`} 
                variants={cardVariants}
                >
                <EventCard
                    event={event}
                    cardType="external"
                    onSave={handleSaveEvent}
                    formatDateTime={formatExternalEventDateTime}
                />
                </motion.div>
            ))
            ) : (
            <div className="col-span-3 rounded-xl bg-gray-800/40 backdrop-blur-sm p-8 border border-gray-700/50 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xl text-gray-300 mb-2">No events found</p>
                <p className="text-gray-400 mb-4">Try searching for events in a different country</p>
                <div className="flex justify-center">
                <button 
                    onClick={() => {
                    setInputCode('US');
                    setCountry('US');
                    }}
                    className="mx-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-gray-300 transition-colors"
                >
                    US
                </button>
                <button 
                    onClick={() => {
                    setInputCode('GB');
                    setCountry('GB');
                    }}
                    className="mx-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-gray-300 transition-colors"
                >
                    GB
                </button>
                <button 
                    onClick={() => {
                    setInputCode('CA');
                    setCountry('CA');
                    }}
                    className="mx-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-gray-300 transition-colors"
                >
                    CA
                </button>
                </div>
            </div>
            )}
        </motion.div>
        
        {/* Pagination */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
            <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                currentPage === 1 
                    ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-800/80 hover:bg-gray-700 text-white'
                }`}
                disabled={currentPage === 1}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
                <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    currentPage === index + 1
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold'
                    : 'bg-gray-800/80 hover:bg-gray-700 text-white'
                }`}
                >
                {index + 1}
                </button>
            ))}
            
            <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                currentPage === totalPages 
                    ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-800/80 hover:bg-gray-700 text-white'
                }`}
                disabled={currentPage === totalPages}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
            </div>
        )}
        </section>
    );
};

export default EventListings;