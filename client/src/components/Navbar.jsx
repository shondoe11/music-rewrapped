import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../api';

const Navbar = () => {
  const { user, logout: clearAuthState } = useAuth(); //~ get current user and logout function
  const [isOpen, setIsOpen] = useState(false); //~ menu toggle state
  const [scrolled, setScrolled] = useState(false); //~ track if page has been scrolled
  const navigate = useNavigate();
  const location = useLocation();

  //& hide auth links if on /spotify-login
  const hideAuthLinks = location.pathname === '/spotify-login';

  //& handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  //& mobile menu toggle
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  //& handle logout: call server logout -> clear oauth session -> clear client auth state
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('logout error:', error);
    }
    clearAuthState();
    navigate('/spotify-login');
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-transparent backdrop-blur-lg shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              to="/about" 
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-300"
            >
              Music Re-Wrapped
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/home">Home</NavLink>
            <NavLink to="/rewrapped">Re-Wrapped</NavLink>
            <NavLink to="/events">Events</NavLink>
            
            { !hideAuthLinks && user && user.role === 'promoter' && (
              <NavLink to="/promoter-panel">Promoter Panel</NavLink>
            )}
            
            { !hideAuthLinks && user && (
              <>
                {user.role !== 'guest' ? (
                  <NavLink to="/profile">Profile</NavLink>
                ) : (
                  <NavLink to="/register">Upgrade Account</NavLink>
                )}
                
                <button 
                  onClick={handleLogout} 
                  className={`ml-2 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-300 ${
                    location.pathname === '/home'
                      ? 'text-gray-800 hover:text-black font-medium hover:bg-gray-300/40'
                      : 'text-gray-300 hover:text-white font-medium hover:bg-gray-700/40'
                  }`}
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white focus:outline-none focus:text-white p-2 rounded-full hover:bg-gray-700/40 transition-all duration-300"
              aria-label="Toggle menu"
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

      {/* Mobile dropdown menu */}
      {isOpen && (
        <div className="md:hidden">
          <div 
            className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-transparent backdrop-blur-lg border-t border-green-800 animate-fadeIn"
            style={{animationDuration: '0.2s'}}
          >
            <MobileNavLink to="/home" onClick={() => setIsOpen(false)}>Home</MobileNavLink>
            <MobileNavLink to="/rewrapped" onClick={() => setIsOpen(false)}>Re-Wrapped</MobileNavLink>
            <MobileNavLink to="/events" onClick={() => setIsOpen(false)}>Events</MobileNavLink>
            
            { !hideAuthLinks && user && user.role === 'promoter' && (
              <MobileNavLink to="/promoter-panel" onClick={() => setIsOpen(false)}>Promoter Panel</MobileNavLink>
            )}
            
            { !hideAuthLinks && user && (
              <>
                {user.role !== 'guest' ? (
                  <MobileNavLink to="/profile" onClick={() => setIsOpen(false)}>Profile</MobileNavLink>
                ) : (
                  <MobileNavLink to="/register" onClick={() => setIsOpen(false)}>Upgrade Account</MobileNavLink>
                )}
                
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }} 
                  className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                    location.pathname === '/home'
                      ? 'text-black hover:text-black hover:bg-gray-300/70'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

//& reusable desktop nav link component fr consistent styling
const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const isHomePage = location.pathname === '/home';
  
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-full text-base font-medium transition-all duration-300 ${
        isActive
          ? 'text-white bg-gray-700/40 shadow-inner'
          : isHomePage
            ? 'text-gray-800  hover:text-black hover:bg-gray-300/40'
            : 'text-gray-300 hover:text-white hover:bg-gray-700/40'
      }`}
    >
      {children}
    </Link>
  );
};

//& reusable mobile nav link component
const MobileNavLink = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const isHomePage = location.pathname === '/home';
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
        isActive
          ? isHomePage 
              ? 'text-black bg-gray-300/70' 
              : 'text-white bg-gray-700'
          : isHomePage
              ? 'text-black hover:text-black hover:bg-gray-300/70' 
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
      }`}
    >
      {children}
    </Link>
  );
};

export default Navbar;