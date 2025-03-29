import React from 'react';
import PropTypes from 'prop-types';

const calculateEventStatus = (eventDate) => {
    if (!eventDate) return 'Pre-Event';
    
    const now = new Date();
    const event = new Date(eventDate);
    
    if (event > now) {
        return 'Pre-Event';
    } else {
        const daysSinceEvent = Math.floor((now - event) / (1000 * 60 * 60 * 24));
        
        if (daysSinceEvent <= 1) {
            return 'Active';
        } else if (daysSinceEvent <= 7) {
            return 'Recent';
        } else {
            return 'Past';
        }
    }
};

const PromoterDashboard = ({ events, onTabChange }) => {
    return (
        <div className="p-6">
            <h2 className="text-3xl font-semibold mb-6 text-green-400">Event Management Dashboard</h2>
            {events.length === 0 ? (
                <div className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 p-8 rounded-xl shadow-lg border border-gray-700 border-opacity-40 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xl text-green-400 mb-3">No events submitted yet</p>
                    <p className="text-gray-300 mb-6">Create your first event to start promoting to your audience</p>
                    <button 
                        onClick={() => onTabChange('submit')}
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg transition-colors duration-300 shadow-lg transform hover:scale-105"
                    >
                        Create Your First Event
                    </button>
                </div>
            ) : (
                <>
                    {/* Mobile card view */}
                    <div className="md:hidden space-y-4">
                        {events.map((event) => (
                            <div key={event.id} className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 rounded-xl shadow-lg border border-gray-700 border-opacity-40 p-5 transform transition-all duration-300 hover:scale-102">
                                <h3 className="text-lg font-semibold text-green-400 mb-3">{event.title}</h3>
                                
                                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                    <div className="bg-gray-900 bg-opacity-50 rounded-lg p-3">
                                        <p className="text-gray-400 text-xs mb-1">Date & Time</p>
                                        <p className="text-white">{new Date(event.event_date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="bg-gray-900 bg-opacity-50 rounded-lg p-3">
                                        <p className="text-gray-400 text-xs mb-1">Status</p>
                                        <p className="text-white">{calculateEventStatus(event.event_date)}</p>
                                    </div>
                                    <div className="bg-gray-900 bg-opacity-50 rounded-lg p-3">
                                        <p className="text-gray-400 text-xs mb-1">Views</p>
                                        <p className="text-green-400 font-medium">{event.views || 0}</p>
                                    </div>
                                    <div className="bg-gray-900 bg-opacity-50 rounded-lg p-3">
                                        <p className="text-gray-400 text-xs mb-1">Saves</p>
                                        <p className="text-green-400 font-medium">{event.saves || 0}</p>
                                    </div>
                                </div>
                                
                                <div className="text-sm bg-gray-900 bg-opacity-30 rounded-lg p-3">
                                    <div className="mb-2">
                                        <span className="text-gray-400">Location: </span>
                                        <span className="text-white">{event.location}</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="text-gray-400">Tags: </span>
                                        <span className="text-white">{event.tags ? event.tags.join(', ') : 'n/a'}</span>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-gray-400">Engagement: </span>
                                        <div className="mt-1 relative pt-1">
                                            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-700">
                                                <div
                                                    style={{ width: `${Math.min(100, (event.engagement || 0) / 100 * 100)}%` }}
                                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-500 to-green-400"
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs mt-1">
                                                <span className="text-white">{event.engagement || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Desktop table view */}
                    <div className="hidden md:block overflow-x-auto backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 rounded-xl shadow-lg border border-gray-700 border-opacity-40">
                        <table className="min-w-full text-white">
                            <thead>
                                <tr className="bg-gray-900 bg-opacity-50">
                                    <th className="py-3 px-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider border-b border-gray-700 border-opacity-50">Title</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider border-b border-gray-700 border-opacity-50">Location</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider border-b border-gray-700 border-opacity-50">Date & Time</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider border-b border-gray-700 border-opacity-50">Status</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider border-b border-gray-700 border-opacity-50">Views</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider border-b border-gray-700 border-opacity-50">Saves</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider border-b border-gray-700 border-opacity-50">Tags</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider border-b border-gray-700 border-opacity-50">Engagement</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700 divide-opacity-50">
                                {events.map((event) => (
                                    <tr key={event.id} className="hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-150">
                                        <td className="py-3 px-4 whitespace-nowrap">{event.title}</td>
                                        <td className="py-3 px-4 whitespace-nowrap">{event.location}</td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            {new Date(event.event_date).toLocaleDateString()} {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap">{calculateEventStatus(event.event_date)}</td>
                                        <td className="py-3 px-4 whitespace-nowrap">{event.views || 0}</td>
                                        <td className="py-3 px-4 whitespace-nowrap">{event.saves || 0}</td>
                                        <td className="py-3 px-4 whitespace-nowrap">{event.tags ? event.tags.join(', ') : 'n/a'}</td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <span>{event.engagement || 0}</span>
                                                <div className="w-20 bg-gray-700 rounded-full h-1.5">
                                                    <div 
                                                        className="bg-gradient-to-r from-green-500 to-green-400 h-1.5 rounded-full" 
                                                        style={{width: `${Math.min(100, (event.engagement / 100) * 100)}%`}}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

PromoterDashboard.propTypes = {
    events: PropTypes.array.isRequired,
    onTabChange: PropTypes.func.isRequired
};

export default PromoterDashboard;