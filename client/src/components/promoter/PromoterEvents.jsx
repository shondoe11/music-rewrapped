import React from 'react';
import PropTypes from 'prop-types';
import EventForm from './EventForm';

const PromoterEvents = ({ 
    events, 
    onUpdateEvent, 
    onDeleteEvent, 
    editingEventId,
    setEditingEventId 
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
        <div className="p-4">
        <h2 className="text-3xl font-semibold mb-4">My Events</h2>
        {events.length === 0 ? (
            <p>No sponsored events available.</p>
        ) : (
            <ul className="space-y-4">
            {events.map((event) => (
                <li key={event.id} className="p-4 bg-gray-800 rounded shadow">
                <div className="flex justify-between items-center">
                    <div>
                    <h4 className="text-xl font-semibold">{event.title}</h4>
                    <p>
                        {event.location} | {formatEventDateTime(event.event_date)}
                    </p>
                    {event.details && (
                        <p className="mt-1">{event.details}</p>
                    )}
                    </div>
                    <div className="flex space-x-2">
                    <button 
                        onClick={() => setEditingEventId(event.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                    >
                        Update
                    </button>
                    <button 
                        onClick={() => onDeleteEvent(event.id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                    >
                        Delete
                    </button>
                    </div>
                </div>
                {editingEventId === event.id && (
                    <div className="mt-4 p-4 bg-gray-700 rounded">
                    <h3 className="text-lg font-semibold mb-2">Edit Event Details</h3>
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
                </li>
            ))}
            </ul>
        )}
        </div>
    );
};

PromoterEvents.propTypes = {
    events: PropTypes.array.isRequired,
    onUpdateEvent: PropTypes.func.isRequired,
    onDeleteEvent: PropTypes.func.isRequired,
    editingEventId: PropTypes.number,
    setEditingEventId: PropTypes.func.isRequired
};

export default PromoterEvents;