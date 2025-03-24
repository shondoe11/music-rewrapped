import React from 'react';
import PropTypes from 'prop-types';
import ExportButton from './ExportButton';

const TopEventsTable = ({ events, title = "Top Performing Events", userId }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{title}</h3>
            {events.length > 0 && events[0].id && userId && (
                <ExportButton userId={userId} eventId={events[0].id} />
            )}
        </div>
        
        {events.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No events data available</p>
        ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
                <thead>
                <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Event
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Views
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Saves
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Save Rate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Engagement
                    </th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                {events.map((event) => (
                    <tr key={event.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{event.title}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{formatDate(event.event_date)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{event.views}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{event.saves}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-green-500 font-medium">
                        {event.save_rate.toFixed(1)}%
                        </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                        <div className="text-sm text-gray-300">{event.engagement}</div>
                        <div className="ml-2 w-16 bg-gray-700 rounded-full h-2">
                            <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{width: `${Math.min(100, (event.engagement / 100) * 100)}%`}}
                            ></div>
                        </div>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
        </div>
    );
};

TopEventsTable.propTypes = {
    events: PropTypes.arrayOf(
        PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        event_date: PropTypes.string,
        views: PropTypes.number.isRequired,
        saves: PropTypes.number.isRequired,
        save_rate: PropTypes.number.isRequired,
        engagement: PropTypes.number.isRequired
        })
    ).isRequired,
    title: PropTypes.string,
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default TopEventsTable;