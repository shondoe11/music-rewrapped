import React, { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { getAllEvents, getSavedEvents, saveEvent, deleteEvent } from '../../api';
import analyticsService from '../../services/analyticsService';
import geolocationService from '../../services/geolocationService';
import _ from 'lodash';
import Particles from '../../styles/backgrounds/Particles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createEventPayload } from '../../utils/eventUtils';
//& components imports
import CountrySearchBar from './CountrySearchBar';
import RecommendedEvents from './RecommendedEvents';
import EventListings from './EventListings';
import SavedEvents from './SavedEvents';
import ScrollToTop from './ScrollToTop';

const Events = ({ userId }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]); 
    const [recommended, setRecommended] = useState([]); 
    const [savedEvents, setSavedEvents] = useState([]);
    const [country, setCountry] = useState('SG');
    const [inputCode, setInputCode] = useState('SG');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLocating, setIsLocating] = useState(true);
    const itemsPerPage = 6;
    const [viewedEvents, setViewedEvents] = useState(new Set());
    const scrollRef = useRef(null);
    
    //& loading states
    const [loadingRecommended, setLoadingRecommended] = useState(true);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingSaved, setLoadingSaved] = useState(true);

    //& detect user's location on component mount
    useEffect(() => {
        const detectLocation = async () => {
            setIsLocating(true);
            try {
                const detectedCountry = await geolocationService.detectUserCountry();
                setCountry(detectedCountry);
                setInputCode(detectedCountry);
                toast.info(`Location detected: ${detectedCountry}`);
            } catch (error) {
                console.error('Location detection failed:', error);
                //~ silent fail - use default SG
            } finally {
                setIsLocating(false);
            }
        };
        
        detectLocation();
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            if (isLocating) return; //~ wait location detection is complete
            
            setLoadingEvents(true);
            setLoadingRecommended(true);
            try {
                const response = await getAllEvents(country);
                if (response) {
                    if (response.external_events && response.external_events.length > 0) {
                        setEvents(response.external_events);
                    } else {
                        toast.info('No external events found from external sources');
                        setEvents([]);
                    }
                    if (response.recommended_events && response.recommended_events.length > 0) {
                        setRecommended(response.recommended_events);
                    }
                }
            } catch (error) {
                console.error('Error fetching events:', error);
                toast.error('Failed to fetch events');
            } finally {
                setLoadingEvents(false);
                setLoadingRecommended(false);
            }
        };
        
        fetchEvents();
    }, [country, isLocating]);

    //& fetch saved events on load + recommended events update
    useEffect(() => {
        const fetchSavedEvents = async () => {
            if (user && user.id) {
                setLoadingSaved(true);
                try {
                    const response = await getSavedEvents(user.id);
                    if (response && response.events) {
                        setSavedEvents(response.events);
                    }
                } catch (error) {
                    console.error('Error fetching saved events:', error);
                    toast.error('Failed to fetch saved events');
                } finally {
                    setLoadingSaved(false);
                }
            } else {
                //& if no user, set loading false immediately to prevent infinite loading
                setLoadingSaved(false);
            }
        };
        
        fetchSavedEvents();
    }, [user, recommended]);

    //& handle save event, persist via API endpoint
    const handleSaveEvent = async (eventData) => {
        if (!user) {
            toast.error('Please authenticate with Spotify and then register or log in to save events.');
            return;
        }
        if (user.role === 'guest') {
            toast.error('To tag and save events, please register or log in to your Re-Wrapped account.');
            return;
        }
        try {
            const payload = createEventPayload(eventData, user.id);
            
            const response = await saveEvent(payload);
            if (response && response.event) {
                setSavedEvents(prev => [...prev, response.event]);
                toast.success(response.message);
            }
        } catch (error) {
            console.error('Error saving event:', error);
            toast.error(error.response?.data?.error || 'Failed to save event');
        }
    };

    //& handle delete saved event
    const handleDeleteEvent = async (eventId) => {
        try {
            const response = await deleteEvent(eventId);
            if (response && response.message) {
                toast.success(response.message);
                setSavedEvents(prev => prev.filter(e => e.id !== eventId));
            }
        } catch (error) {
            console.error('Error deleting event:', error.response?.data || error);
            toast.error(error.response?.data?.error || 'Failed to delete event');
        }
    };

    //& pagination logic
    const totalPages = Math.ceil(events.length / itemsPerPage);

    //& country search handler
    const handleCountrySearch = () => {
        setCountry(inputCode.toUpperCase());
        setCurrentPage(1);
    };

    const trackEventView = async (eventId) => {
        if (!eventId) return;
        
        try {
            await analyticsService.trackEventView(eventId);
        } catch (error) {
            console.error('Failed to track event view:', error);
        }
    };

    //& debounced tracking to prevent duplicate counts
    const debouncedTrackView = useCallback(
        _.debounce((eventId) => {
            if (!viewedEvents.has(eventId)) {
                try {
                    trackEventView(eventId);
                    setViewedEvents(prev => new Set([...prev, eventId]));
                } catch (error) {
                    console.error('Failed to track event view:', error);
                }
            }
        }, 500),
        [viewedEvents]
    );

    //& reset viewed events when component unmounts / when events change
    useEffect(() => {
        return () => {
            setViewedEvents(new Set());
        };
    }, [recommended]);

    //& scroll event listings when searching
    const scrollToEventListings = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    //& navigate spotify login
    const handleSpotifyLogin = () => {
        navigate('/spotify-login');
    };

    //& navigate register page
    const handleRegister = () => {
        navigate('/register');
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="fixed inset-0 bg-gray-900 -z-20"></div>
            
            {/* Particles BG */}
            <div 
                className="fixed inset-0" 
                style={{ 
                    zIndex: -10, 
                    pointerEvents: 'auto',
                    height: '100vh',
                    width: '100vw'
                }}
            >
                <Particles 
                    particleCount={1000}
                    particleSpread={8}
                    speed={0.15}
                    particleColors={["#22c55e", "#4ade80", "#86efac", "#ffffff"]}
                    moveParticlesOnHover={true}
                    particleHoverFactor={1.5}
                    alphaParticles={false}
                    particleBaseSize={200}
                    sizeRandomness={0.1}
                    cameraDistance={25}
                />
            </div>
            
            {/* Main Content */}
            <div className="p-4 lg:p-8 text-white relative z-10 max-w-7xl mx-auto mt-20">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                        Discover Events
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Find exciting events tailored to your musical tastes or browse events happening around the world.
                    </p>
                </motion.div>
                
                {/* Country Search Bar */}
                <CountrySearchBar 
                    inputCode={inputCode}
                    setInputCode={setInputCode}
                    handleCountrySearch={handleCountrySearch}
                    scrollToEventListings={scrollToEventListings}
                    isLocating={isLocating}
                />
                
                {/* Recommended Events */}
                <RecommendedEvents 
                    user={user}
                    recommended={recommended}
                    loadingRecommended={loadingRecommended || isLocating}
                    handleSaveEvent={handleSaveEvent}
                    debouncedTrackView={debouncedTrackView}
                    handleSpotifyLogin={handleSpotifyLogin}
                />
                
                {/* Event Listings */}
                <div ref={scrollRef}>
                    <EventListings 
                        events={events}
                        loading={loadingEvents || isLocating}
                        handleSaveEvent={handleSaveEvent}
                        country={country}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        totalPages={totalPages}
                        setInputCode={setInputCode}
                        setCountry={setCountry}
                    />
                </div>
                
                {/* Saved Events */}
                <SavedEvents 
                    user={user}
                    savedEvents={savedEvents}
                    loadingSaved={loadingSaved}
                    handleDeleteEvent={handleDeleteEvent}
                    handleSpotifyLogin={handleSpotifyLogin}
                    handleRegister={handleRegister}
                />
            </div>
            
            {/* Back to Top */}
            <ScrollToTop />
        </div>
    );
};

export default Events;