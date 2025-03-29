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
    Area,
    ReferenceLine
} from 'recharts';

const TimeSeriesChart = ({ data, type = 'daily' }) => {
    const [metric, setMetric] = useState('views');
    
    if (!data || data.length === 0) {
        return (
            <div className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 p-6 rounded-xl shadow-lg border border-gray-700 border-opacity-40 mb-8">
                <div className="flex items-center mb-4">
                    <div className="bg-gray-900 bg-opacity-50 rounded-full p-2 mr-3">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-green-400">Performance Over Time</h3>
                </div>
                
                <div className="text-center py-12 px-6">
                    <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h4 className="text-xl font-medium text-green-400 mb-3">No Time Series Data Available</h4>
                    <p className="text-gray-300 max-w-md mx-auto">
                        As your events receive views and interactions over time, this chart will populate with performance data.
                    </p>
                </div>
            </div>
        );
    }
    
    const formatDate = (dateStr) => {
        if (type === 'weekly') {
            //~ format week identifier like 2025-W12 to Mar 17-23
            const [year, week] = dateStr.split('-W');
            const weekNum = parseInt(week);
            const dateObj = new Date(year, 0, 1 + (weekNum - 1) * 7);
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const month = monthNames[dateObj.getMonth()];
            const day = dateObj.getDate();
            const endDay = day + 6 > 31 ? 31 : day + 6;
            return `${month} ${day}-${endDay}`;
        } else {
            //~ format ISO date like 2025-03-15 to Mar 15
            const dateObj = new Date(dateStr);
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}`;
        }
    };
    
    const average = data.reduce((sum, item) => sum + item[metric], 0) / data.length;
    
    const values = data.map(item => item[metric]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;
    const yDomain = [Math.max(0, min - padding), max + padding];
    
    const MetricButton = ({ metricKey, label, color, icon }) => (
        <button
            onClick={() => setMetric(metricKey)}
            className={`px-3 py-2 rounded-lg text-sm flex items-center transition-all duration-300 ${
                metric === metricKey 
                    ? `bg-${color}-500 bg-opacity-20 text-${color}-400 border border-${color}-500 border-opacity-30 shadow-inner` 
                    : 'bg-gray-700 bg-opacity-50 text-gray-300 hover:bg-opacity-70 border border-transparent'
            }`}
        >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
            {label}
        </button>
    );
    
    const getColors = () => {
        if (metric === 'views') return {
            stroke: '#4ADE80',
            fill: 'url(#viewsGradient)',
            gradientFrom: '#4ADE80',
            gradientTo: 'rgba(74, 222, 128, 0.05)'
        };
        if (metric === 'saves') return {
            stroke: '#3B82F6',
            fill: 'url(#savesGradient)',
            gradientFrom: '#3B82F6',
            gradientTo: 'rgba(59, 130, 246, 0.05)'
        };
        return {
            stroke: '#F472B6',
            fill: 'url(#engagementGradient)',
            gradientFrom: '#F472B6',
            gradientTo: 'rgba(244, 114, 182, 0.05)'
        };
    };
    
    const colors = getColors();
    
    return (
        <div className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 p-6 rounded-xl shadow-lg border border-gray-700 border-opacity-40 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
                <div className="flex items-center">
                    <div className="bg-gray-900 bg-opacity-50 rounded-full p-2 mr-3">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-green-400">Performance Over Time</h3>
                </div>
                
                <div className="flex space-x-2">
                    <MetricButton 
                        metricKey="views" 
                        label="Views" 
                        color="green"
                        icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                    />
                    <MetricButton 
                        metricKey="saves" 
                        label="Saves" 
                        color="blue"
                        icon="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
                    />
                    <MetricButton 
                        metricKey="engagement" 
                        label="Engagement" 
                        color="pink"
                        icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
                    />
                </div>
            </div>
            
            <div className="bg-gray-900 bg-opacity-30 rounded-lg p-4 mb-5">
                <h4 className="text-green-400 text-sm font-medium mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {type === 'weekly' ? 'Weekly Aggregated Data' : 'Daily Performance Metrics'}
                </h4>
                <p className="text-gray-300 text-sm">
                    The chart shows your {metric} over time. The dashed line represents the average {metric} value.
                    {metric === 'views' && ' Higher views indicate better reach for your events.'}
                    {metric === 'saves' && ' Saves represent strong user interest in your events.'}
                    {metric === 'engagement' && ' Engagement is a combined metric of views and saves.'}
                </p>
            </div>
            
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 20,
                            bottom: 10,
                        }}
                    >
                        <defs>
                            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#4ADE80" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="savesGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F472B6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#F472B6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" strokeOpacity={0.5} />
                        <XAxis 
                            dataKey={type === 'weekly' ? 'week' : 'date'} 
                            stroke="#ccc" 
                            tickFormatter={formatDate}
                            tick={{ fill: '#ccc', fontSize: 12 }}
                            tickLine={{ stroke: '#666' }}
                            axisLine={{ stroke: '#666' }} 
                        />
                        <YAxis 
                            stroke="#ccc" 
                            domain={yDomain}
                            tick={{ fill: '#ccc', fontSize: 12 }}
                            tickLine={{ stroke: '#666' }}
                            axisLine={{ stroke: '#666' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(26, 32, 44, 0.9)',
                                borderColor: '#4a5568',
                                borderRadius: '0.5rem',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                padding: '10px',
                            }}
                            labelFormatter={formatDate}
                            formatter={(value) => [value, metric.charAt(0).toUpperCase() + metric.slice(1)]}
                        />
                        <ReferenceLine 
                            y={average} 
                            stroke="#ffffff" 
                            strokeDasharray="3 3" 
                            strokeOpacity={0.7}
                            label={{ 
                                value: 'Average', 
                                position: 'insideTopRight',
                                fill: '#ffffff',
                                fontSize: 12
                            }} 
                        />
                        <Area 
                            type="monotone" 
                            dataKey={metric} 
                            stroke={colors.stroke}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={colors.fill}
                            activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-5 text-sm text-gray-300 bg-gray-900 bg-opacity-30 p-4 rounded-lg">
                <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p>
                        Look for patterns in your data to optimize future events. Identify high-performing dates or periods to help 
                        schedule upcoming events. Significant upward trends may indicate successful marketing or targeting strategies.
                    </p>
                </div>
            </div>
        </div>
    );
};

TimeSeriesChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    type: PropTypes.oneOf(['daily', 'weekly'])
};

export default TimeSeriesChart;