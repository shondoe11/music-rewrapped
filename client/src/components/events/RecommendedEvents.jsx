import React from 'react';
import { motion } from 'framer-motion';
import EventCard from './EventCard';
import AuthPrompt from './AuthPrompt';
import Loader from '../../styles/Loader';
import { formatRecommendedEventDateTime } from '../../utils/eventUtils';

const RecommendedEvents = ({ 
    user, 
    recommended, 
    loadingRecommended, 
    handleSaveEvent, 
    debouncedTrackView,
    handleSpotifyLogin,
    handleRegister 
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

    if (loadingRecommended) {
        return (
        <div className="flex justify-center items-center h-64">
            <Loader />
        </div>
        );
    }

    return (
        <section className="mb-24">
        <motion.div 
            className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
        >
            <div className="group relative">
            <h2 className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-500">
                Recommended For You
            </h2>
            <div className="absolute left-0 -bottom-1 h-1 bg-gradient-to-r from-green-400 to-green-500 w-0 group-hover:w-full transition-all duration-500 rounded-full"></div>
            </div>
        </motion.div>
        
        {user ? (
            user.role !== 'guest' ? (
                recommended.length > 0 ? (
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {recommended.map(event => (
                    <motion.div 
                        key={`recommended-${event.id}`} 
                        variants={cardVariants}
                    >
                        <EventCard
                        event={event}
                        cardType="recommended"
                        onSave={handleSaveEvent}
                        onTrackView={debouncedTrackView}
                        formatDateTime={formatRecommendedEventDateTime}
                        />
                    </motion.div>
                    ))}
                </motion.div>
                ) : (
                <div className="rounded-xl bg-gray-800/40 backdrop-blur-sm p-8 border border-gray-700/50 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg text-gray-300 mb-2">No recommended events available</p>
                    <p className="text-sm text-gray-400">Try changing your preferences or browse events in your country</p>
                </div>
                )
            ) : (
                <AuthPrompt 
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                }
                title="Personalized Recommendations" 
                description="Please register or log in to your Re-Wrapped account to receive personalized event recommendations based on your musical preferences."
                buttonText="Register Now"
                onClick={handleRegister}
                />
            )
        ) : (
            <AuthPrompt 
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            }
            title="Authenticate with Spotify" 
            description="Authenticate with Spotify and register to receive personalized event recommendations based on your musical preferences."
            buttonText="Sign in with Spotify"
            onClick={handleSpotifyLogin}
            />
        )}
        </section>
    );
};

export default RecommendedEvents;