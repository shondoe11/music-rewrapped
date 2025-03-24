import React from 'react';
import PropTypes from 'prop-types';

const PerformanceInsights = ({ analytics, trends }) => {
    if (!analytics || !trends) {
        return null;
    }
    
    const { improving, declining } = trends;
    
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow mb-8">
        <h3 className="text-xl font-semibold mb-4">Performance Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Improving Events */}
            <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-green-500 flex items-center mb-2">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Improving Events
            </h4>
            
            {improving.length > 0 ? (
                <ul className="space-y-2">
                {improving.map(event => (
                    <li key={event.id} className="text-sm">
                    <div className="font-medium text-white">{event.title}</div>
                    <div className="text-gray-400">
                        Engagement rate: 
                        <span className="text-green-500 ml-1">
                        {(event.engagementRate).toFixed(2)}
                        </span>
                    </div>
                    </li>
                ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-400">No clear improving trends detected yet.</p>
            )}
            </div>
            
            {/* Declining Events */}
            <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-red-500 flex items-center mb-2">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                </svg>
                Needs Attention
            </h4>
            
            {declining.length > 0 ? (
                <ul className="space-y-2">
                {declining.map(event => (
                    <li key={event.id} className="text-sm">
                    <div className="font-medium text-white">{event.title}</div>
                    <div className="text-gray-400">
                        Engagement rate: 
                        <span className="text-red-500 ml-1">
                        {(event.engagementRate).toFixed(2)}
                        </span>
                    </div>
                    </li>
                ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-400">No concerning performance trends detected.</p>
            )}
            </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-400">
            <p>
            These insights are based on engagement rate trends across your events.
            Events with significantly higher or lower engagement than your average are highlighted.
            </p>
        </div>
        </div>
    );
};

PerformanceInsights.propTypes = {
    analytics: PropTypes.object.isRequired,
    trends: PropTypes.shape({
        improving: PropTypes.array.isRequired,
        declining: PropTypes.array.isRequired
    }).isRequired
};

export default PerformanceInsights;