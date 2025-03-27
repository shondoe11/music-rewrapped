import React from 'react';
import { motion } from 'framer-motion';
import EventCard from './EventCard';
import AuthPrompt from './AuthPrompt';
import Loader from '../../styles/Loader';
import { formatRecommendedEventDateTime } from '../../utils/eventUtils';

const SavedEvents = ({ 
    user, 
    savedEvents, 
    loadingSaved, 
    handleDeleteEvent, 
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

    if (loadingSaved) {
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
            transition={{ delay: 0.9 }}
        >
            <div className="group relative">
            <h2 className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                My Saved Events
            </h2>
            <div className="absolute left-0 -bottom-1 h-1 bg-gradient-to-r from-purple-400 to-pink-500 w-0 group-hover:w-full transition-all duration-500 rounded-full"></div>
            </div>
        </motion.div>
        
        {user ? (
            user.role !== 'guest' ? (
            savedEvents.length > 0 ? (
                <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                >
                {savedEvents.map(event => (
                    <motion.div 
                    key={`saved-${event.id}`} 
                    variants={cardVariants}
                    >
                    <EventCard
                        event={event}
                        cardType="saved"
                        onDelete={handleDeleteEvent}
                        formatDateTime={formatRecommendedEventDateTime}
                    />
                    </motion.div>
                ))}
                </motion.div>
            ) : (
                <div className="rounded-xl bg-gray-800/40 backdrop-blur-sm p-8 border border-gray-700/50 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <p className="text-xl text-gray-300 mb-2">No saved events yet</p>
                <p className="text-gray-400">Save events you're interested in and they'll appear here</p>
                </div>
            )
            ) : (
            <AuthPrompt 
                icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                }
                title="Register to Save Events" 
                description="Please register or log in to your Re-Wrapped account to save events and manage your saved events."
                buttonText="Register Now"
                onClick={handleRegister}
            />
            )
        ) : (
            <AuthPrompt 
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            }
            title="Sign In to Access Your Saved Events" 
            description="Please authenticate with Spotify and then register or log in to your Re-Wrapped account to access your saved events."
            buttonText="Sign in with Spotify"
            onClick={handleSpotifyLogin}
            />
        )}
        </section>
    );
};

export default SavedEvents;