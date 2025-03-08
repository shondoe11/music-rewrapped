const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function getHomeData(userId) {
    const response = await fetch(`${BASE_URL}/home/data?user_id=${userId}`, {
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error('Failed to fetch home data');
    }
    return response.json();
}

export async function getSpotifyTopTracks(userId, timeFrame) {
    const response = await fetch(`${BASE_URL}/spotify/top-tracks?user_id=${userId}&time_frame=${timeFrame}`, {
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error('Failed to fetch top tracks from Spotify');
    }
    return response.json();
}

export async function getSpotifyTopAlbums(userId, timeFrame) {
    const response = await fetch(`${BASE_URL}/spotify/top-albums?user_id=${userId}&time_frame=${timeFrame}`, {
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error('Failed to fetch top albums from Spotify');
    }
    return response.json();
}

export async function getSpotifyTopArtists(userId, timeFrame) {
    const response = await fetch(`${BASE_URL}/spotify/top-artists?user_id=${userId}&time_frame=${timeFrame}&limit=12`, {
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error('Failed to fetch top artists from Spotify');
    }
    return response.json();
}

export async function getRecentlyPlayed() {
    const response = await fetch(`${BASE_URL}/spotify/recently-played`, {
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error('Failed to fetch recently played tracks');
    }
    return response.json();
}

export async function listEvents() {
    const response = await fetch(`${BASE_URL}/events/list`, {
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error('Failed to fetch events');
    }
    return response.json();
}