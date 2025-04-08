import React, { createContext, useState, useEffect } from 'react';
import { getAccessToken } from '../utils/spotifyApi';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${getAccessToken()}`
            }
            });
            
            if (!response.ok) throw new Error('Failed to fetch user profile');
            const data = await response.json();
            localStorage.setItem('userProfile', JSON.stringify(data));
            setUser(data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            //~ fallback to localStorage
            const cachedProfile = localStorage.getItem('userProfile');
            if (cachedProfile) {
            setUser(JSON.parse(cachedProfile));
            }
        } finally {
            setLoading(false);
        }
        };

        if (getAccessToken()) {
        fetchUserProfile();
        } else {
        setLoading(false);
        }
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, setUser }}>
        {children}
        </UserContext.Provider>
    );
};

export default UserContext;