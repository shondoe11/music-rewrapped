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
        <div className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 p-6 rounded-xl shadow-lg border border-gray-700 border-opacity-40 mb-8">
            <div className="flex justify-between items-center mb-5">
                <div className="flex items-center">
                    <div className="bg-gray-900 bg-opacity-50 rounded-full p-2 mr-3">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {title.toLowerCase().includes('save') ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            )}
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-green-400">{title}</h3>
                </div>
                
                {events.length > 0 && events[0].id && userId && (
                    <ExportButton userId={userId} eventId={events[0].id} />
                )}
            </div>
            
            {events.length === 0 ? (
                <div className="text-center py-12 px-6">
                    <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h4 className="text-xl font-medium text-green-400 mb-3">No Events Data Available</h4>
                    <p className="text-gray-300 max-w-md mx-auto">
                        Once your events start gaining traction, you'll see your top performers here.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700 divide-opacity-50">
                        <thead>
                            <tr className="bg-gray-900 bg-opacity-50">
                                <th className="px-4 py-3 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                                    Event
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                                    Views
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                                    Saves
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                                    Save Rate
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                                    Engagement
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 divide-opacity-50 bg-gray-800 bg-opacity-20">
                            {events.map((event, index) => (
                                <tr 
                                    key={event.id} 
                                    className={`hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-150 ${
                                        index === 0 ? 'bg-green-900 bg-opacity-10' : ''
                                    }`}
                                >
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {index === 0 && (
                                                <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center mr-3 bg-green-500 bg-opacity-20 rounded-full">
                                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div className="text-sm font-medium text-white">{event.title}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-300">{formatDate(event.event_date)}</div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-300">{event.views.toLocaleString()}</div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-300">{event.saves.toLocaleString()}</div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm">
                                            <span className={`px-2 py-1 rounded-full ${
                                                event.save_rate > 25 ? 'bg-green-500 bg-opacity-20 text-green-400' :
                                                event.save_rate > 15 ? 'bg-blue-500 bg-opacity-20 text-blue-400' :
                                                'bg-gray-500 bg-opacity-20 text-gray-300'
                                            }`}>
                                                {event.save_rate.toFixed(1)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="text-sm text-gray-300 mr-3">{event.engagement}</div>
                                            <div className="w-20 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                                <div 
                                                    className="bg-gradient-to-r from-green-500 to-green-400 h-1.5 rounded-full transition-all duration-500" 
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
            
            <div className="mt-5 text-xs text-gray-400 bg-gray-900 bg-opacity-30 p-3 rounded-lg">
                {title.toLowerCase().includes('save') ? (
                    <p>This table shows events with the highest save rates, indicating strong audience interest and potential for conversions.</p>
                ) : (
                    <p>This table highlights your top performing events based on overall engagement metrics, combining views, saves, and interaction data.</p>
                )}
            </div>
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