import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [country, setCountry] = useState('SG');
  const [inputCode, setInputCode] = useState('SG');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  //& helper function - extract event date as date object
  const getEventDate = (event) => {
    if (event.dates && event.dates.start) {
      if (event.dates.start.dateTime) {
        return new Date(event.dates.start.dateTime);
      } else if (event.dates.start.localDate) {
        return new Date(event.dates.start.localDate);
      }
    }
    if (event.startDate) {
      return new Date(event.startDate);
    }
    if (event.date) {
      return new Date(event.date);
    }
    return new Date();
  };

  //& date time formatter helper
  const formatEventDateTime = (event) => {
    const dateObj = getEventDate(event);
    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateFormatted = dateObj.toLocaleDateString(undefined, dateOptions);
    let timeFormatted = dateObj.toLocaleTimeString(undefined, { hour: 'numeric', hour12: true }).toUpperCase();
    //~ remove mins if === ":00"
    timeFormatted = timeFormatted.replace(/:00/, '');
    return `${dateFormatted}, ${timeFormatted}`;
  };

  //~ event img extraction helper
  const getEventImage = (event) => {
    if (event.images && event.images.length > 0) {
      return event.images[0].url;
    } else if (event.image) {
      return event.image;
    }
    return null;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const url = `${import.meta.env.VITE_BASE_URL}/events/all?countryCode=${country}`;
        const response = await axios.get(url, { withCredentials: true });
        if (response.data && response.data.events && response.data.events.length > 0) {
          const sortedEvents = response.data.events.sort(
            (a, b) => getEventDate(a) - getEventDate(b)
          );
          setEvents(sortedEvents);
          setCurrentPage(1); //~ reset page on new fetch
        } else {
          toast.info('No events found from external sources');
          setEvents([]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to fetch events');
      }
    };
    fetchEvents();
  }, [country]);

  useEffect(() => {
    const fetchSavedEvents = async () => {
      if (user && user.id) {
        try {
          const url = `${import.meta.env.VITE_BASE_URL}/events/saved?user_id=${user.id}`;
          const response = await axios.get(url, { withCredentials: true });
          if (response.data && response.data.events) {
            setSavedEvents(response.data.events);
          }
        } catch (error) {
          console.error('Error fetching saved events:', error);
          toast.error('Failed to fetch saved events');
        }
      }
    };
    fetchSavedEvents();
  }, [user]);

  //& handle save event; persist via API endpoint
  const handleSaveEvent = async (eventData) => {
    if (!user) {
      toast.error('Please authenticate with Spotify and then register or log in to save events.');
      return;
    }
    if (user.role === 'guest') {
      toast.error('To tag and save events, please register or log in to your Re-Wrapped account.');
      return;
    }
    try {
      const payload = {
        user_id: user.id,
        name: eventData.name,
        location: eventData._embedded && eventData._embedded.venues
          ? eventData._embedded.venues[0].name
          : (typeof eventData.location === 'object' && eventData.location !== null
              ? eventData.location.name
              : eventData.location || 'N/A'),
        date: eventData.dates && eventData.dates.start
          ? eventData.dates.start.localDate
          : (eventData.startDate || eventData.date || null),
        url: eventData.url || '',  //! include event url if provided
        image: getEventImage(eventData) || ''  //! store event image
      };
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/events/save`,
        payload,
        { withCredentials: true }
      );
      if (response.data && response.data.event) {
        setSavedEvents((prev) => [...prev, response.data.event]);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error saving event:', error.response.data);
      toast.error(error.response.data.error || 'Failed to save event');
    }
  };

  //& handle remove event; call backend to delete and update state
  const handleRemoveEvent = async (eventId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/events/delete/${eventId}`, { withCredentials: true });
      setSavedEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast.success('Event removed successfully');
    } catch (error) {
      console.error('Error removing event:', error.response.data);
      toast.error(error.response.data.error || 'Failed to remove event');
    }
  };

  const handleSearch = () => {
    if (inputCode && inputCode.length === 2) {
      setCountry(inputCode.toUpperCase());
    } else {
      toast.error('Please enter a valid 2-letter country ISO code');
    }
  };

  //& pagination logic
  const totalPages = Math.ceil(events.length / itemsPerPage);
  const paginatedEvents = events.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-6">Events</h1>
      
      {/* Country Filter Input */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Enter 2-letter Country ISO Code:</label>
        <input
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          placeholder="e.g. US, SG, GB"
          className="bg-gray-800 text-white p-2 rounded mr-2 w-min"
          maxLength={2}
        />
        <button
          onClick={handleSearch}
          className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded"
        >
          Search
        </button>
      </div>
      
      {/* Event Listings */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Event Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedEvents.length > 0 ? (
            paginatedEvents.map((event) => (
              <div key={event.id || event.identifier} className="border rounded p-4 bg-gray-800 shadow">
                <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-xl font-bold mb-2 block hover:text-green-500">
                  {event.name}
                </a>
                {getEventImage(event) && (
                  <img src={getEventImage(event)} alt={event.name} className="mb-2 w-full h-auto rounded" />
                )}
                <p className="mb-1">
                  <strong>Location:</strong>{' '}
                  {event._embedded && event._embedded.venues
                    ? event._embedded.venues[0].name
                    : (typeof event.location === 'object' && event.location !== null
                        ? event.location.name
                        : event.location || 'N/A')}
                </p>
                <p className="mb-2">
                  <strong>Date:</strong>{' '}
                  {formatEventDateTime(event)}
                </p>
                <button
                  onClick={() => handleSaveEvent(event)}
                  className="mt-2 bg-green-500 hover:bg-green-600 px-3 py-1 rounded"
                >
                  Save
                </button>
              </div>
            ))
          ) : (
            <p>No events available.</p>
          )}
        </div>
      </section>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="self-center">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
      
      {/* My Saved Listings */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">My Saved Listings</h2>
        {user ? (
          user.role !== 'guest' ? (
            savedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedEvents.map((event) => (
                  <div key={event.id} className="border rounded p-4 bg-gray-800 shadow">
                    <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-xl font-bold mb-2 block hover:text-green-500">
                      {event.name}
                    </a>
                    {getEventImage(event) && (
                      <img src={getEventImage(event)} alt={event.name} className="mb-2 w-full h-auto rounded" />
                    )}
                    <p className="mb-1">
                      <strong>Location:</strong>{' '}
                      {event._embedded && event._embedded.venues
                        ? event._embedded.venues[0].name
                        : (typeof event.location === 'object' && event.location !== null
                            ? event.location.name
                            : event.location || 'N/A')}
                    </p>
                    <p className="mb-2">
                      <strong>Date:</strong>{' '}
                      {formatEventDateTime(event)}
                    </p>
                    <button
                      onClick={() => handleRemoveEvent(event.id)}
                      className="mt-2 bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No saved events yet.</p>
            )
          ) : (
            <p>Please authenticate with Spotify and then register or log in to access saved events.</p>
          )
        ) : (
          <p>Please authenticate with Spotify and then register or log in to access saved events.</p>
        )}
      </section>
    </div>
  );
};

export default Events;