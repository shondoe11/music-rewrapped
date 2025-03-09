import React, { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
    //~ initially, user null until oauth true
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (token && !user) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );
                const decodedUser = JSON.parse(jsonPayload);
                setUser(decodedUser);
            } catch (err) {
                console.error("Invalid JWT token:", err);
            }
        }
    }, [user]);

    const login = (userData) => {
        //~ store user data after auth success
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};