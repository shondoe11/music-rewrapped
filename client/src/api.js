const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function getSpotifyTopTracks() {
    const response = await fetch(`${BASE_URL}/spotify/top-tracks`);
    if (!response.ok) {
        throw new Error('Failed to fetch top tracks');
    }
    return response.json();
}

export async function getRecentlyPlayed() {
    const response = await fetch(`${BASE_URL}/spotify/recently-played`)
    if (!response.ok) {
        throw new Error('Failed to fetch recently played tracks');
    }
    return response.json();
}

export async function listEvents() {
    const response = await fetch(`${BASE_URL}/events/list`);
    if (!response.ok) {
        throw new Error('Failed to fetch events');
    }
    return response.json();
}