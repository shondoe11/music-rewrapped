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
    ResponsiveContainer 
} from 'recharts';

const TargetingEffectiveness = ({ targetingData }) => {
    const [selectedCategory, setSelectedCategory] = useState('countries');
    
    if (!targetingData || !targetingData[selectedCategory] || Object.keys(targetingData[selectedCategory]).length === 0) {
        return (
            <div className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 p-6 rounded-xl shadow-lg border border-gray-700 border-opacity-40 mb-8">
                <div className="flex items-center mb-4">
                    <div className="bg-gray-900 bg-opacity-50 rounded-full p-2 mr-3">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-green-400">Targeting Effectiveness</h3>
                </div>
                
                <div className="text-center py-12 px-6">
                    <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <h4 className="text-xl font-medium text-green-400 mb-3">No Targeting Data Available</h4>
                    <p className="text-gray-300 max-w-md mx-auto">
                        Create events with targeting parameters such as countries, genres, and artist interests to see analytics on their effectiveness.
                    </p>
                </div>
            </div>
        );
    }
    
    //& prepare data fr selected category
    const prepareChartData = () => {
        const categoryData = targetingData[selectedCategory];
        return Object.entries(categoryData).map(([name, data]) => ({
            name: name.length > 10 ? name.substring(0, 10) + '...' : name,
            fullName: name,
            engagement: parseFloat(data.avgEngagement.toFixed(1)),
            saveRate: parseFloat(data.saveRate.toFixed(1)),
            events: data.events
        })).sort((a, b) => b.engagement - a.engagement).slice(0, 8); // Show top 8
    };
    
    const chartData = prepareChartData();
    
    const CategoryButton = ({ category, label, icon }) => (
        <button
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-2 rounded-lg text-sm flex items-center transition-all duration-300 ${
                selectedCategory === category 
                    ? 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500 border-opacity-30 shadow-inner' 
                    : 'bg-gray-700 bg-opacity-50 text-gray-300 hover:bg-opacity-70 border border-transparent'
            }`}
        >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
            {label}
        </button>
    );
    
    return (
        <div className="backdrop-filter backdrop-blur-md bg-gray-800 bg-opacity-40 p-6 rounded-xl shadow-lg border border-gray-700 border-opacity-40 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
                <div className="flex items-center">
                    <div className="bg-gray-900 bg-opacity-50 rounded-full p-2 mr-3">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-green-400">Targeting Effectiveness</h3>
                </div>
                
                <div className="flex space-x-2">
                    <CategoryButton 
                        category="countries" 
                        label="Countries" 
                        icon="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" 
                    />
                    <CategoryButton 
                        category="genres" 
                        label="Genres" 
                        icon="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
                    />
                    <CategoryButton 
                        category="artists" 
                        label="Artists" 
                        icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                </div>
            </div>
            
            <div className="bg-gray-900 bg-opacity-30 rounded-lg p-4 mb-5">
                <h4 className="text-green-400 text-sm font-medium mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Understanding This Chart
                </h4>
                <p className="text-gray-300 text-sm">
                    This chart shows how different targeting parameters affect your event performance. 
                    <span className="text-pink-400"> Engagement</span> measures overall interaction, 
                    <span className="text-blue-400"> Save Rate</span> shows the percentage of views that result in saves, and
                    <span className="text-green-400"> Events</span> indicates how many events use this parameter.
                </p>
            </div>
            
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 20,
                        }}
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
                                backgroundColor: 'rgba(26, 32, 44, 0.9)',
                                borderColor: '#4a5568',
                                borderRadius: '0.5rem',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                padding: '10px',
                            }}
                            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                            labelFormatter={(value, item) => item[0]?.payload?.fullName || value}
                            formatter={(value, name) => {
                                if (name === 'saveRate') return [value + '%', 'Save Rate'];
                                return [value, name.charAt(0).toUpperCase() + name.slice(1)];
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
                            dataKey="engagement" 
                            name="Engagement" 
                            fill="#F472B6" 
                            radius={[4, 4, 0, 0]}
                            animationDuration={1000}
                        />
                        <Bar 
                            dataKey="saveRate" 
                            name="Save Rate (%)" 
                            fill="#3B82F6" 
                            radius={[4, 4, 0, 0]}
                            animationDuration={1500}
                        />
                        <Bar 
                            dataKey="events" 
                            name="Events" 
                            fill="#4ADE80" 
                            radius={[4, 4, 0, 0]}
                            animationDuration={2000}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-5 text-sm text-gray-300 bg-gray-900 bg-opacity-30 p-4 rounded-lg">
                <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p>
                        Use these insights to optimize your future events. Target parameters with higher engagement and save rates to improve performance.
                        Consider testing new combinations of targeting parameters to discover what works best for your audience.
                    </p>
                </div>
            </div>
        </div>
    );
};

TargetingEffectiveness.propTypes = {
    targetingData: PropTypes.shape({
        countries: PropTypes.object,
        genres: PropTypes.object,
        artists: PropTypes.object
    }).isRequired
};

export default TargetingEffectiveness;