import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]); 
  const [recommended, setRecommended] = useState([]); 
  const [savedEvents, setSavedEvents] = useState([]);
  const [country, setCountry] = useState('SG');
  const [inputCode, setInputCode] = useState('SG');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  //& recommended events: format using local time so promoter published time is preserved
  const formatRecommendedEventDateTime = (event) => {
    //~ event.event_date if avail, else fallback event.date
    const dateStr = event.event_date || event.date;
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    const day = dateObj.getDate();
    const monthIndex = dateObj.getMonth();
    const year = dateObj.getFullYear();
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    //~ mins formatting
    const trimmedTime = minutes === 0 ? `${hours} ${ampm}` : `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
    return `${day} ${monthNames[monthIndex]} ${year}, ${trimmedTime}`;
  };

  //& external events: format using local time as provided by the API
  const formatExternalEventDateTime = (event) => {
    let dateStr = null;
    if (event.dates && event.dates.start) {
      dateStr = event.dates.start.dateTime || event.dates.start.localDate;
    } else if (event.startDate) {
      dateStr = event.startDate;
    } else if (event.date) {
      dateStr = event.date;
    }
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    const day = dateObj.getDate();
    const monthIndex = dateObj.getMonth();
    const year = dateObj.getFullYear();
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const trimmedTime = minutes === 0 ? `${hours} ${ampm}` : `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
    return `${day} ${monthNames[monthIndex]} ${year}, ${trimmedTime}`;
  };

  //& event image extraction helper.
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
        if (response.data) {
          if (response.data.external_events && response.data.external_events.length > 0) {
            setEvents(response.data.external_events);
          } else {
            toast.info('No external events found from external sources');
            setEvents([]);
          }
          if (response.data.recommended_events && response.data.recommended_events.length > 0) {
            setRecommended(response.data.recommended_events);
          }
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to fetch events');
      }
    };
    fetchEvents();
  }, [country]);

  //& fetch saved events on load & also when recommended events update
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
  }, [user, recommended]);

  //& handle save event, persist via API endpoint
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
        title: eventData.title || eventData.name, //~ use title; fallback to name.
        location: eventData._embedded && eventData._embedded.venues
          ? eventData._embedded.venues[0].name
          : (typeof eventData.location === 'object' && eventData.location !== null
              ? eventData.location.name
              : eventData.location || 'N/A'),
        //~ prefer eventData.event_date for promoter events; otherwise use external date info
        date: eventData.event_date ||
              (eventData.dates && eventData.dates.start
                ? (eventData.dates.start.dateTime || eventData.dates.start.localDate)
                : (eventData.startDate || eventData.date || null)),
        url: eventData.url || '',
        image: getEventImage(eventData) || ''
      };
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/events/save`,
        payload,
        { withCredentials: true }
      );
      if (response.data && response.data.event) {
        setSavedEvents(prev => [...prev, response.data.event]);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error saving event:', error.response.data);
      toast.error(error.response.data.error || 'Failed to save event');
    }
  };

  //& handle delete saved event.
  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_BASE_URL}/events/delete/${eventId}`, { withCredentials: true });
      if (response.data && response.data.message) {
        toast.success(response.data.message);
        setSavedEvents(prev => prev.filter(e => e.id !== eventId));
      }
    } catch (error) {
      console.error('Error deleting event:', error.response?.data || error);
      toast.error(error.response?.data?.error || 'Failed to delete event');
    }
  };

  //& pagination logic.
  const totalPages = Math.ceil(events.length / itemsPerPage);
  const paginatedEvents = events.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  //& country search handler.
  const handleCountrySearch = () => {
    setCountry(inputCode.toUpperCase());
    setCurrentPage(1);
  };

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-6">Events</h1>
      
      {/* Recommended */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Recommended</h2>
        {user && user.role !== 'guest' ? (
          recommended.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommended.map(event => (
                <div key={event.id} className="border rounded p-4 bg-gray-800 shadow">
                  <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-xl font-bold mb-2 block hover:text-green-500">
                    {event.title}
                  </a>
                  {getEventImage(event) && (
                    <img src={getEventImage(event)} alt={event.title} className="mb-2 w-full h-auto rounded" />
                  )}
                  <p className="mb-1">
                    <strong>Location:</strong> {event.location}
                  </p>
                  <p className="mb-2">
                    <strong>Date:</strong> {formatRecommendedEventDateTime(event)}
                  </p>
                  <button
                    onClick={() => handleSaveEvent(event)}
                    className="mt-2 bg-green-500 hover:bg-green-600 px-3 py-1 rounded"
                  >
                    Save
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No recommended events available.</p>
          )
        ) : (
          <p>You need to be authenticated with Spotify and a Re-Wrapped user to be able to see tailored events based on your interests.</p>
        )}
      </section>
      
      {/* Event Listings */}
      <section className="mb-4">
        <h2 className="text-2xl font-semibold mb-4">Event Listings</h2>
        <div className="mb-4 flex items-center">
          <label className="mr-2 font-semibold">Enter 2-letter Country ISO Code:</label>
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="e.g. SG"
            className="bg-gray-800 text-green-500 text-xl p-1 rounded border border-gray-800 focus:border-green-500 focus:outline-none w-20"
            maxLength={2}
          />
          <button onClick={handleCountrySearch} className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded">
            Search
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedEvents.length > 0 ? (
            paginatedEvents.map(event => (
              <div key={event.id} className="border rounded p-4 bg-gray-800 shadow">
                <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-xl font-bold mb-2 block hover:text-green-500">
                  {event.name}
                </a>
                {getEventImage(event) && (
                  <img src={getEventImage(event)} alt={event.name} className="mb-2 w-full h-auto rounded" />
                )}
                <p className="mb-1">
                  <strong>Location:</strong> {event._embedded && event._embedded.venues
                    ? event._embedded.venues[0].name
                    : (typeof event.location === 'object' && event.location !== null
                        ? event.location.name
                        : event.location || 'N/A')}
                </p>
                <p className="mb-2">
                  <strong>Date:</strong> {formatExternalEventDateTime(event)}
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
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="self-center">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
      
      {/* Saved Listings */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">My Saved Listings</h2>
        {user ? (
          user.role !== 'guest' ? (
            savedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedEvents.map(event => (
                  <div key={event.id} className="border rounded p-4 bg-gray-800 shadow">
                    <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-xl font-bold mb-2 block hover:text-green-500">
                      {event.name}
                    </a>
                    {event.image && (
                      <img src={event.image} alt={event.name} className="mb-2 w-full h-auto rounded" />
                    )}
                    <p className="mb-1">
                      <strong>Location:</strong> {event._embedded && event._embedded.venues
                        ? event._embedded.venues[0].name
                        : (typeof event.location === 'object' && event.location !== null
                            ? event.location.name
                            : event.location || 'N/A')}
                    </p>
                    <p className="mb-2">
                      <strong>Date:</strong> {formatRecommendedEventDateTime(event)}
                    </p>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="mt-2 bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                    >
                      Delete
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