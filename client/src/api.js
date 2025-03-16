import apiClient from './client';

//& helper fr handling errs w domain-specific context
const createContextualError = (error, context) => {
    const enhancedError = new Error(`${context}: ${error.message}`);
    enhancedError.status = error.status;
    enhancedError.originalError = error.originalError || error;
    enhancedError.response = error.response;
    enhancedError.isApiError = true;
    return enhancedError;
};

//* Home & Dashboard Data

export async function getHomeData(userId) {
    try {
        const response = await apiClient.get(`/home/data?user_id=${userId}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, `Failed to fetch home data for user ${userId}`);
    }
}

export async function getSpotifyTopTracks(userId, timeFrame) {
    try {
        const response = await apiClient.get(`/spotify/top-tracks?user_id=${userId}&time_frame=${timeFrame}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, `Failed to fetch top tracks for ${timeFrame}`);
    }
}

export async function getSpotifyTopAlbums(userId, timeFrame) {
    try {
        const response = await apiClient.get(`/spotify/top-albums?user_id=${userId}&time_frame=${timeFrame}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, `Failed to fetch top albums for ${timeFrame}`);
    }
}

export async function getSpotifyTopArtists(userId, timeFrame, limit = 12) {
    try {
        const response = await apiClient.get(`/spotify/top-artists?user_id=${userId}&time_frame=${timeFrame}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, `Failed to fetch top artists for ${timeFrame}`);
    }
}

export async function getRecentlyPlayed() {
    try {
        const response = await apiClient.get('/spotify/recently-played');
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to fetch recently played tracks');
    }
}

export async function listEvents() {
    try {
        const response = await apiClient.get('/events/list');
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to fetch events list');
    }
}

//* Auth API 

//& get current user data frm session
export async function getCurrentUser() {
    try {
        const response = await apiClient.get('/auth/user');
        return response.data;
    } catch (error) {
        //~ special handling for authentication errors
        if (error.status === 401) {
            const authError = createContextualError(error, 'Authentication required');
            authError.isAuthError = true;
            throw authError;
        }
        throw createContextualError(error, 'Failed to fetch current user');
    }
}

//& login w rewrapped creds
export async function login(username, password) {
    try {
        const response = await apiClient.post('/auth/rewrapped/login', { username, password });
        return response.data;
    } catch (error) {
        //~ special handling for login failures
        if (error.status === 401) {
            throw createContextualError(error, 'Invalid username or password');
        }
        throw createContextualError(error, 'Login failed');
    }
}

//& register new rewrapped accnt
export async function register(userData) {
    try {
        const response = await apiClient.post('/auth/rewrapped/register', userData);
        return response.data;
    } catch (error) {
        //~ special handling for registration errors
        if (error.status === 400 && error.response?.data?.error?.includes('exists')) {
            throw createContextualError(error, 'Username already exists');
        }
        throw createContextualError(error, 'Registration failed');
    }
}

//& logout & clear sesh
export async function logout() {
    try {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    } catch (error) {
        //~ fr logout, to clear local state even if server logout fails
        console.error('Logout error:', error);
        throw createContextualError(error, 'Logout failed on server but local session cleared');
    }
}

//& change user pw
export async function changePassword(userId, currentPassword, newPassword) {
    try {
        const response = await apiClient.post('/auth/change-password', {
            user_id: userId,
            currentPassword,
            newPassword
        });
        return response.data;
    } catch (error) {
        //~ special handling for password change errors
        if (error.status === 400) {
            throw createContextualError(error, 'Password change failed: invalid current password');
        }
        throw createContextualError(error, 'Failed to change password');
    }
}

//& get user prefs
export async function getUserPreferences(userId) {
    try {
        const response = await apiClient.get(`/auth/user/preferences?user_id=${userId}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to fetch user preferences');
    }
}

//& update user prefs
export async function updateUserPreferences(userId, preferences) {
    try {
        const response = await apiClient.post('/auth/user/preferences', {
            user_id: userId,
            ...preferences
        });
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to update user preferences');
    }
}

//* Spotify API

//& get top artists w genres fr genre evolution chart (use higher limit)
export async function getSpotifyTopArtistsWithGenres(userId, timeFrame, limit = 50) {
    try {
        const response = await apiClient.get(`/spotify/top-artists?user_id=${userId}&time_frame=${timeFrame}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to fetch top artists with genre data');
    }
}

//* Events API

//& get all events w optional country filter
export async function getAllEvents(countryCode = 'SG') {
    try {
        const response = await apiClient.get(`/events/all?countryCode=${countryCode}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, `Failed to fetch events for country ${countryCode}`);
    }
}

//& get user saved events
export async function getSavedEvents(userId) {
    try {
        const response = await apiClient.get(`/events/saved?user_id=${userId}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to fetch saved events');
    }
}

//& save event fr 1 user
export async function saveEvent(eventData) {
    try {
        const response = await apiClient.post('/events/save', eventData);
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to save event');
    }
}

//& delete saved event
export async function deleteEvent(eventId) {
    try {
        const response = await apiClient.delete(`/events/delete/${eventId}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, `Failed to delete event ${eventId}`);
    }
}

//* Promoter API

//& get all sponsored events
export async function getPromoterEvents(userId) {
    try {
        const response = await apiClient.get(`/events/promoter?user_id=${userId}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to fetch promoter events');
    }
}

//& create promoter event
export async function createPromoterEvent(eventData) {
    try {
        const response = await apiClient.post('/events/promoter', eventData);
        return response.data;
    } catch (error) {
        throw createContextualError(error, 'Failed to create promoter event');
    }
}

//& update promoter event
export async function updatePromoterEvent(eventId, eventData) {
    try {
        const response = await apiClient.put(`/events/promoter/${eventId}`, eventData);
        return response.data;
    } catch (error) {
        throw createContextualError(error, `Failed to update promoter event ${eventId}`);
    }
}

//& delete promoter event
export async function deletePromoterEvent(eventId) {
    try {
        const response = await apiClient.delete(`/events/promoter/${eventId}`);
        return response.data;
    } catch (error) {
        throw createContextualError(error, `Failed to delete promoter event ${eventId}`);
    }
}