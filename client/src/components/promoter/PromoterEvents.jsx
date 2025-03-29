import React from 'react';
import PropTypes from 'prop-types';
import EventForm from './EventForm';

const PromoterEvents = ({ 
    events, 
    onUpdateEvent, 
    onDeleteEvent, 
    editingEventId,
    setEditingEventId,
    onTabChange 
}) => {
    const formatEventDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    const prepareInitialData = (event) => {
        return {
            title: event.title,
            location: event.location,
            date: event.event_date ? event.event_date.split('T')[0] : '',
            time: event.event_date ? event.event_date.split('T')[1]?.slice(0,5) : '',
            description: event.description || event.details || '',
            image: event.image || '',
            url: event.url || '',
            targetCountry: event.target_country || '',
            targetGenreInterest: event.target_genre_interest || '',
            targetArtistInterest: event.target_artist_interest || '',
            listeningThreshold: event.listening_threshold || '',
            targetRoles: event.target_roles || []
        };
    };

    return (
        <div className="p-6">
            <h2 className="text-3xl font-semibold mb-6 text-green-400">My Events</h2>
            
            {events.length === 0 ? (
                <div className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 p-8 rounded-xl shadow-lg border border-gray-700 border-opacity-40 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xl text-green-400 mb-3">No sponsored events yet</p>
                    <p className="text-gray-300 mb-6">Start promoting your events to reach your target audience</p>
                    <button 
                        onClick={() => onTabChange('submit')}
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg transition-colors duration-300 shadow-lg transform hover:scale-105"
                    >
                        Create Your First Event
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {events.map((event) => (
                        <div key={event.id} className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 rounded-xl shadow-lg border border-gray-700 border-opacity-40 overflow-hidden">
                            <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center">
                                <div className="mb-4 md:mb-0">
                                    <h4 className="text-xl font-semibold text-green-400">{event.title}</h4>
                                    <div className="flex flex-wrap items-center mt-2 text-sm text-gray-300">
                                        <div className="flex items-center mr-4 mb-2">
                                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>{event.location}</span>
                                        </div>
                                        <div className="flex items-center mb-2">
                                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>{formatEventDateTime(event.event_date)}</span>
                                        </div>
                                    </div>
                                    {event.details && (
                                        <p className="mt-2 text-gray-300 text-sm line-clamp-2">{event.details}</p>
                                    )}
                                </div>
                                
                                <div className="flex space-x-3">
                                    <button 
                                        onClick={() => setEditingEventId(event.id)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-300 flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Update
                                    </button>
                                    <button 
                                        onClick={() => onDeleteEvent(event.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors duration-300 flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                            
                            {editingEventId === event.id && (
                                <div className="bg-gray-900 bg-opacity-50 p-5 border-t border-gray-700 border-opacity-50">
                                    <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Event Details
                                    </h3>
                                    <EventForm 
                                        initialData={prepareInitialData(event)} 
                                        onSubmit={(data) => {
                                            onUpdateEvent(event.id, data);
                                            setEditingEventId(null);
                                        }}
                                        submitButtonText="Save Changes"
                                        compact={true}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

PromoterEvents.propTypes = {
    events: PropTypes.array.isRequired,
    onUpdateEvent: PropTypes.func.isRequired,
    onDeleteEvent: PropTypes.func.isRequired,
    editingEventId: PropTypes.number,
    setEditingEventId: PropTypes.func.isRequired,
    onTabChange: PropTypes.func.isRequired
};

export default PromoterEvents;