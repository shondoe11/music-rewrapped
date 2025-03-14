import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth(); //~ get current user and logout function
  const [isOpen, setIsOpen] = useState(false); //~ menu toggle state
  const navigate = useNavigate();
  const location = useLocation();

  //& hide auth links if on /spotify-login
  const hideAuthLinks = location.pathname === '/spotify-login';

  //& mobile menu toggle
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  //& handle logout: call server logout -> clear oauth session -> clear client auth state
  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('logout error:', error);
    }
    logout();
    navigate('/spotify-login');
  };

  return (
    <nav className="bg-gray-900 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold">
              Music Re-Wrapped
            </Link>
          </div>
          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/home" className="hover:text-green-500">
              Home
            </Link>
            <Link to="/events" className="hover:text-green-500">
              Events
            </Link>
            { !hideAuthLinks && user && user.role === 'promoter' && (
              <Link to="/promoter-panel" className="hover:text-green-500">
                Promoter Panel
              </Link>
            )}
            { !hideAuthLinks && user && (
              user.role !== 'guest' ? (
                <>
                  <Link to="/profile" className="hover:text-green-500">
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="hover:text-green-500">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/register" className="hover:text-green-500">
                  Upgrade Account
                </Link>
              )
            )}
          </div>
          {/* Mobile */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile dropdown */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/home" className="block px-3 py-2 rounded-md hover:bg-gray-700">
              Home
            </Link>
            <Link to="/events" className="block px-3 py-2 rounded-md hover:bg-gray-700">
              Events
            </Link>
            { !hideAuthLinks && user && user.role === 'promoter' && (
              <Link to="/promoter-panel" className="block px-3 py-2 rounded-md hover:bg-gray-700">
                Promoter Panel
              </Link>
            )}
            { !hideAuthLinks && user && (
              user.role !== 'guest' ? (
                <>
                  <Link to="/profile" className="block px-3 py-2 rounded-md hover:bg-gray-700">
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md hover:bg-gray-700">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/register" className="block px-3 py-2 rounded-md hover:bg-gray-700">
                  Upgrade Account
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;