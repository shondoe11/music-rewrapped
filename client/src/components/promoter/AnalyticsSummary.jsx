import React from 'react';
import PropTypes from 'prop-types';

const AnalyticsSummary = ({ analytics }) => {
    const { total_events, total_views, total_saves, average_engagement } = analytics;
    
    const saveRate = total_views > 0 ? ((total_saves / total_views) * 100).toFixed(1) : 0;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 p-5 rounded-xl shadow-lg border border-gray-700 border-opacity-40 transform transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center">
                <div className="bg-gray-900 bg-opacity-50 rounded-full p-3 mb-3">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <span className="text-3xl font-bold text-green-400">{total_events}</span>
                <span className="text-sm text-gray-300 mt-2">Total Events</span>
            </div>
            
            <div className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 p-5 rounded-xl shadow-lg border border-gray-700 border-opacity-40 transform transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center">
                <div className="bg-gray-900 bg-opacity-50 rounded-full p-3 mb-3">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </div>
                <span className="text-3xl font-bold text-green-400">{total_views.toLocaleString()}</span>
                <span className="text-sm text-gray-300 mt-2">Total Views</span>
            </div>
            
            <div className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 p-5 rounded-xl shadow-lg border border-gray-700 border-opacity-40 transform transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center">
                <div className="bg-gray-900 bg-opacity-50 rounded-full p-3 mb-3">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </div>
                <span className="text-3xl font-bold text-green-400">{total_saves.toLocaleString()}</span>
                <span className="text-sm text-gray-300 mt-2">Total Saves</span>
            </div>
            
            <div className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 p-5 rounded-xl shadow-lg border border-gray-700 border-opacity-40 transform transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center relative group">
                <div className="bg-gray-900 bg-opacity-50 rounded-full p-3 mb-3">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                </div>
                <span className="text-3xl font-bold text-green-400">{saveRate}%</span>
                <span className="text-sm text-gray-300 mt-2">Save Rate</span>
                
                {/* Tooltip */}
                <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-56 p-3 bg-gray-900 rounded-lg shadow-lg z-10 backdrop-filter backdrop-blur-md bg-opacity-90 border border-gray-700">
                    <div className="text-center">
                        <p className="font-medium text-white mb-2">How Save Rate is Calculated:</p>
                        <p className="mb-2 text-green-300">Save Rate = (Total Saves / Total Views) × 100</p>
                        <p className="text-xs text-gray-400">This percentage shows how many viewers saved your events after viewing.</p>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-gray-900 rotate-45 border-r border-b border-gray-700"></div>
                    </div>
                </div>
            </div>
            
            <div className="col-span-1 md:col-span-2 lg:col-span-4 backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 p-5 rounded-xl shadow-lg border border-gray-700 border-opacity-40">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-300">Average Engagement Score</span>
                    <span className="text-sm font-medium text-green-400 bg-gray-900 bg-opacity-50 px-3 py-1 rounded-full">
                        Views + (Saves × 2)
                    </span>
                </div>
                <div className="relative pt-1">
                    <div className="overflow-hidden h-5 text-xs flex rounded-full bg-gray-700 bg-opacity-50 backdrop-filter backdrop-blur-sm">
                        <div
                            style={{ width: `${Math.min(100, (average_engagement / 100) * 100)}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 ease-in-out"
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>0</span>
                        <span>{average_engagement.toFixed(1)}</span>
                    </div>
                </div>
                <div className="mt-3 text-xs text-gray-300 bg-gray-900 bg-opacity-30 p-3 rounded-lg">
                    <p>Engagement Score is a weighted metric that values saves higher than views. Each view counts as 1 point, while each save counts as 2 points, reflecting that saves indicate stronger audience interest.</p>
                </div>
            </div>
        </div>
    );
};

AnalyticsSummary.propTypes = {
    analytics: PropTypes.shape({
        total_events: PropTypes.number.isRequired,
        total_views: PropTypes.number.isRequired,
        total_saves: PropTypes.number.isRequired,
        average_engagement: PropTypes.number.isRequired
    }).isRequired
};

export default AnalyticsSummary;