import React from 'react';
import { getEventImage } from '../../utils/eventUtils';

//& reusable event card component (can be configured based on cardType)
//~ support 3 types: 'recommended', 'external', 'saved'
const EventCard = ({ 
    event, 
    cardType = 'external', 
    onSave, 
    onDelete, 
    onTrackView, 
    formatDateTime 
    }) => {
    
    //& handle view tracking w optional callback
    const handleTrackView = () => {
        if (event.id && onTrackView) {
        onTrackView(event.id);
        }
    };

    if (cardType === 'recommended') {
        return (
        <div className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20 transform hover:-translate-y-1 backdrop-blur-lg border border-gray-700/40 hover:border-gray-600/60">
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/10 z-10"></div>
            
            {getEventImage(event) ? (
            <div className="h-64 overflow-hidden">
                <img 
                src={getEventImage(event)} 
                alt={event.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onClick={handleTrackView}
                />
            </div>
            ) : (
            <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
            </div>
            )}
            
            <div className="absolute z-20 bottom-0 left-0 w-full p-6 transform transition-transform duration-300">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                {event.url ? (
                    <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl font-bold mb-2 block text-white hover:text-green-400 transition-colors"
                    onClick={handleTrackView}
                    >
                    {event.title}
                    </a>
                ) : (
                    <span className="text-xl font-bold mb-2 block text-white">
                    {event.title}
                    </span>
                )}
                <p className="text-sm text-gray-300 mb-2 flex items-start">
                    <span className="inline-flex items-center mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="leading-tight">{event.location}</span>
                    </span>
                </p>
                <p className="text-sm text-gray-300 mb-3 flex items-start">
                    <span className="inline-flex items-center mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="leading-tight">{formatDateTime(event)}</span>
                    </span>
                </p>
                </div>
            </div>
            
            <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100 mb-3">
                {event.details && (
                <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                    {event.details}
                </p>
                )}
            </div>
            
            <button
                onClick={() => {
                handleTrackView();
                onSave(event);
                }}
                className="w-full mt-2 text-sm bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Save Event
            </button>
            </div>
        </div>
        );
    }

    if (cardType === 'external') {
        return (
        <div className="group relative bg-gray-800/30 border border-gray-700/50 hover:border-gray-600/80 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 backdrop-blur-sm transform hover:-translate-y-1">
            {getEventImage(event) ? (
            <div className="h-48 overflow-hidden">
                <img 
                src={getEventImage(event)} 
                alt={event.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            </div>
            ) : (
            <div className="h-48 bg-gradient-to-br from-gray-700/50 to-gray-900/50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
            </div>
            )}
            
            <div className="p-5">
            {event.url ? (
                <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-bold mb-3 block text-white hover:text-blue-400 transition-colors"
                >
                {event.name}
                </a>
            ) : (
                <span className="text-xl font-bold mb-3 block text-white">
                {event.name}
                </span>
            )}
            
            <div className="mb-4 space-y-2">
                <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-300 text-sm leading-tight">
                    {event._embedded && event._embedded.venues
                    ? event._embedded.venues[0].name
                    : (typeof event.location === 'object' && event.location !== null
                        ? event.location.name
                        : event.location || 'N/A')}
                </span>
                </div>
                
                <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-300 text-sm leading-tight">
                    {formatDateTime(event)}
                </span>
                </div>
            </div>
            
            {event.details && (
                <p className="mt-3 mb-4 text-sm text-gray-400 line-clamp-2">
                {event.details}
                </p>
            )}
            
            <button
                onClick={() => onSave(event)}
                className="w-full mt-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Event
            </button>
            </div>
        </div>
        );
    }

    return (
        <div className="group relative bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700/50 hover:border-pink-500/30 shadow-lg hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 backdrop-blur-sm transform hover:-translate-y-1">
        {event.image ? (
            <div className="h-48 overflow-hidden">
            <img 
                src={event.image} 
                alt={event.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            </div>
        ) : (
            <div className="h-48 bg-gradient-to-br from-gray-700/50 to-gray-900/50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            </div>
        )}
        
        <div className="absolute top-3 right-3">
            <span className="bg-pink-500/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            Saved
            </span>
        </div>
        
        <div className="p-5">
            {event.url ? (
            <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-bold mb-3 block text-white hover:text-pink-400 transition-colors"
            >
                {event.name}
            </a>
            ) : (
            <span className="text-xl font-bold mb-3 block text-white">
                {event.name}
            </span>
            )}
            
            <div className="mb-4 space-y-2">
            <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-300 text-sm leading-tight">
                {event._embedded && event._embedded.venues
                    ? event._embedded.venues[0].name
                    : (typeof event.location === 'object' && event.location !== null
                        ? event.location.name
                        : event.location || 'N/A')}
                </span>
            </div>
            
            <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-300 text-sm leading-tight">
                {formatDateTime(event)}
                </span>
            </div>
            </div>
            
            {event.details && (
            <p className="mt-3 mb-4 text-sm text-gray-400 line-clamp-2">
                {event.details}
            </p>
            )}
            
            <div className="flex space-x-2">
            {event.url ? (
                <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 rounded-lg transition-all duration-300 flex items-center justify-center"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit
                </a>
            ) : (
                <div className="flex-1"></div>
            )}
            <button
                onClick={() => onDelete(event.id)}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
            </button>
            </div>
        </div>
        </div>
    );
};

export default EventCard;