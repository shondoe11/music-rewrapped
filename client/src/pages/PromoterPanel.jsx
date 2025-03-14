import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const PromoterPanel = () => {
  const { user } = useAuth();

  //& tabs: dashboard, submit, sponsored, analytics
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [promoterEvents, setPromoterEvents] = useState([]);
  const [sponsoredEvents, setSponsoredEvents] = useState([]);
  const [editingEventId, setEditingEventId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [eventForm, setEventForm] = useState({
    title: '',
    location: '',
    date: '',
    time: '',
    description: '',
    image: '',
    url: '',
    targetCountry: '',
    targetGenreInterest: '',
    targetArtistInterest: '',
    listeningThreshold: '',
    targetRoles: []
  });
  const [formErrors, setFormErrors] = useState({});

  //& effect: fetch promoter events when component mounts
  useEffect(() => {
    if (user && user.role === 'promoter') {
      axios.get(`${import.meta.env.VITE_BASE_URL}/events/promoter?user_id=${user.id}`, { withCredentials: true })
        .then(res => {
          if (res.data.events) {
            setPromoterEvents(res.data.events);
            setSponsoredEvents(res.data.events);
          }
        })
        .catch(err => {
          console.error('failed to fetch promoter events:', err);
          toast.error('failed to load your events');
        });
    }
  }, [user]);

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    setEditingEventId(null);
  };

  const handleEventInputChange = (e) => {
    setEventForm({ ...eventForm, [e.target.name]: e.target.value });
  };

  //& target role
  const handleTargetRoleChange = (role) => {
    const currentRoles = eventForm.targetRoles;
    if (currentRoles.includes(role)) {
      setEventForm({ ...eventForm, targetRoles: currentRoles.filter(r => r !== role) });
    } else {
      setEventForm({ ...eventForm, targetRoles: [...currentRoles, role] });
    }
  };

  const validateEventForm = () => {
    const errors = {};
    if (!eventForm.title) errors.title = 'Title is required';
    if (!eventForm.location) errors.location = 'Location is required';
    if (!eventForm.date) errors.date = 'Date is required';
    if (!eventForm.time) errors.time = 'Time is required';
    return errors;
  };

  const handleSubmitEvent = (e) => {
    e.preventDefault();
    //~ make sure user is loaded before using user.id
    if (!user) {
      toast.error('user not loaded. please log in.');
      return;
    }
    const errors = validateEventForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('please fix form errors');
      return;
    }
    setFormErrors({});
    axios.post(`${import.meta.env.VITE_BASE_URL}/events/promoter`, { ...eventForm, user_id: user.id }, { withCredentials: true })
      .then(res => {
        if (res.data.message) {
          toast.success(res.data.message);
          setPromoterEvents(prev => [...prev, res.data.event]);
          setSponsoredEvents(prev => [...prev, res.data.event]);
          setEventForm({
            title: '',
            location: '',
            date: '',
            time: '',
            description: '',
            image: '',
            url: '',
            targetCountry: '',
            targetGenreInterest: '',
            targetArtistInterest: '',
            listeningThreshold: '',
            targetRoles: []
          });
        } else {
          toast.error(res.data.error || 'event submission failed');
        }
      })
      .catch(err => {
        console.error('event submission error:', err);
        toast.error('event submission failed');
      });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdateEvent = (eventId) => {
    axios.put(`${import.meta.env.VITE_BASE_URL}/events/promoter/${eventId}`, { ...editForm, user_id: user.id }, { withCredentials: true })
      .then(res => {
        if (res.data.message) {
          toast.success(res.data.message);
          setSponsoredEvents(prev => prev.map(ev => ev.id === eventId ? res.data.event : ev));
          setEditingEventId(null);
        } else {
          toast.error(res.data.error || 'update failed');
        }
      })
      .catch(err => {
        console.error('update error:', err);
        toast.error('update failed');
      });
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('are you sure you want to delete this event?')) {
      axios.delete(`${import.meta.env.VITE_BASE_URL}/events/promoter/${eventId}`, { withCredentials: true })
        .then(res => {
          if (res.data.message) {
            toast.success(res.data.message);
            setSponsoredEvents(prev => prev.filter(ev => ev.id !== eventId));
            setPromoterEvents(prev => prev.filter(ev => ev.id !== eventId));
          } else {
            toast.error(res.data.error || 'deletion failed');
          }
        })
        .catch(err => {
          console.error('delete error:', err);
          toast.error('deletion failed');
        });
    }
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'dashboard':
        return (
          <div className="p-4">
            <h2 className="text-3xl font-semibold mb-4">Event Management Dashboard</h2>
            {promoterEvents.length === 0 ? (
              <p>No events submitted yet.</p>
            ) : (
              <table className="min-w-full bg-gray-800 text-green-500 rounded shadow">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Title</th>
                    <th className="py-2 px-4 border-b">Location</th>
                    <th className="py-2 px-4 border-b">Date</th>
                    <th className="py-2 px-4 border-b">Status</th>
                    <th className="py-2 px-4 border-b">Views</th>
                    <th className="py-2 px-4 border-b">Saves</th>
                    <th className="py-2 px-4 border-b">Tags</th>
                    <th className="py-2 px-4 border-b">Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {promoterEvents.map((event, idx) => (
                    <tr key={idx} className="text-center">
                      <td className="py-2 px-4 border-b">{event.title}</td>
                      <td className="py-2 px-4 border-b">{event.location}</td>
                      <td className="py-2 px-4 border-b">
                        {new Date(event.event_date).toLocaleDateString()} {new Date(event.event_date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
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
            )}
          </div>
        );
      case 'submit':
        return (
          <div className="p-4">
            <h2 className="text-3xl font-semibold mb-4">New Event</h2>
            <form onSubmit={handleSubmitEvent} className="space-y-4">
              <div>
                <label className="block mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={eventForm.title}
                  onChange={handleEventInputChange}
                  className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
                />
                {formErrors.title && <p className="text-red-500 text-sm">{formErrors.title}</p>}
              </div>
              <div>
                <label className="block mb-1">Event Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={eventForm.image}
                  onChange={handleEventInputChange}
                  className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
                  placeholder="valid image url"
                />
              </div>
              <div>
                <label className="block mb-1">Event URL</label>
                <input
                  type="text"
                  name="url"
                  value={eventForm.url}
                  onChange={handleEventInputChange}
                  className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
                  placeholder="valid event url"
                />
              </div>
              <div>
                <label className="block mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={eventForm.location}
                  onChange={handleEventInputChange}
                  className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
                />
                {formErrors.location && <p className="text-red-500 text-sm">{formErrors.location}</p>}
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={eventForm.date}
                    onChange={handleEventInputChange}
                    className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
                  />
                  {formErrors.date && <p className="text-red-500 text-sm">{formErrors.date}</p>}
                </div>
                <div className="w-1/2">
                  <label className="block mb-1">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={eventForm.time}
                    onChange={handleEventInputChange}
                    className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
                  />
                  {formErrors.time && <p className="text-red-500 text-sm">{formErrors.time}</p>}
                </div>
              </div>
              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  name="description"
                  value={eventForm.description}
                  onChange={handleEventInputChange}
                  className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
                ></textarea>
              </div>
              <div>
                <label className="block mb-1">Target Country</label>
                <input
                  type="text"
                  name="targetCountry"
                  value={eventForm.targetCountry}
                  onChange={handleEventInputChange}
                  className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
                  placeholder="e.g., us"
                />
              </div>
              <div>
                <label className="block mb-1">Target Genre Interest (comma-separated)</label>
                <input
                  type="text"
                  name="targetGenreInterest"
                  value={eventForm.targetGenreInterest}
                  onChange={handleEventInputChange}
                  className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
                  placeholder="e.g., rock, pop"
                />
              </div>
              <div>
                <label className="block mb-1">Target Artist Interest (comma-separated)</label>
                <input
                  type="text"
                  name="targetArtistInterest"
                  value={eventForm.targetArtistInterest}
                  onChange={handleEventInputChange}
                  className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
                  placeholder="e.g., the beatles, taylor swift"
                />
              </div>
              <div>
                <label className="block mb-1">Listening Threshold</label>
                <input
                  type="number"
                  name="listeningThreshold"
                  value={eventForm.listeningThreshold}
                  onChange={handleEventInputChange}
                  className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
                  placeholder="number of listens required (e.g., 10)"
                />
                <p className="text-xs text-gray-500">
                  This threshold indicates the minimum number of times a user must have listened to be considered.
                </p>
              </div>
              <div>
                <label className="block mb-1">Target Role</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="targetRoles"
                    value="guest"
                    checked={eventForm.targetRoles.includes('guest')}
                    onChange={() => handleTargetRoleChange('guest')}
                    className="mr-2"
                  />
                  <span className="mr-4">Guest</span>
                  <input
                    type="checkbox"
                    name="targetRoles"
                    value="regular"
                    checked={eventForm.targetRoles.includes('regular')}
                    onChange={() => handleTargetRoleChange('regular')}
                    className="mr-2"
                  />
                  <span>Regular</span>
                </div>
                <p className="text-xs text-gray-500">
                  Select target roles to specify which users to target.
                </p>
              </div>
              <button type="submit" className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
                Submit Event
              </button>
            </form>
          </div>
        );
      case 'sponsored':
        return (
          <div className="p-4">
            <h2 className="text-3xl font-semibold mb-4">My Events</h2>
            {sponsoredEvents.length === 0 ? (
              <p>No sponsored events available.</p>
            ) : (
              <ul className="space-y-4">
                {sponsoredEvents.map((event, idx) => (
                  <li key={idx} className="p-4 bg-gray-800 rounded shadow">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xl font-semibold">{event.title}</h4>
                        <p>
                          {event.location} | {new Date(event.event_date).toLocaleDateString()} {new Date(event.event_date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                        </p>
                        {event.details && (
                          <p className="mt-1">{event.details}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setEditingEventId(event.id);
                            setEditForm({
                              title: event.title,
                              location: event.location,
                              date: event.event_date ? event.event_date.split('T')[0] : '',
                              time: event.event_date ? event.event_date.split('T')[1].slice(0,5) : '',
                              details: event.details || '',
                              image: event.image || '',
                              url: event.url || '',
                              targetCountry: event.target_country || '',
                              targetGenreInterest: event.target_genre_interest || '',
                              targetArtistInterest: event.target_artist_interest || '',
                              listeningThreshold: event.listening_threshold || '',
                              targetRoles: event.target_roles || []
                            });
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                        >
                          Update
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {editingEventId === event.id && (
                      <div className="mt-4 p-4 bg-gray-700 rounded">
                        <h3 className="text-lg font-semibold mb-2">Edit Event Details</h3>
                        <div className="space-y-2">
                          <input 
                            type="text"
                            name="title"
                            value={editForm.title}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded border bg-gray-800 text-green-500"
                            placeholder="Title"
                          />
                          <input 
                            type="text"
                            name="location"
                            value={editForm.location}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded border bg-gray-800 text-green-500"
                            placeholder="Location"
                          />
                          <div className="flex gap-2">
                            <input 
                              type="date"
                              name="date"
                              value={editForm.date}
                              onChange={handleEditChange}
                              className="w-1/2 p-2 rounded border bg-gray-800 text-green-500"
                            />
                            <input 
                              type="time"
                              name="time"
                              value={editForm.time}
                              onChange={handleEditChange}
                              className="w-1/2 p-2 rounded border bg-gray-800 text-green-500"
                            />
                          </div>
                          <textarea 
                            name="details"
                            value={editForm.details}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded border bg-gray-800 text-green-500"
                            placeholder="Details"
                          ></textarea>
                          <input 
                            type="text"
                            name="image"
                            value={editForm.image}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded border bg-gray-800 text-green-500"
                            placeholder="Event Image URL"
                          />
                          <input 
                            type="text"
                            name="url"
                            value={editForm.url}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded border bg-gray-800 text-green-500"
                            placeholder="Event URL"
                          />
                          <input 
                            type="text"
                            name="targetCountry"
                            value={editForm.targetCountry}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded border bg-gray-800 text-green-500"
                            placeholder="Target Country"
                          />
                          <input 
                            type="text"
                            name="targetGenreInterest"
                            value={editForm.targetGenreInterest}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded border bg-gray-800 text-green-500"
                            placeholder="Target Genre Interest (comma-separated)"
                          />
                          <input 
                            type="text"
                            name="targetArtistInterest"
                            value={editForm.targetArtistInterest}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded border bg-gray-800 text-green-500"
                            placeholder="Target Artist Interest (comma-separated)"
                          />
                          <input 
                            type="number"
                            name="listeningThreshold"
                            value={editForm.listeningThreshold}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded border bg-gray-800 text-green-500"
                            placeholder="Listening Threshold"
                          />
                        </div>
                        <button 
                          onClick={() => handleUpdateEvent(event.id)}
                          className="mt-2 bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case 'analytics':
        return (
          <div className="p-4">
            <h2 className="text-3xl font-semibold mb-4">Feature in Development.</h2>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex">
        <aside className="w-64 bg-gray-800 p-4">
          <h1 className="text-2xl font-bold mb-6">Promoter Panel</h1>
          <nav className="space-y-4">
            {[
              { key: 'dashboard', label: 'Dashboard' },
              { key: 'submit', label: 'New Event' },
              { key: 'sponsored', label: 'My Events' },
              { key: 'analytics', label: 'Analytics' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`w-full text-left p-2 rounded ${selectedTab === tab.key ? 'bg-green-500' : 'hover:bg-gray-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default PromoterPanel;