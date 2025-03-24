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
        <div className="flex justify-center items-center h-64">
            <Loader />
        </div>
        );
    }

    if (error) {
        return (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
            <p className="text-red-500">{error}</p>
            <p className="text-gray-400 mt-2">Please try refreshing the page.</p>
        </div>
        );
    }

    const trends = calculateTrends();
    const peakDays = findPeakDays();

    return (
        <div>
        <div className="bg-gray-800 p-4 rounded-lg shadow mb-8">
            <h3 className="text-xl font-semibold mb-4">Performance Over Time</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="p-4 bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-400">Time Range</div>
                <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="mt-1 bg-gray-800 text-white border border-gray-600 rounded py-1 px-2 w-full"
                >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                </select>
            </div>
            
            <div className="p-4 bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-400">Time Scale</div>
                <div className="mt-1 flex">
                <button 
                    onClick={() => setTimeScale('daily')}
                    className={`flex-1 py-1 px-2 rounded-l ${
                    timeScale === 'daily' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                >
                    Daily
                </button>
                <button 
                    onClick={() => setTimeScale('weekly')}
                    className={`flex-1 py-1 px-2 rounded-r ${
                    timeScale === 'weekly' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                >
                    Weekly
                </button>
                </div>
            </div>
            
            <div className="p-4 bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-400">Overall Trend</div>
                <div className="mt-1 flex items-center">
                {trends.trend === 'up' ? (
                    <div className="flex items-center text-green-500">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    <span>Up {trends.percentage}%</span>
                    </div>
                ) : trends.trend === 'down' ? (
                    <div className="flex items-center text-red-500">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span>Down {trends.percentage}%</span>
                    </div>
                ) : (
                    <div className="flex items-center text-gray-400">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                    </svg>
                    <span>Stable</span>
                    </div>
                )}
                </div>
            </div>
            
            <div className="p-4 bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-400">Summary</div>
                <div className="mt-1 text-sm">
                <div>Total Views: <span className="text-green-500">{summary.total_views}</span></div>
                <div>Total Saves: <span className="text-blue-500">{summary.total_saves}</span></div>
                </div>
            </div>
            </div>
            
            <TimeSeriesChart 
            data={timeSeriesData[timeScale]} 
            type={timeScale}
            />
            
            {peakDays.length > 0 && (
            <div className="mt-4">
                <h4 className="text-lg font-medium mb-2">Peak Activity Days</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {peakDays.map((day) => (
                    <div key={day.date} className="p-3 bg-gray-700 rounded-lg">
                    <div className="text-lg text-white font-medium">
                        {new Date(day.date).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric' 
                        })}
                    </div>
                    <div className="text-sm">
                        <span className="text-gray-400">Views: </span>
                        <span className="text-green-500">{day.views}</span>
                        <span className="text-gray-400 ml-2">Saves: </span>
                        <span className="text-blue-500">{day.saves}</span>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            )}
        </div>
        </div>
    );
    };

    TimeSeriesDashboard.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    };

export default TimeSeriesDashboard;