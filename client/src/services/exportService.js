import apiClient from '../client';

export const exportEventAnalytics = async (eventId, userId, format = 'csv', days = 30) => {
    try {
        const response = await apiClient.get(
            `/events/export/analytics/${eventId}?user_id=${userId}&format=${format}&days=${days}`,
            { responseType: format === 'csv' ? 'blob' : 'json' }
        );

        if (format === 'csv') {
            //~ handle CSV DL
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `event_${eventId}_analytics.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            return { success: true };
        } else {
            //~ return JSON data
            return response.data;
        }
    } catch (error) {
        throw createContextualError(error, 'Failed to export event analytics');
    }
};

export const exportPromoterAnalytics = async (userId, format = 'csv') => {
    try {
        const response = await apiClient.get(
            `/events/export/analytics/promoter?user_id=${userId}&format=${format}`,
            { responseType: format === 'csv' ? 'blob' : 'json' }
        );

        if (format === 'csv') {
            //~ handle CSV DL
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `promoter_${userId}_analytics.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            return { success: true };
        } else {
            //~ return JSON data
            return response.data;
        }
    } catch (error) {
        throw createContextualError(error, 'Failed to export promoter analytics');
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
    exportEventAnalytics,
    exportPromoterAnalytics
};