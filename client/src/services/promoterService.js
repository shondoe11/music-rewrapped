import apiClient from '../client';

//& get all events for promoter
export const getPromoterEvents = async (userId) => {
    try {
        const response = await apiClient.get(`/events/promoter?user_id=${userId}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to fetch promoter events');
    }
};

//& create new promoter event
export const createPromoterEvent = async (eventData) => {
    try {
        const response = await apiClient.post('/events/promoter', eventData);
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to create promoter event');
    }
};

//& update existing promoter event
export const updatePromoterEvent = async (eventId, eventData) => {
    try {
        const response = await apiClient.put(`/events/promoter/${eventId}`, eventData);
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to update promoter event');
    }
};

//& delete promoter event
export const deletePromoterEvent = async (eventId) => {
    try {
        const response = await apiClient.delete(`/events/promoter/${eventId}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to delete promoter event');
    }
};

//& helper fr contextual error handling
const createContextualError = (error, context) => {
    const enhancedError = new Error(`${context}: ${error.message}`);
    enhancedError.status = error.status;
    enhancedError.originalError = error.originalError || error;
    enhancedError.response = error.response;
    enhancedError.isApiError = true;
    return enhancedError;
};

export default {
    getPromoterEvents,
    createPromoterEvent,
    updatePromoterEvent,
    deletePromoterEvent
};