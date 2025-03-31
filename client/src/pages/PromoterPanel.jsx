import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import usePromoterEvents from '../hooks/usePromoterEvents';
import LiquidChrome from '../styles/backgrounds/LiquidChrome';

//& promoter components 
import PromoterNav from '../components/promoter/PromoterNav';
import PromoterDashboard from '../components/promoter/PromoterDashboard';
import NewEventTab from '../components/promoter/NewEventTab';
import PromoterEvents from '../components/promoter/PromoterEvents';
import AnalyticsDashboard from '../components/promoter/AnalyticsDashboard';

//& loader
import Loader from '../styles/Loader';

const PromoterPanel = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  const { 
    events, 
    loading,
    addEvent, 
    updateEvent, 
    removeEvent,
    editingEventId,
    setEditingEventId
  } = usePromoterEvents(user?.id);

  //& handle event creation
  const handleEventAdded = async (eventData) => {
    await addEvent(eventData);
    setSelectedTab('sponsored');
    setIsMobileNavOpen(false);
  };

  //& handle tab change
  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    setEditingEventId(null);
    setIsMobileNavOpen(false);
  };

  //& toggle mobile navigation
  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  //& render content based on selected tab
  const renderContent = () => {
    if (loading && selectedTab !== 'analytics') {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      );
    }

    switch (selectedTab) {
      case 'dashboard':
        return <PromoterDashboard events={events} onTabChange={handleTabChange} />;
        
      case 'submit':
        return <NewEventTab onEventAdded={handleEventAdded} />;
        
      case 'sponsored':
        return (
          <PromoterEvents
            events={events}
            onUpdateEvent={updateEvent}
            onDeleteEvent={removeEvent}
            editingEventId={editingEventId}
            setEditingEventId={setEditingEventId}
            onTabChange={handleTabChange}
          />
        );
        
      case 'analytics':
        return <AnalyticsDashboard userId={user?.id} onTabChange={handleTabChange} />;
        
      default:
        return null;
    }
  };

  return (
    <>
      <div 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1
        }}
      >
        <LiquidChrome
          baseColor={[0.05, 0.5, 0.36]}
          speed={0.55}
          amplitude={0.4}
          frequencyX={2}
          frequencyY={1.5}
          interactive={true}
        />
      </div>

      {/* Mobile button */}
      <div className="fixed top-20 right-4 z-50 md:hidden">
        <button 
          onClick={toggleMobileNav}
          className="p-2 rounded-lg bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-md border border-gray-700 border-opacity-50 text-white hover:bg-gray-700 transition-colors duration-300"
          aria-label="Toggle navigation menu"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {isMobileNavOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <aside className={`${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } fixed md:relative w-64 h-[calc(100vh-4rem)] transition-transform duration-300 z-40`}>
          <PromoterNav selectedTab={selectedTab} onTabChange={handleTabChange} />
        </aside>
        
        {/* Mobile Nav Backdrop */}
        {isMobileNavOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsMobileNavOpen(false)}
          ></div>
        )}
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto text-white">
          <div className="bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-sm p-4">
            {renderContent()}
          </div>
        </main>
      </div>
    </>
  );
};

export default PromoterPanel;