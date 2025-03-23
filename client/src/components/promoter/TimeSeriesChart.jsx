import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const TimeSeriesChart = ({ data, type = 'daily' }) => {
    const [metric, setMetric] = useState('views');
    
    if (!data || data.length === 0) {
        return (
        <div className="bg-gray-800 p-4 rounded-lg shadow mb-8">
            <h3 className="text-xl font-semibold mb-4">Performance Over Time</h3>
            <div className="text-center py-8 text-gray-400">
            No time series data available yet.
            </div>
        </div>
        );
    }
    
    const formatDate = (dateStr) => {
        if (type === 'weekly') {
        //~ format week identifier like "2025-W12" to "Mar 17-23"
        const [year, week] = dateStr.split('-W');
        const weekNum = parseInt(week);
        const dateObj = new Date(year, 0, 1 + (weekNum - 1) * 7);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[dateObj.getMonth()];
        const day = dateObj.getDate();
        const endDay = day + 6 > 31 ? 31 : day + 6;
        return `${month} ${day}-${endDay}`;
        } else {
        //~ format ISO date like "2025-03-15" to "Mar 15"
        const dateObj = new Date(dateStr);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}`;
        }
    };
    
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Performance Over Time</h3>
            
            <div className="flex space-x-2">
            <button
                onClick={() => setMetric('views')}
                className={`px-3 py-1 rounded-md text-sm ${
                metric === 'views' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
                Views
            </button>
            <button
                onClick={() => setMetric('saves')}
                className={`px-3 py-1 rounded-md text-sm ${
                metric === 'saves' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
                Saves
            </button>
            <button
                onClick={() => setMetric('engagement')}
                className={`px-3 py-1 rounded-md text-sm ${
                metric === 'engagement' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
                Engagement
            </button>
            </div>
        </div>
        
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={data}
                margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                dataKey={type === 'weekly' ? 'week' : 'date'} 
                stroke="#ccc"
                tickFormatter={formatDate} 
                />
                <YAxis stroke="#ccc" />
                <Tooltip
                contentStyle={{
                    backgroundColor: '#333',
                    borderColor: '#444',
                    color: '#fff',
                }}
                formatter={(value) => [value, metric.charAt(0).toUpperCase() + metric.slice(1)]}
                labelFormatter={formatDate}
                />
                <Area 
                type="monotone" 
                dataKey={metric} 
                stroke={
                    metric === 'views' ? '#4ADE80' : 
                    metric === 'saves' ? '#3B82F6' : '#F472B6'
                }
                fill={
                    metric === 'views' ? 'rgba(74, 222, 128, 0.2)' : 
                    metric === 'saves' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(244, 114, 182, 0.2)'
                }
                />
            </AreaChart>
            </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-sm text-gray-400">
            <p>
            This chart shows how your {metric} have changed over time. You can toggle between different metrics to see different trends.
            </p>
        </div>
        </div>
    );
    };

    TimeSeriesChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    type: PropTypes.oneOf(['daily', 'weekly'])
    };

export default TimeSeriesChart;