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
        
        <div className="bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-green-500">{saveRate}%</span>
            <span className="text-sm text-gray-400 mt-2">Save Rate</span>
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