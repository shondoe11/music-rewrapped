import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    Cell
} from 'recharts';

const EventPerformanceChart = ({ events }) => {
    //~ format data fr chart
    const chartData = events.map(event => ({
        name: event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title,
        views: event.views,
        saves: event.saves,
        engagement: event.engagement,
        id: event.id
    }));

    const [activeIndex, setActiveIndex] = useState(null);

    const handleMouseEnter = (_, index) => {
        setActiveIndex(index);
    };

    const handleMouseLeave = () => {
        setActiveIndex(null);
    };

    return (
        <div className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 p-6 rounded-xl shadow-lg border border-gray-700 border-opacity-40 mb-8">
            <div className="flex items-center mb-5">
                <div className="bg-gray-900 bg-opacity-50 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-green-400">Event Performance</h3>
            </div>
            
            <div className="h-80 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 20,
                            bottom: 10,
                        }}
                        onMouseLeave={handleMouseLeave}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" strokeOpacity={0.5} />
                        <XAxis 
                            dataKey="name" 
                            stroke="#ccc" 
                            tick={{ fill: '#ccc', fontSize: 12 }}
                            tickLine={{ stroke: '#666' }}
                            axisLine={{ stroke: '#666' }}
                        />
                        <YAxis 
                            stroke="#ccc"
                            tick={{ fill: '#ccc', fontSize: 12 }}
                            tickLine={{ stroke: '#666' }}
                            axisLine={{ stroke: '#666' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                borderColor: '#4a5568',
                                borderRadius: '0.5rem',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                                padding: '16px',
                                minWidth: '200px',
                                maxWidth: '300px'
                            }}
                            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                            labelStyle={{ 
                                color: 'white', 
                                fontWeight: 600, 
                                marginBottom: '10px',
                                fontSize: '14px',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word'
                            }}
                            itemStyle={{ 
                                padding: '4px 0',
                                fontSize: '13px'
                            }}
                            wrapperStyle={{
                                zIndex: 1000
                            }}
                        />
                        <Legend 
                            wrapperStyle={{ 
                                paddingTop: '15px', 
                                color: '#ccc',
                                fontSize: '13px'
                            }}
                            iconType="circle"
                        />
                        <Bar 
                            dataKey="views" 
                            name="Views" 
                            fill="#4ADE80"
                            radius={[4, 4, 0, 0]}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`views-${index}`}
                                    fill={activeIndex === index ? '#4ADE80' : 'rgba(74, 222, 128, 0.7)'}
                                />
                            ))}
                        </Bar>
                        <Bar 
                            dataKey="saves" 
                            name="Saves" 
                            fill="#3B82F6"
                            radius={[4, 4, 0, 0]}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`saves-${index}`}
                                    fill={activeIndex === index ? '#3B82F6' : 'rgba(59, 130, 246, 0.7)'}
                                />
                            ))}
                        </Bar>
                        <Bar 
                            dataKey="engagement" 
                            name="Engagement" 
                            fill="#F472B6"
                            radius={[4, 4, 0, 0]}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`engagement-${index}`}
                                    fill={activeIndex === index ? '#F472B6' : 'rgba(244, 114, 182, 0.7)'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-4 text-sm text-gray-300 bg-gray-900 bg-opacity-30 p-3 rounded-lg">
                <p>
                    This chart compares key performance metrics across your events. <span className="text-green-400">Views</span> show total impressions, 
                    <span className="text-blue-400"> saves</span> indicate user interest, and <span className="text-pink-400">engagement</span> reflects 
                    overall interaction calculated from views, saves, and other factors.
                </p>
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