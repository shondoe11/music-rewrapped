import apiClient from '../client';

//& track event view
export const trackEventView = async (eventId) => {
    try {
        const response = await apiClient.post(`/events/track/view/${eventId}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to track event view');
    }
};

//& get promoter analytics data
export const getPromoterAnalytics = async (userId) => {
    try {
        const response = await apiClient.get(`/events/analytics/promoter?user_id=${userId}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to fetch promoter analytics');
    }
};

//& get listening trends data
export const getListeningTrends = async (userId, timeFrame = 'daily', days = 30) => {
    try {
        const response = await apiClient.get(`/analytics/user/listening-trends?user_id=${userId}&time_frame=${timeFrame}&days=${days}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to fetch listening trends');
    }
};

//& get listening heatmap data
export const getListeningHeatmap = async (userId, days = 90) => {
    try {
        const response = await apiClient.get(`/analytics/user/listening-heatmap?user_id=${userId}&days=${days}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to fetch listening heatmap');
    }
};

//& fetch genre distribution data fr visualization
export const getGenreDistribution = async (userId, timeRange = 'medium_term') => {
    try {
        const response = await apiClient.get(`/analytics/user/genre-distribution?user_id=${userId}&time_range=${timeRange}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to fetch genre distribution');
    }
};

//& fetch artist-genre matrix data fr chord diagram
export const getArtistGenreMatrix = async (userId, timeRange = 'medium_term', limit = 10) => {
    try {
        const response = await apiClient.get(
            `/analytics/user/artist-genre-matrix?user_id=${userId}&time_range=${timeRange}&limit=${limit}`
        );
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to fetch artist-genre matrix');
    }
};

//& helper fr contextual err handling
const createContextualError = (error, context) => {
    const enhancedError = new Error(`${context}: ${error.message}`);
    enhancedError.status = error.status;
    enhancedError.originalError = error.originalError || error;
    enhancedError.response = error.response;
    enhancedError.isApiError = true;
    return enhancedError;
};

export default {
    trackEventView,
    getPromoterAnalytics,
    getListeningTrends,
    getListeningHeatmap,
    getGenreDistribution,
    getArtistGenreMatrix
};