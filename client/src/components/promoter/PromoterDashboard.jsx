import React from 'react';
import PropTypes from 'prop-types';

const PromoterDashboard = ({ events }) => {
    return (
        <div className="p-4">
        <h2 className="text-3xl font-semibold mb-4">Event Management Dashboard</h2>
        {events.length === 0 ? (
            <p>No events submitted yet.</p>
        ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 text-green-500 rounded shadow">
                <thead>
                <tr>
                    <th className="py-2 px-4 border-b">Title</th>
                    <th className="py-2 px-4 border-b">Location</th>
                    <th className="py-2 px-4 border-b">Date</th>
                    <th className="py-2 px-4 border-b">Status</th>
                    <th className="py-2 px-4 border-b">Views</th>
                    <th className="py-2 px-4 border-b">Saves</th>
                    <th className="py-2 px-4 border-b">Tags</th>
                    <th className="py-2 px-4 border-b">Engagement</th>
                </tr>
                </thead>
                <tbody>
                {events.map((event) => (
                    <tr key={event.id} className="text-center">
                    <td className="py-2 px-4 border-b">{event.title}</td>
                    <td className="py-2 px-4 border-b">{event.location}</td>
                    <td className="py-2 px-4 border-b">
                        {new Date(event.event_date).toLocaleDateString()} {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2 px-4 border-b">{event.status || 'Pre-Event'}</td>
                    <td className="py-2 px-4 border-b">{event.views || 0}</td>
                    <td className="py-2 px-4 border-b">{event.saves || 0}</td>
                    <td className="py-2 px-4 border-b">{event.tags ? event.tags.join(', ') : 'n/a'}</td>
                    <td className="py-2 px-4 border-b">{event.engagement || 0}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
        </div>
    );
};

PromoterDashboard.propTypes = {
    events: PropTypes.array.isRequired
};

export default PromoterDashboard;