import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import GaugeChart from 'react-gauge-chart';
import Loader from '../../styles/Loader';
import { getTopListenersPercentile } from '../../services/analyticsService';
import { motion } from 'framer-motion';
import { isSafari, isFirefox } from '../../utils/browserDetection';

const SimpleFallbackGauge = ({ percentile, fanTier }) => {
    return (
        <div className="relative pt-5 pb-10">
            <div className="h-8 bg-gray-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500"
                    style={{ width: `${percentile}%` }}
                />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{Math.round(percentile)}%</span>
                <span className="mt-2 text-lg font-medium" style={{ color: fanTier.color }}>
                    {fanTier.tier}
                </span>
            </div>
        </div>
    );
};

const TopListenersRanking = ({ userId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [animatedPercentile, setAnimatedPercentile] = useState(0);
    const [shouldUseFallback, setShouldUseFallback] = useState(false);
    
    const gaugeRef = useRef(null);
    
    useEffect(() => {
        //~ check if shld use fallback fr Safari / Firefox
        setShouldUseFallback(isSafari() || isFirefox());
        
        const fetchData = async () => {
            setLoading(true);
            try {
                const percentileData = await getTopListenersPercentile(userId);
                setData(percentileData);
                setError(null);
            } catch (error) {
                console.error('Error fetching top listeners percentile data:', error);
                setError('Failed to fetch top listeners percentile data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [userId]);
    
    useEffect(() => {
        if (!data) return;
        
        const targetPercentile = Math.round(data.percentile_ranking);
        const duration = 2000;
        const framesPerSecond = 60;
        const totalFrames = duration / 1000 * framesPerSecond;
        const incrementPerFrame = targetPercentile / totalFrames;
        
        let currentPercentile = 0;
        let frame = 0;
        
        const animatePercentile = () => {
            if (frame < totalFrames) {
                currentPercentile += incrementPerFrame;
                setAnimatedPercentile(Math.min(Math.round(currentPercentile), targetPercentile));
                frame++;
                requestAnimationFrame(animatePercentile);
            } else {
                setAnimatedPercentile(targetPercentile);
            }
        };
        
        animatePercentile();
    }, [data]);
    
    //& Get fan tier based on percentile
    const getFanTier = (percentile) => {
        if (percentile >= 95) return { tier: "Super Fan", color: "#10B981" };
        if (percentile >= 80) return { tier: "Dedicated Fan", color: "#3B82F6" };
        if (percentile >= 60) return { tier: "Big Fan", color: "#8B5CF6" };
        if (percentile >= 40) return { tier: "Regular Listener", color: "#EC4899" };
        if (percentile >= 20) return { tier: "Casual Listener", color: "#F97316" };
        return { tier: "New Listener", color: "#F59E0B" };
    };
    
    if (loading) {
        return (
            <motion.div 
                className="flex justify-center items-center h-64"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Loader />
            </motion.div>
        );
    }
    
    if (error) {
        return (
            <motion.div 
                className="p-6 bg-red-900/20 border border-red-500/50 rounded-xl backdrop-blur-sm text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <p className="text-red-400 font-medium text-lg">{error}</p>
                <p className="text-gray-400 mt-2">Please try refreshing the page.</p>
            </motion.div>
        );
    }
    
    //& normalize percentile to gauge range (0-1)
    const normalizedPercentile = data.percentile_ranking / 100;
    
    //& define color steps fr gradient with more modern colors
    const gradientColors = ['#F97316', '#EC4899', '#8B5CF6', '#3B82F6', '#10B981']; //~ orange, pink, purple, blue, green
    
    const fanTier = getFanTier(data.percentile_ranking);
    
    //~ browser-specific class fr styling
    const containerClass = `bg-gray-800/40 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50 shadow-xl hover:shadow-pink-500/5 transition-all duration-300 ${isSafari() ? 'safari-compat' : ''} ${isFirefox() ? 'firefox-compat' : ''}`;
    
    return (
        <motion.div 
            className={containerClass}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.h3 
                className="text-xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                How You Compare to Other Fans
            </motion.h3>
            
            <motion.div 
                className="grid grid-cols-1 gap-6 mb-6 safari-grid-fix"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg">
                    <div className="relative flex justify-center">
                        <div className="w-full max-w-2xl mx-auto">
                            <div className="relative">
                                {shouldUseFallback ? (
                                    <SimpleFallbackGauge 
                                        percentile={data.percentile_ranking} 
                                        fanTier={fanTier} 
                                    />
                                ) : (
                                    <div ref={gaugeRef}>
                                        <GaugeChart 
                                            id="top-listener-gauge"
                                            nrOfLevels={30}
                                            colors={gradientColors}
                                            percent={normalizedPercentile}
                                            arcWidth={0.25}
                                            needleColor="#FFF"
                                            needleBaseColor="#FFF"
                                            animate={true}
                                            animDelay={0}
                                            animateDuration={2000}
                                            hideText={true}
                                            cornerRadius={6}
                                        />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <motion.span 
                                                className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500"
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ duration: 0.8, delay: 0.5 }}
                                            >
                                                {animatedPercentile}%
                                            </motion.span>
                                            <motion.span 
                                                className="mt-2 text-lg font-medium" 
                                                style={{ color: fanTier.color }}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.5, delay: 1.2 }}
                                            >
                                                {fanTier.tier}
                                            </motion.span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {data.favorite_artist && (
                                <motion.div 
                                    className="text-center mt-6 bg-gray-800/50 py-3 px-6 rounded-lg border border-gray-700/30"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 1.5 }}
                                >
                                    <p className="text-gray-200">
                                        You're in the <span className="font-bold text-pink-400">{animatedPercentile}th percentile</span> of 
                                        <span className="font-bold ml-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                                            {data.favorite_artist}
                                        </span> listeners!
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
            
            <motion.div 
                className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 safari-grid-fix"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.7 }}
            >
                <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg p-4 border border-gray-800/50">
                    <div className="flex items-center">
                        <div className="bg-purple-500/20 rounded-full p-2 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Listening Frequency</p>
                            <p className="text-lg font-medium text-gray-200">Higher Than {animatedPercentile}% of Fans</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg p-4 border border-gray-800/50">
                    <div className="flex items-center">
                        <div className="bg-pink-500/20 rounded-full p-2 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Engagement Level</p>
                            <p className="text-lg font-medium text-gray-200">{fanTier.tier}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg p-4 border border-gray-800/50">
                    <div className="flex items-center">
                        <div className="bg-blue-500/20 rounded-full p-2 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Sharing & Playlists</p>
                            <p className="text-lg font-medium text-gray-200">Top {100 - animatedPercentile}% Contributor</p>
                        </div>
                    </div>
                </div>
            </motion.div>
            
            <div className="mt-6 text-sm text-gray-400 border-t border-gray-700/30 pt-4">
                <p>
                    This gauge shows where you rank among all listeners of your favorite artist. A higher percentile means you're among the most dedicated fans of {data.favorite_artist}!
                </p>
                <p className="mt-2">
                    Your ranking is based on your listening frequency, playlist inclusions, and overall engagement with the artist's music compared to other fans.
                </p>
            </div>
        </motion.div>
    );
};

TopListenersRanking.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

SimpleFallbackGauge.propTypes = {
    percentile: PropTypes.number.isRequired,
    fanTier: PropTypes.object.isRequired
};

export default TopListenersRanking;