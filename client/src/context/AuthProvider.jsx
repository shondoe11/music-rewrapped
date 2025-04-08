import React, { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  //& store token w cross-browser compatibility
  const storeToken = (token) => {
    try {
      localStorage.setItem('jwt_token', token);
    } catch (e) {
      console.warn('localStorage failed, trying sessionStorage', e);
      try {
        sessionStorage.setItem('jwt_token', token);
      } catch (e) {
        console.error('All storage methods failed', e);
      }
    }
    
    //~ also set as regular cookie fr Safari/Firefox
    document.cookie = `jwt_token=${token}; path=/; max-age=${60*60*24}; SameSite=Lax`;
  };

  //& get token frm any avail storage method
  const getToken = () => {
    let token = localStorage.getItem('jwt_token');
    
    if (!token) {
      token = sessionStorage.getItem('jwt_token');
    }
    
    if (!token) {
      const match = document.cookie.match(new RegExp('(^| )jwt_token=([^;]+)'));
      if (match) token = match[2];
    }
    
    return token;
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
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
  }, []); //~ run only once on mount

  const login = (userData, token) => {
    if (token) {
      storeToken(token);
    }
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jwt_token');
    sessionStorage.removeItem('jwt_token');
    document.cookie = 'jwt_token=; path=/; max-age=0';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, storeToken, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};