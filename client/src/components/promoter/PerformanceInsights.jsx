import React from 'react';
import PropTypes from 'prop-types';

const PerformanceInsights = ({ analytics, trends }) => {
    if (!analytics || !trends) {
        return null;
    }
    
    const { improving, declining } = trends;
    
    return (
        <div className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 p-6 rounded-xl shadow-lg border border-gray-700 border-opacity-40 mb-8">
            <div className="flex items-center mb-5">
                <div className="bg-gray-900 bg-opacity-50 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-green-400">Performance Insights</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Improving Events */}
                <div className="backdrop-filter backdrop-blur-sm bg-gray-900 bg-opacity-30 p-5 rounded-lg border border-green-500 border-opacity-20">
                    <h4 className="font-medium text-green-400 flex items-center mb-3">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Improving Events
                    </h4>
                    
                    {improving.length > 0 ? (
                        <ul className="space-y-3">
                            {improving.map(event => (
                                <li key={event.id} className="bg-gray-800 bg-opacity-40 rounded-lg p-3 transform transition-all duration-300 hover:translate-x-1">
                                    <div className="font-medium text-white">{event.title}</div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-gray-400 text-sm">Engagement rate:</span>
                                        <div className="flex items-center">
                                            <span className="text-green-500 font-medium mr-1">
                                                {(event.engagementRate).toFixed(2)}
                                            </span>
                                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="bg-gray-800 bg-opacity-40 rounded-lg p-4 text-gray-300 text-center">
                            <svg className="w-8 h-8 mx-auto mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>No clear improving trends detected yet.</p>
                            <p className="text-xs mt-1 text-gray-400">Continue promoting events to gather more data.</p>
                        </div>
                    )}
                </div>
                
                {/* Declining Events */}
                <div className="backdrop-filter backdrop-blur-sm bg-gray-900 bg-opacity-30 p-5 rounded-lg border border-red-500 border-opacity-20">
                    <h4 className="font-medium text-red-400 flex items-center mb-3">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                        </svg>
                        Needs Attention
                    </h4>
                    
                    {declining.length > 0 ? (
                        <ul className="space-y-3">
                            {declining.map(event => (
                                <li key={event.id} className="bg-gray-800 bg-opacity-40 rounded-lg p-3 transform transition-all duration-300 hover:translate-x-1">
                                    <div className="font-medium text-white">{event.title}</div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-gray-400 text-sm">Engagement rate:</span>
                                        <div className="flex items-center">
                                            <span className="text-red-500 font-medium mr-1">
                                                {(event.engagementRate).toFixed(2)}
                                            </span>
                                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                                            </svg>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="bg-gray-800 bg-opacity-40 rounded-lg p-4 text-gray-300 text-center">
                            <svg className="w-8 h-8 mx-auto mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>No concerning performance trends detected.</p>
                            <p className="text-xs mt-1 text-gray-400">All your events are performing well.</p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="mt-5 text-sm text-gray-300 bg-gray-900 bg-opacity-30 p-4 rounded-lg">
                <div className="flex items-start mb-2">
                    <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>
                        These insights are based on engagement rate trends across your events.
                        Events with significantly higher or lower engagement than your average are highlighted.
                        Consider adjusting targeting parameters for underperforming events to improve their reach.
                    </p>
                </div>
                <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p>
                        Engagement rate is calculated using a combination of views, saves, and interaction time,
                        providing a holistic measure of how well your event resonates with the audience.
                    </p>
                </div>
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