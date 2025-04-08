import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
        try {
            setLoading(true);
            //~ use existing API function to get user data
            const response = await getCurrentUser();
            if (response && response.user) {
            localStorage.setItem('userProfile', JSON.stringify(response.user));
            setUser(response.user);
            }
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

        fetchUserProfile();
    }, []);

    return (
        <UserContext.Provider value={{ spotifyUser: user, spotifyLoading: loading }}>
        {children}
        </UserContext.Provider>
    );
};

export default UserContext;