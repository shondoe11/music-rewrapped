import React, { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children, initialToken }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  //& decode JWT and fetch user info
  const fetchUserFromToken = async (token) => {
    if (!token) return false;
    
    try {
      //~ decode token to get user_id
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const { user_id, exp } = JSON.parse(jsonPayload);
      
      //~ check if token expired
      if (exp && exp * 1000 < Date.now()) {
        console.warn('JWT token expired');
        return false;
      }
      
      //~ fetch full user data frm API
      try {
        console.log('Fetching user data from API');
        const response = await fetch('/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            console.log('User data fetched successfully:', data.user);
            setUser(data.user);
            return true;
          }
        } else {
          console.warn('Failed to fetch user data, status:', response.status);
        }
        
        //~ fallback to basic user if API call fails
        console.log('Using basic user info from token');
        setUser({ id: user_id });
        return true;
      } catch (err) {
        console.error("Error fetching user data:", err);
        //~ still set basic user so auth works
        setUser({ id: user_id });
        return true;
      }
    } catch (err) {
      console.error("Invalid JWT token:", err);
      return false;
    }
  };

  useEffect(() => {
    //& handle token during mount or initialToken changes
    const loadUser = async () => {
      setLoading(true);
      if (initialToken) {
        //~ token was explicitly passed (from URL extraction)
        console.log('Processing initialToken from URL');
        await fetchUserFromToken(initialToken);
      } else {
        //~ check fr stored token
        const token = getToken();
        if (token) {
          await fetchUserFromToken(token);
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, [initialToken]);

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
    <AuthContext.Provider value={{ user, login, logout, storeToken, getToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};