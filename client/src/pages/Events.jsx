import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { getAllEvents, getSavedEvents, saveEvent, deleteEvent } from '../api';
import Loader from '../styles/Loader';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]); 
  const [recommended, setRecommended] = useState([]); 
  const [savedEvents, setSavedEvents] = useState([]);
  const [country, setCountry] = useState('SG');
  const [inputCode, setInputCode] = useState('SG');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  //& loading states
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(true);

  //& recommended events: format using local time so promoter published time preserved
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

  //& external events: local time from API + formatting
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

  //& event img extraction
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
      setLoadingEvents(true);
      setLoadingRecommended(true);
      try {
        const response = await getAllEvents(country);
        if (response) {
          if (response.external_events && response.external_events.length > 0) {
            setEvents(response.external_events);
          } else {
            toast.info('No external events found from external sources');
            setEvents([]);
          }
          if (response.recommended_events && response.recommended_events.length > 0) {
            setRecommended(response.recommended_events);
          }
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to fetch events');
      } finally {
        setLoadingEvents(false);
        setLoadingRecommended(false);
      }
    };
    fetchEvents();
  }, [country]);

  //& fetch saved events on load + recommended events update
  useEffect(() => {
    const fetchSavedEvents = async () => {
      if (user && user.id) {
        setLoadingSaved(true);
        try {
          const response = await getSavedEvents(user.id);
          if (response && response.events) {
            setSavedEvents(response.events);
          }
        } catch (error) {
          console.error('Error fetching saved events:', error);
          toast.error('Failed to fetch saved events');
        } finally {
          setLoadingSaved(false);
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
        title: eventData.title || eventData.name, //~ use title; fallback name
        location: eventData._embedded && eventData._embedded.venues
          ? eventData._embedded.venues[0].name
          : (typeof eventData.location === 'object' && eventData.location !== null
              ? eventData.location.name
              : eventData.location || 'N/A'),
        //~ pref eventData.event_date fr promoter events; else use external date info
        date: eventData.event_date ||
              (eventData.dates && eventData.dates.start
                ? (eventData.dates.start.dateTime || eventData.dates.start.localDate)
                : (eventData.startDate || eventData.date || null)),
        url: eventData.url || '',
        image: getEventImage(eventData) || '',
        details: eventData.details || ''
      };
      
      const response = await saveEvent(payload);
      if (response && response.event) {
        setSavedEvents(prev => [...prev, response.event]);
        toast.success(response.message);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(error.response?.data?.error || 'Failed to save event');
    }
  };

  //& handle delete saved event
  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await deleteEvent(eventId);
      if (response && response.message) {
        toast.success(response.message);
        setSavedEvents(prev => prev.filter(e => e.id !== eventId));
      }
    } catch (error) {
      console.error('Error deleting event:', error.response?.data || error);
      toast.error(error.response?.data?.error || 'Failed to delete event');
    }
  };

  //& pagination logic
  const totalPages = Math.ceil(events.length / itemsPerPage);
  const paginatedEvents = events.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  //& country search handler
  const handleCountrySearch = () => {
    setCountry(inputCode.toUpperCase());
    setCurrentPage(1);
  };

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-6">Events</h1>
      
      {/* Recommended */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="group relative inline-block">
            <h2 className="text-4xl font-semibold">Recommended</h2>
            <span className="absolute left-0 -bottom-1 block h-0.5 bg-green-500 w-0 group-hover:w-full transition-all duration-300"></span>
          </div>
        </div>
        {user && user.role !== 'guest' ? (
          loadingRecommended ? (
            <div className="flex justify-center items-center h-60">
              <Loader />
            </div>
          ) : (
            recommended.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommended.map(event => (
                  <div key={event.id} className="border rounded p-4 bg-gray-800 shadow">
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-bold mb-2 block hover:text-green-500"
                    >
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
                    {event.details && (
                      <p className="mb-2">
                        <strong>Details:</strong> {event.details}
                      </p>
                    )}
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
          )
        ) : (
          <p>You need to be authenticated with Spotify and then register or log in to see tailored events based on your interests.</p>
        )}
      </section>
      
      {/* Event Listings */}
      <section className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="group relative inline-block">
            <h2 className="text-4xl font-semibold">Event Listings</h2>
            <span className="absolute left-0 -bottom-1 block h-0.5 bg-green-500 w-0 group-hover:w-full transition-all duration-300"></span>
          </div>
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
        </div>
        {loadingEvents ? (
          <div className="flex justify-center items-center h-60">
            <Loader />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedEvents.length > 0 ? (
              paginatedEvents.map(event => (
                <div key={event.id} className="border rounded p-4 bg-gray-800 shadow">
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl font-bold mb-2 block hover:text-green-500"
                  >
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
                  {event.details && (
                    <p className="mb-2">
                      <strong>Details:</strong> {event.details}
                    </p>
                  )}
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
        )}
      </section>
      
      {/* Pagination */}
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
            loadingSaved ? (
              <div className="flex justify-center items-center h-60">
                <Loader />
              </div>
            ) : (
              savedEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedEvents.map(event => (
                    <div key={event.id} className="border rounded p-4 bg-gray-800 shadow">
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl font-bold mb-2 block hover:text-green-500"
                      >
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
                      {event.details && (
                        <p className="mb-2">
                          <strong>Details:</strong> {event.details}
                        </p>
                      )}
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