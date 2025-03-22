import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
    getPromoterEvents,
    createPromoterEvent,
    updatePromoterEvent,
    deletePromoterEvent
} from '../services/promoterService';

const usePromoterEvents = (userId) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingEventId, setEditingEventId] = useState(null);

    //& fetch all events fr promoter
    const fetchEvents = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const response = await getPromoterEvents(userId);
            if (response && response.events) {
                setEvents(response.events);
            }
            setError(null);
        } catch (error) {
            console.error('Failed to fetch promoter events:', error);
            setError('Failed to load your events');
            toast.error('Failed to load your events');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    //& initialize fetching events
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    //& create new event
    const addEvent = async (eventData) => {
        try {
            const response = await createPromoterEvent({ ...eventData, user_id: userId });
            if (response.event) {
                setEvents(prevEvents => [...prevEvents, response.event]);
                toast.success(response.message || 'Event created successfully');
                return response.event;
            }
        } catch (error) {
            console.error('Event submission error:', error);
            toast.error('Event submission failed');
            throw error;
        }
    };

    //& update existing event
    const updateEvent = async (eventId, eventData) => {
        try {
            const response = await updatePromoterEvent(eventId, { ...eventData, user_id: userId });
            if (response.event) {
                setEvents(prevEvents =>
                    prevEvents.map(event => event.id === eventId ? response.event : event)
                );
                toast.success(response.message || 'Event updated successfully');
                return response.event;
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Update failed');
            throw error;
        }
    };

    //& delete event
    const removeEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) {
            return;
        }

        try {
            const response = await deletePromoterEvent(eventId);
            if (response) {
                setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
                toast.success(response.message || 'Event deleted successfully');
                return true;
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Deletion failed');
            throw error;
        }
    };

    return {
        events,
        loading,
        error,
        fetchEvents,
        addEvent,
        updateEvent,
        removeEvent,
        editingEventId,
        setEditingEventId
    };
};

export default usePromoterEvents;