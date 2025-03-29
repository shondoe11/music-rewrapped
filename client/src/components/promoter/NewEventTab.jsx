import React from 'react';
import PropTypes from 'prop-types';
import EventForm from './EventForm';

const NewEventTab = ({ onEventAdded }) => {
    return (
        <div className="p-6">
            <h2 className="text-3xl font-semibold mb-6 text-green-400">Create New Event</h2>
            
            <div className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 rounded-xl shadow-lg border border-gray-700 border-opacity-40 p-6">
                <div className="flex items-center mb-6">
                    <div className="bg-gray-900 bg-opacity-50 rounded-full p-3 mr-4">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-medium text-green-400">Event Details</h3>
                        <p className="text-gray-300 text-sm">Fill out the form below to create a new event</p>
                    </div>
                </div>
                
                <EventForm 
                    onSubmit={onEventAdded} 
                    submitButtonText="Create Event"
                />
            </div>
            
            <div className="mt-6 backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 rounded-xl shadow-lg border border-gray-700 border-opacity-40 p-6">
                <h3 className="text-xl font-medium text-green-400 mb-4">Tips for Creating Effective Events</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-900 bg-opacity-30 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h4 className="font-medium text-white">Use High-Quality Images</h4>
                        </div>
                        <p className="text-gray-300 text-sm">Events with attractive, high-resolution images receive up to 35% more engagement.</p>
                    </div>
                    
                    <div className="bg-gray-900 bg-opacity-30 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h4 className="font-medium text-white">Target Specific Audiences</h4>
                        </div>
                        <p className="text-gray-300 text-sm">Narrower targeting often leads to higher conversion rates. Be specific with genres and artist interests.</p>
                    </div>
                    
                    <div className="bg-gray-900 bg-opacity-30 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h4 className="font-medium text-white">Write Clear Descriptions</h4>
                        </div>
                        <p className="text-gray-300 text-sm">Include all relevant details like performers, special guests, and what makes your event unique.</p>
                    </div>
                    
                    <div className="bg-gray-900 bg-opacity-30 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h4 className="font-medium text-white">Provide Direct Links</h4>
                        </div>
                        <p className="text-gray-300 text-sm">Make sure your event URL leads directly to a page where users can purchase tickets or RSVP.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

NewEventTab.propTypes = {
    onEventAdded: PropTypes.func.isRequired
};

export default NewEventTab;