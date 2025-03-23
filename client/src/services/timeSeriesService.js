import apiClient from '../client';

export const getEventTimeSeries = async (eventId, userId, days = 30) => {
    try {
        const response = await apiClient.get(`/events/analytics/time-series/${eventId}?user_id=${userId}&days=${days}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to fetch event time series data');
    }
};

export const getPromoterTimeSeries = async (userId, days = 30) => {
    try {
        const response = await apiClient.get(`/events/analytics/time-series/promoter?user_id=${userId}&days=${days}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to fetch promoter time series data');
    }
};

const createContextualError = (error, context) => {
    const enhancedError = new Error(`${context}: ${error.message}`);
    enhancedError.status = error.status;
    enhancedError.originalError = error.originalError || error;
    enhancedError.response = error.response;
    enhancedError.isApiError = true;
    return enhancedError;
};

export default {
    getEventTimeSeries,
    getPromoterTimeSeries
};