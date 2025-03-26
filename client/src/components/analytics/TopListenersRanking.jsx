import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import GaugeChart from 'react-gauge-chart';
import Loader from '../../styles/Loader';
import { getTopListenersPercentile } from '../../services/analyticsService';

const TopListenersRanking = ({ userId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
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
    
    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <Loader />
        </div>;
    }
    
    if (error) {
        return (
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
                <p className="text-red-500">{error}</p>
                <p className="text-gray-400 mt-2">Please try refreshing the page.</p>
            </div>
        );
    }
    
    //& normalize percentile to gauge range (0-1)
    const normalizedPercentile = data.percentile_ranking / 100;
    
    //& define color steps fr gradient
    const gradientColors = ['#EC4899', '#6366F1', '#10B981']; //~ pink, indigo, emerald
    
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow mb-8">
            
            <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <div className="relative flex justify-center">
                        <div className="w-full max-w-2xl mx-auto">
                            <div className="relative">
                                <GaugeChart 
                                    id="top-listener-gauge"
                                    nrOfLevels={20}
                                    colors={gradientColors}
                                    percent={normalizedPercentile}
                                    arcWidth={0.3}
                                    textColor="#FFFFFF"
                                    needleColor="#F43F5E"
                                    needleBaseColor="#F43F5E"
                                    animate={true}
                                    hideText={true}
                                    cornerRadius={6}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-white">{Math.round(data.percentile_ranking)}%</span>
                                </div>
                            </div>
                            
                            {data.favorite_artist && (
                                <div className="text-center mt-2">
                                    <p className="text-gray-300">
                                        <span className="font-bold">Favorite Artist:</span> {data.favorite_artist}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-400">
                <p>
                    This gauge shows where you rank among all listeners of your favorite artist. A higher percentile means you're among the most dedicated fans!
                </p>
                <p className="mt-2">
                    Your ranking is based on your listening frequency, playlist inclusions, and overall engagement with the artist's music.
                </p>
            </div>
        </div>
    );
};

TopListenersRanking.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default TopListenersRanking;