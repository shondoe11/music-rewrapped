import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import Loader from '../../styles/Loader';
import { getGenreDistribution } from '../../services/analyticsService';

const GenreBubbleChart = ({ userId }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('medium_term');
    
    const svgRef = useRef();
    const tooltipRef = useRef();
    
    //& fetch data on time range change
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const genreData = await getGenreDistribution(userId, timeRange);
                setData(genreData);
                setError(null);
            } catch (err) {
                console.error('Error fetching genre distribution:', err);
                setError('Failed to load genre distribution data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [userId, timeRange]);
    
    useEffect(() => {
        if (loading || !data || data.length === 0) return;
        
        //~ clear prev chart
        d3.select(svgRef.current).selectAll("*").remove();

        const width = 900;
        const height = 500;
        
        //~ SVG container
        const svg = d3.select(svgRef.current)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", "100%")
            .attr("height", height);
            
        //~ hierarchy data structure fr bubble layout
        const hierarchy = {
            children: data.map(d => ({
                name: d.genre,
                value: d.minutes,
                trackCount: d.trackCount
            }))
        };
        
        //~ bubble layout
        const bubble = d3.pack()
            .size([width, height])
            .padding(5);
            
        //~ process data fr bubble layout
        const root = d3.hierarchy(hierarchy)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);
            
        bubble(root);
        
        //~ color scale fr bubbles
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.genre))
            .range(d3.schemeCategory10);
            
        //~ bubbles
        const nodes = svg.selectAll('.node')
            .data(root.children)
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x},${d.y})`);
            
        //~ circles
        nodes.append('circle')
            .attr('r', d => d.r)
            .attr('fill', d => color(d.data.name))
            .attr('opacity', 0.8)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .on('mouseover', function(event, d) {
                //~ tooltip
                d3.select(tooltipRef.current)
                    .style('display', 'block')
                    .style('left', (event.pageX - 25) + 'px')
                    .style('top', (event.pageY - 1750) + 'px')
                    .html(`
                        <div class="font-bold">${d.data.name}</div>
                        <div>${Math.round(d.data.value)} minutes listened</div>
                        <div>${Math.round(d.data.trackCount)} tracks</div>
                    `);
                    
                //~ highlight circle
                d3.select(this)
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 2);
            })
            .on('mouseout', function() {
                //~ hide tooltip
                d3.select(tooltipRef.current)
                    .style('display', 'none');
                    
                //~ restore circle
                d3.select(this)
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 1);
            });
            
        //~ add text labels but only fr larger bubbles
        nodes.filter(d => d.r > 30)
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '.3em')
            .attr('fill', '#fff')
            .style('font-size', d => Math.min(d.r / 3, 12) + 'px')
            .text(d => d.data.name)
            .style('pointer-events', 'none'); //~ prevent text frm interfering w hover
            
    }, [data, loading]);
    
    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader /></div>;
    }
    
    if (error) {
        return (
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
                <p className="text-red-500">{error}</p>
                <p className="text-gray-400 mt-2">Please try refreshing the page.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow mb-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Genre Distribution</h3>
                
                <div className="flex space-x-2">
                    <button
                        onClick={() => setTimeRange('short_term')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            timeRange === 'short_term' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        Last 4 Weeks
                    </button>
                    <button
                        onClick={() => setTimeRange('medium_term')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            timeRange === 'medium_term' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        Last 6 Months
                    </button>
                    <button
                        onClick={() => setTimeRange('long_term')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            timeRange === 'long_term' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        All Time
                    </button>
                </div>
            </div>
            
            <div className="relative">
                <svg ref={svgRef} width="100%" height="500"></svg>
                <div
                    ref={tooltipRef}
                    className="absolute bg-gray-900 text-white p-2 rounded shadow-lg pointer-events-none hidden"
                    style={{ display: 'none' }}
                ></div>
            </div>
            
            <div className="mt-4 text-sm text-gray-400">
                <p>
                    This visualization shows your listening distribution across different genres. 
                    Larger bubbles represent genres you listen to more frequently.
                </p>
                {data.length === 0 && (
                    <p className="mt-2 text-yellow-500">
                        No genre data available for this time period. Continue using Spotify with Re-Wrapped to see your genre preferences!
                    </p>
                )}
            </div>
        </div>
    );
};

GenreBubbleChart.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default GenreBubbleChart;