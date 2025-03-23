import React from 'react';
import PropTypes from 'prop-types';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';

const EventPerformanceChart = ({ events }) => {
    //~ format data fr chart
    const chartData = events.map(event => ({
        name: event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title,
        views: event.views,
        saves: event.saves,
        engagement: event.engagement
    }));

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow mb-8">
        <h3 className="text-xl font-semibold mb-4">Event Performance</h3>
        
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip
                contentStyle={{
                    backgroundColor: '#333',
                    borderColor: '#444',
                    color: '#fff',
                }}
                />
                <Legend wrapperStyle={{ color: '#ccc' }} />
                <Bar dataKey="views" name="Views" fill="#4ADE80" />
                <Bar dataKey="saves" name="Saves" fill="#3B82F6" />
                <Bar dataKey="engagement" name="Engagement" fill="#F472B6" />
            </BarChart>
            </ResponsiveContainer>
        </div>
        </div>
    );
};

EventPerformanceChart.propTypes = {
    events: PropTypes.arrayOf(
        PropTypes.shape({
        title: PropTypes.string.isRequired,
        views: PropTypes.number.isRequired,
        saves: PropTypes.number.isRequired,
        engagement: PropTypes.number.isRequired
        })
    ).isRequired
};

export default EventPerformanceChart;