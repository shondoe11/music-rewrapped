import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const NewEventForm = ({ onEventAdded }) => {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = (data) => {
    if (!user || !user.id) {
      toast.error("User not authenticated");
      return;
    }
    const payload = { ...data, user_id: user.id };
    axios.post(`${import.meta.env.VITE_BASE_URL}/events/promoter`, payload, { withCredentials: true })
      .then((res) => {
        if (res.data.message) {
          toast.success(res.data.message);
          onEventAdded(res.data.event);
          reset();
        } else {
          toast.error(res.data.error || 'Event submission failed');
        }
      })
      .catch((err) => {
        console.error('Event submission error:', err);
        toast.error('Event submission failed');
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block mb-1">Title</label>
        <input
          type="text"
          {...register("title", { required: "Title is required" })}
          className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>
      <div>
        <label className="block mb-1">Event Image URL</label>
        <input
          type="text"
          {...register("image", {  
            pattern: { 
              value: /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i,
              message: "Enter a valid image URL"
            }
          })}
          className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
          placeholder="Valid image URL"
        />
        {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
      </div>
      <div>
        <label className="block mb-1">Event URL</label>
        <input
          type="text"
          {...register("url", { 
            pattern: { 
              value: /^(https?:\/\/[^\s]+)$/i,
              message: "Enter a valid event URL"
            }
          })}
          className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
          placeholder="Valid event URL"
        />
        {errors.url && <p className="text-red-500 text-sm">{errors.url.message}</p>}
      </div>
      <div>
        <label className="block mb-1">Location</label>
        <input
          type="text"
          {...register("location", { required: "Location is required" })}
          className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
        />
        {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
      </div>
      <div className="flex gap-4">
        <div className="w-1/2">
          <label className="block mb-1">Date</label>
          <input
            type="date"
            {...register("date", { required: "Date is required" })}
            className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
          />
          {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
        </div>
        <div className="w-1/2">
          <label className="block mb-1">Time</label>
          <input
            type="time"
            {...register("time", { required: "Time is required" })}
            className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
          />
          {errors.time && <p className="text-red-500 text-sm">{errors.time.message}</p>}
        </div>
      </div>
      <div>
        <label className="block mb-1">Description</label>
        <textarea
          {...register("description")}
          className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
          placeholder="Event description"
        ></textarea>
      </div>
      {/* Additional Targeting Fields */}
      <div>
        <label className="block mb-1">Target Country</label>
        <input
          type="text"
          {...register("targetCountry")}
          placeholder="e.g., us"
          className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block mb-1">Target Genre Interest (comma-separated)</label>
        <input
          type="text"
          {...register("targetGenreInterest")}
          placeholder="e.g., rock, pop"
          className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block mb-1">Target Artist Interest (comma-separated)</label>
        <input
          type="text"
          {...register("targetArtistInterest")}
          placeholder="e.g., the beatles, taylor swift"
          className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block mb-1">Listening Threshold</label>
        <input
          type="number"
          {...register("listeningThreshold")}
          placeholder="Number of listens required (e.g., 10)"
          className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
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
            {...register("targetRoles")}
            value="guest"
            className="mr-2"
          />
          <span className="mr-4">Guest</span>
          <input
            type="checkbox"
            {...register("targetRoles")}
            value="regular"
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
  );
};

const UpdateEventForm = ({ event, onUpdated }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      title: event.title,
      location: event.location,
      date: event.event_date ? event.event_date.split('T')[0] : '',
      time: event.event_date ? event.event_date.split('T')[1].slice(0,5) : '',
      description: event.description || event.details || '',
      image: event.image || '',
      url: event.url || '',
      targetCountry: event.target_country || '',
      targetGenreInterest: event.target_genre_interest || '',
      targetArtistInterest: event.target_artist_interest || '',
      listeningThreshold: event.listening_threshold || '',
      targetRoles: event.target_roles || []
    }
  });

  useEffect(() => {
    reset({
      title: event.title,
      location: event.location,
      date: event.event_date ? event.event_date.split('T')[0] : '',
      time: event.event_date ? event.event_date.split('T')[1].slice(0,5) : '',
      description: event.description || event.details || '',
      image: event.image || '',
      url: event.url || '',
      targetCountry: event.target_country || '',
      targetGenreInterest: event.target_genre_interest || '',
      targetArtistInterest: event.target_artist_interest || '',
      listeningThreshold: event.listening_threshold || '',
      targetRoles: event.target_roles || []
    });
  }, [event, reset]);

  const onSubmit = (data) => {
    axios.put(`${import.meta.env.VITE_BASE_URL}/events/promoter/${event.id}`, { ...data, user_id: event.promoter_id }, { withCredentials: true })
      .then((res) => {
        if (res.data.message) {
          toast.success(res.data.message);
          onUpdated(res.data.event);
        } else {
          toast.error(res.data.error || 'Update failed');
        }
      })
      .catch((err) => {
        console.error('Update error:', err);
        toast.error('Update failed');
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <input
        type="text"
        {...register("title", { required: "Title is required" })}
        placeholder="Title"
        className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
      />
      {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      <input
        type="text"
        {...register("location", { required: "Location is required" })}
        placeholder="Location"
        className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
      />
      {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
      <div className="flex gap-2">
        <input
          type="date"
          {...register("date", { required: "Date is required" })}
          className="w-1/2 p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
        />
        {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
        <input
          type="time"
          {...register("time", { required: "Time is required" })}
          className="w-1/2 p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
        />
        {errors.time && <p className="text-red-500 text-sm">{errors.time.message}</p>}
      </div>
      <input
        type="text"
        {...register("image", {
          pattern: {
            value: /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i,
            message: "Enter a valid image URL"
          }
        })}
        placeholder="Event Image URL"
        className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
      />
      {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
      <input
        type="text"
        {...register("url", {
          pattern: {
            value: /^(https?:\/\/[^\s]+)$/i,
            message: "Enter a valid event URL"
          }
        })}
        placeholder="Event URL"
        className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
      />
      {errors.url && <p className="text-red-500 text-sm">{errors.url.message}</p>}
      <textarea
        {...register("description")}
        placeholder="Description"
        className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
      ></textarea>
      {/* Additional targeting fields */}
      <input
        type="text"
        {...register("targetCountry")}
        placeholder="Target Country (e.g., us)"
        className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
      />
      <input
        type="text"
        {...register("targetGenreInterest")}
        placeholder="Target Genre Interest (comma-separated)"
        className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
      />
      <input
        type="text"
        {...register("targetArtistInterest")}
        placeholder="Target Artist Interest (comma-separated)"
        className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
      />
      <div>
        <input
          type="number"
          {...register("listeningThreshold")}
          placeholder="Listening Threshold (e.g., 10)"
          className="w-full p-2 rounded border bg-gray-800 text-green-500 focus:border-green-500 focus:outline-none"
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
            {...register("targetRoles")}
            value="guest"
            className="mr-2"
          />
          <span className="mr-4">Guest</span>
          <input
            type="checkbox"
            {...register("targetRoles")}
            value="regular"
            className="mr-2"
          />
          <span>Regular</span>
        </div>
        <p className="text-xs text-gray-500">
          Select target roles to specify which users to target.
        </p>
      </div>
      <button type="submit" className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded">
        Save Changes
      </button>
    </form>
  );
};

const PromoterPanel = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [promoterEvents, setPromoterEvents] = useState([]);
  const [sponsoredEvents, setSponsoredEvents] = useState([]);
  const [editingEventId, setEditingEventId] = useState(null);

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    setEditingEventId(null);
  };

  const updateEventInState = (updatedEvent) => {
    setSponsoredEvents(prev =>
      prev.map(ev => (ev.id === updatedEvent.id ? updatedEvent : ev))
    );
  };

  const deleteEventFromState = (eventId) => {
    setSponsoredEvents(prev => prev.filter(ev => ev.id !== eventId));
  };

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
          console.error('Failed to fetch promoter events:', err);
          toast.error('Failed to load your events');
        });
    }
  }, [user]);

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
            )}
          </div>
        );
      case 'submit':
        return (
          <div className="p-4">
            <h2 className="text-3xl font-semibold mb-4">New Event</h2>
            <NewEventForm onEventAdded={(newEv) => {
              setPromoterEvents(prev => [...prev, newEv]);
              setSponsoredEvents(prev => [...prev, newEv]);
              setSelectedTab('sponsored');
            }} />
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
                {sponsoredEvents.map((event) => (
                  <li key={event.id} className="p-4 bg-gray-800 rounded shadow">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xl font-semibold">{event.title}</h4>
                        <p>
                          {event.location} | {new Date(event.event_date).toLocaleDateString()} {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this event?')) {
                              axios.delete(`${import.meta.env.VITE_BASE_URL}/events/promoter/${event.id}`, { withCredentials: true })
                                .then(res => {
                                  if (res.data.message) {
                                    toast.success(res.data.message);
                                    deleteEventFromState(event.id);
                                  } else {
                                    toast.error(res.data.error || 'Deletion failed');
                                  }
                                })
                                .catch(err => {
                                  console.error('Delete error:', err);
                                  toast.error('Deletion failed');
                                });
                            }
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {editingEventId === event.id && (
                      <div className="mt-4 p-4 bg-gray-700 rounded">
                        <h3 className="text-lg font-semibold mb-2">Edit Event Details</h3>
                        <UpdateEventForm event={event} onUpdated={(updatedEv) => {
                          updateEventInState(updatedEv);
                          setEditingEventId(null);
                        }} />
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