import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useTimeSeries from '../../hooks/useTimeSeries';
import TimeSeriesChart from './TimeSeriesChart';
import Loader from '../../styles/Loader';

const TimeSeriesDashboard = ({ userId, eventId }) => {
    const [timeScale, setTimeScale] = useState('daily');
    const { 
        timeSeriesData, 
        summary, 
        loading, 
        error, 
        timeRange, 
        setTimeRange,
        calculateTrends,
        findPeakDays
    } = useTimeSeries(userId, eventId);

    if (loading) {
        return (
            <div className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 p-6 rounded-xl shadow-lg border border-gray-700 border-opacity-40 mb-8 flex justify-center items-center h-64">
                <div className="text-center">
                    <Loader />
                    <p className="mt-4 text-gray-300">Loading time series data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 p-6 rounded-xl shadow-lg border border-red-500 border-opacity-30 mb-8">
                <div className="flex items-center mb-4">
                    <div className="bg-red-500 bg-opacity-20 rounded-full p-2 mr-3">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-red-400">Data Loading Error</h3>
                </div>
                
                <div className="bg-gray-900 bg-opacity-30 p-4 rounded-lg text-center">
                    <p className="text-red-400 mb-2">{error}</p>
                    <p className="text-gray-300 text-sm">Please try refreshing the page or contact support if the issue persists.</p>
                </div>
            </div>
        );
    }

    const trends = calculateTrends();
    const peakDays = findPeakDays();

    const formattedTrendPercentage = trends.percentage ? parseFloat(trends.percentage).toFixed(1) : '0.0';

    return (
        <div className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 p-6 rounded-xl shadow-lg border border-gray-700 border-opacity-40 mb-8">
            <div className="flex items-center mb-5">
                <div className="bg-gray-900 bg-opacity-50 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-green-400">Performance Trends</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
                <div className="backdrop-filter backdrop-blur-sm bg-gray-900 bg-opacity-30 p-5 rounded-lg border border-gray-700 border-opacity-30 transform transition-all duration-300 hover:scale-102">
                    <div className="text-sm text-gray-400 mb-2">Time Range</div>
                    <select 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(Number(e.target.value))}
                        className="w-full bg-gray-800 bg-opacity-70 text-white border border-gray-600 rounded-lg py-2 px-3 focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-20 focus:outline-none transition-all duration-300"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                    </select>
                </div>
                
                <div className="backdrop-filter backdrop-blur-sm bg-gray-900 bg-opacity-30 p-5 rounded-lg border border-gray-700 border-opacity-30 transform transition-all duration-300 hover:scale-102">
                    <div className="text-sm text-gray-400 mb-2">View Format</div>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => setTimeScale('daily')}
                            className={`py-2 px-3 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                timeScale === 'daily' 
                                    ? 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500 border-opacity-30' 
                                    : 'bg-gray-800 bg-opacity-70 text-gray-300 border border-gray-700 border-opacity-50 hover:bg-opacity-90'
                            }`}
                        >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Daily
                        </button>
                        <button 
                            onClick={() => setTimeScale('weekly')}
                            className={`py-2 px-3 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                timeScale === 'weekly' 
                                    ? 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500 border-opacity-30' 
                                    : 'bg-gray-800 bg-opacity-70 text-gray-300 border border-gray-700 border-opacity-50 hover:bg-opacity-90'
                            }`}
                        >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Weekly
                        </button>
                    </div>
                </div>
                
                <div className="backdrop-filter backdrop-blur-sm bg-gray-900 bg-opacity-30 p-5 rounded-lg border border-gray-700 border-opacity-30 transform transition-all duration-300 hover:scale-102">
                    <div className="text-sm text-gray-400 mb-2">Overall Trend</div>
                    <div className="mt-1 flex items-center">
                        {trends.trend === 'up' ? (
                            <div className="flex items-center text-green-400 bg-green-500 bg-opacity-10 py-2 px-3 rounded-lg">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                <span className="font-medium">Up {formattedTrendPercentage}%</span>
                            </div>
                        ) : trends.trend === 'down' ? (
                            <div className="flex items-center text-red-400 bg-red-500 bg-opacity-10 py-2 px-3 rounded-lg">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                                </svg>
                                <span className="font-medium">Down {formattedTrendPercentage}%</span>
                            </div>
                        ) : (
                            <div className="flex items-center text-gray-300 bg-gray-500 bg-opacity-10 py-2 px-3 rounded-lg">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                                </svg>
                                <span className="font-medium">Stable</span>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="backdrop-filter backdrop-blur-sm bg-gray-900 bg-opacity-30 p-5 rounded-lg border border-gray-700 border-opacity-30 transform transition-all duration-300 hover:scale-102">
                    <div className="text-sm text-gray-400 mb-2">Summary</div>
                    <div className="flex flex-col space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">Total Views:</span>
                            <span className="text-green-400 font-medium">{summary.total_views.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">Total Saves:</span>
                            <span className="text-blue-400 font-medium">{summary.total_saves.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">Save Rate:</span>
                            <span className="text-pink-400 font-medium">
                                {summary.total_views > 0 
                                    ? ((summary.total_saves / summary.total_views) * 100).toFixed(1) 
                                    : '0.0'}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <TimeSeriesChart 
                data={timeSeriesData[timeScale]} 
                type={timeScale}
            />
            
            {peakDays.length > 0 && (
                <div className="mt-6">
                    <div className="flex items-center mb-4">
                        <div className="bg-gray-900 bg-opacity-50 rounded-full p-2 mr-3">
                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-medium text-green-400">Peak Activity Days</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {peakDays.map((day) => (
                            <div key={day.date} className="backdrop-filter backdrop-blur-sm bg-gray-900 bg-opacity-30 p-4 rounded-lg border border-gray-700 border-opacity-30 transform transition-all duration-300 hover:scale-102">
                                <div className="text-lg text-white font-medium flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {new Date(day.date).toLocaleDateString(undefined, { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-3">
                                    <div className="bg-gray-800 bg-opacity-50 p-2 rounded-lg">
                                        <span className="text-gray-400 text-xs">Views</span>
                                        <div className="text-green-400 font-medium">{day.views}</div>
                                    </div>
                                    <div className="bg-gray-800 bg-opacity-50 p-2 rounded-lg">
                                        <span className="text-gray-400 text-xs">Saves</span>
                                        <div className="text-blue-400 font-medium">{day.saves}</div>
                                    </div>
                                </div>
                                {day.events && day.events.length > 0 && (
                                    <div className="mt-3 text-sm">
                                        <div className="text-gray-400">Active Events:</div>
                                        <div className="text-gray-300 line-clamp-1">{day.events.join(', ')}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

TimeSeriesDashboard.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default TimeSeriesDashboard;