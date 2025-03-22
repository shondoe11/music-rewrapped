import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import usePromoterEvents from '../hooks/usePromoterEvents';

//& Promoter Components 
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
  };

  //& handle tab change
  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    setEditingEventId(null);
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
        return <PromoterDashboard events={events} />;
        
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
          />
        );
        
      case 'analytics':
        return <AnalyticsDashboard userId={user?.id} />;
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex">
        <PromoterNav 
          selectedTab={selectedTab} 
          onTabChange={handleTabChange} 
        />
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default PromoterPanel;