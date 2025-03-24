import React from 'react';
import PropTypes from 'prop-types';

const AnalyticsSummary = ({ analytics }) => {
    const { total_events, total_views, total_saves, average_engagement } = analytics;
    
    const saveRate = total_views > 0 ? ((total_saves / total_views) * 100).toFixed(1) : 0;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-green-500">{total_events}</span>
            <span className="text-sm text-gray-400 mt-2">Total Events</span>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-green-500">{total_views.toLocaleString()}</span>
            <span className="text-sm text-gray-400 mt-2">Total Views</span>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-green-500">{total_saves.toLocaleString()}</span>
            <span className="text-sm text-gray-400 mt-2">Total Saves</span>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center justify-center relative group">
            <span className="text-3xl font-bold text-green-500">{saveRate}%</span>
            <span className="text-sm text-gray-400 mt-2">Save Rate</span>
            
            {/* Tooltip */}
            <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-xs text-green-300 rounded shadow-lg z-10">
                <div className="text-center">
                    <p className="font-medium text-white mb-1">How Save Rate is Calculated:</p>
                    <p className="mb-1">Save Rate = (Total Saves / Total Views) × 100</p>
                    <p className="text-xs text-gray-400">This percentage shows how many viewers saved your events after viewing.</p>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-gray-900 rotate-45"></div>
                </div>
            </div>
        </div>
        
        <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Average Engagement Score</span>
            <span className="text-sm font-medium text-green-500">
                Views + (Saves × 2)
            </span>
            </div>
            <div className="relative pt-1">
            <div className="overflow-hidden h-4 text-xs flex rounded bg-gray-700">
                <div
                style={{ width: `${Math.min(100, (average_engagement / 100) * 100)}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0</span>
                <span>{average_engagement.toFixed(1)}</span>
            </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
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