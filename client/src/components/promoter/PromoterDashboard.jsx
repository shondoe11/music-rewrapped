import React from 'react';
import PropTypes from 'prop-types';

const PromoterDashboard = ({ events }) => {
    return (
        <div className="p-4">
            <h2 className="text-3xl font-semibold mb-4">Event Management Dashboard</h2>
            {events.length === 0 ? (
                <p>No events submitted yet.</p>
            ) : (
                <>
                    {/* Mobile card */}
                    <div className="md:hidden space-y-4">
                        {events.map((event) => (
                            <div key={event.id} className="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700">
                                <h3 className="text-lg font-semibold text-green-500 mb-2">{event.title}</h3>
                                
                                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                    <div>
                                        <p className="text-gray-400">Date & Time:</p>
                                        <p>{new Date(event.event_date).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Status:</p>
                                        <p>{event.status || 'Pre-Event'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Views:</p>
                                        <p className="text-green-400 font-medium">{event.views || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Saves:</p>
                                        <p className="text-green-400 font-medium">{event.saves || 0}</p>
                                    </div>
                                </div>
                                
                                <div className="text-sm">
                                    <div className="mb-1">
                                        <span className="text-gray-400">Location: </span>
                                        <span>{event.location}</span>
                                    </div>
                                    <div className="mb-1">
                                        <span className="text-gray-400">Tags: </span>
                                        <span>{event.tags ? event.tags.join(', ') : 'n/a'}</span>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-gray-400">Engagement: </span>
                                        <span className="text-green-400 font-medium">{event.engagement || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full bg-gray-800 text-green-500 rounded shadow">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b">Title</th>
                                    <th className="py-2 px-4 border-b">Location</th>
                                    <th className="py-2 px-4 border-b">Date & Time</th>
                                    <th className="py-2 px-4 border-b">Status</th>
                                    <th className="py-2 px-4 border-b">Views</th>
                                    <th className="py-2 px-4 border-b">Saves</th>
                                    <th className="py-2 px-4 border-b">Tags</th>
                                    <th className="py-2 px-4 border-b">Engagement</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr key={event.id} className="text-center">
                                        <td className="py-2 px-4 border-b">{event.title}</td>
                                        <td className="py-2 px-4 border-b">{event.location}</td>
                                        <td className="py-2 px-4 border-b">
                                            {new Date(event.event_date).toLocaleDateString()} {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="py-2 px-4 border-b">{event.status || 'Pre-Event'}</td>
                                        <td className="py-2 px-4 border-b">{event.views || 0}</td>
                                        <td className="py-2 px-4 border-b">{event.saves || 0}</td>
                                        <td className="py-2 px-4 border-b">{event.tags ? event.tags.join(', ') : 'n/a'}</td>
                                        <td className="py-2 px-4 border-b">{event.engagement || 0}</td>
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
    events: PropTypes.array.isRequired
};

export default PromoterDashboard;