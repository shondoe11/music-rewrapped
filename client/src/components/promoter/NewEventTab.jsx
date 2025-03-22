import React from 'react';
import PropTypes from 'prop-types';
import EventForm from './EventForm';

const NewEventTab = ({ onEventAdded }) => {
    return (
        <div className="p-4">
        <h2 className="text-3xl font-semibold mb-4">New Event</h2>
        <EventForm 
            onSubmit={onEventAdded} 
            submitButtonText="Submit Event"
        />
        </div>
    );
};

NewEventTab.propTypes = {
    onEventAdded: PropTypes.func.isRequired
};

export default NewEventTab;