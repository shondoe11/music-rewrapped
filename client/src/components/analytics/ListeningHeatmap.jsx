import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import Loader from '../../styles/Loader';
import { getListeningHeatmap } from '../../services/analyticsService';

const ListeningHeatmap = ({ userId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [days, setDays] = useState(90);
    
    const svgRef = useRef();
    const tooltipRef = useRef();
    
    //& fetch data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const heatmapData = await getListeningHeatmap(userId, days);
                setData(heatmapData);
                setError(null);
            } catch (err) {
                console.error('Error fetching listening heatmap:', err);
                setError('Failed to load listening heatmap data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [userId, days]);
    
    //& create & update heatmap using D3
    useEffect(() => {
        if (loading || !data || !data.data) return;
        
        //~ day & hour labels
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
        
        //~ clear prev chart
        d3.select(svgRef.current).selectAll("*").remove();
        
        //~ set up dimensions & margins
        const margin = { top: 40, right: 40, bottom: 50, left: 100 };
        const width = 900 - margin.left - margin.right;
        const height = 440 - margin.top - margin.bottom;
        
        const cellWidth = width / 24;
        const cellHeight = height / 7;
        
        //~ create SVG container
        const svg = d3.select(svgRef.current)
            .attr("viewBox", `0 0 900 440`)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);
        
        //~ color scale
        const colorScale = d3.scaleSequential()
            .domain([0, data.maxValue])
            .interpolator(d3.interpolateViridis);

        //~ add day labels (y-axis)
        svg.selectAll(".day-label")
            .data(days)
            .enter()
            .append("text")
            .attr("class", "day-label")
            .attr("x", -10)
            .attr("y", (d, i) => cellHeight * i + cellHeight / 2)
            .style("text-anchor", "end")
            .style("dominant-baseline", "middle")
            .style("fill", "#ccc")
            .style("font-size", "12px")
            .text(d => d);

        //~ add hour labels (x-axis)
        svg.selectAll(".hour-label")
            .data(hours)
            .enter()
            .append("text")
            .attr("class", "hour-label")
            .attr("x", (d, i) => cellWidth * i + cellWidth / 2)
            .attr("y", height + 15)
            .style("text-anchor", "middle")
            .style("fill", "#ccc")
            .style("font-size", "10px")
            .text((d, i) => i % 3 === 0 ? d : ''); //~ only show every 3rd hour fr cleaner axis

        //~ add title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -20)
            .style("text-anchor", "middle")
            .style("fill", "white")
            .style("font-size", "16px")
            .text("Listening Activity by Day and Hour");

        //& create heatmap cells
        const heatmapCells = svg.selectAll(".heatmap-cell")
            .data(data.data.flatMap((dayData, dayIndex) => 
                dayData.map((value, hourIndex) => ({
                    day: dayIndex,
                    hour: hourIndex,
                    value: value
                }))
            ))
            .enter()
            .append("rect")
            .attr("class", "heatmap-cell")
            .attr("x", d => d.hour * cellWidth)
            .attr("y", d => d.day * cellHeight)
            .attr("width", cellWidth - 1)
            .attr("height", cellHeight - 1)
            .attr("rx", 2) //~ rounded corners
            .attr("ry", 2)
            .attr("fill", d => d.value > 0 ? colorScale(d.value) : "#2d3748")
            .attr("stroke", "#1a202c")
            .attr("stroke-width", 1)
            .on("mouseover", function(event, d) {
                //~ show tooltip
                d3.select(tooltipRef.current)
                    .style("display", "block")
                    .style("left", (event.pageX - 100) + "px")
                    .style("top", (event.pageY - 1100) + "px")
                    .html(`
                        <div><strong>${days[d.day]}, ${hours[d.hour]}</strong></div>
                        <div>${d.value} track${d.value === 1 ? '' : 's'} played</div>
                    `);
                    
                //~ highlight cell
                d3.select(this)
                    .attr("stroke", "white")
                    .attr("stroke-width", 2);
            })
            .on("mouseout", function() {
                //~ hide tooltip
                d3.select(tooltipRef.current)
                    .style("display", "none");
                    
                //~ restore cell
                d3.select(this)
                    .attr("stroke", "#1a202c")
                    .attr("stroke-width", 1);
            });

        //& add legend
        const legendWidth = 200;
        const legendHeight = 20;
        const legendX = width - legendWidth;
        const legendY = height + 30;

        //& create gradient fr legend
        const defs = svg.append("defs");

        const gradient = defs.append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");

        //& add color stops to gradient
        const numStops = 10;
        for (let i = 0; i <= numStops; i++) {
            const offset = i / numStops;
            gradient.append("stop")
                .attr("offset", `${offset * 100}%`)
                .attr("stop-color", colorScale(offset * data.maxValue));
        }

        //& draw legend rectangle w gradient
        svg.append("rect")
            .attr("x", legendX)
            .attr("y", legendY)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#legend-gradient)");

        //& add legend labels
        svg.append("text")
            .attr("x", legendX)
            .attr("y", legendY - 5)
            .style("text-anchor", "start")
            .style("fill", "#ccc")
            .style("font-size", "12px")
            .text("0");
            
        svg.append("text")
            .attr("x", legendX + legendWidth)
            .attr("y", legendY - 5)
            .style("text-anchor", "end")
            .style("fill", "#ccc")
            .style("font-size", "12px")
            .text(`${data.maxValue}`);
            
        svg.append("text")
            .attr("x", legendX + legendWidth / 2)
            .attr("y", legendY - 5)
            .style("text-anchor", "middle")
            .style("fill", "#ccc")
            .style("font-size", "12px")
            .text("Tracks played");
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
                    <h3 className="text-xl font-semibold">Listening Activity Heatmap</h3>
                    
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">Time period:</span>
                        <select
                            value={days}
                            onChange={(e) => setDays(Number(e.target.value))}
                            className="bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm"
                        >
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="180">Last 6 months</option>
                            <option value="365">Last year</option>
                        </select>
                    </div>
                </div>
                
                <div className="relative">
                    <svg ref={svgRef} width="100%" height="440"></svg>
                    <div
                        ref={tooltipRef}
                        className="absolute bg-gray-900 text-white p-2 rounded shadow-lg pointer-events-none hidden"
                        style={{ display: 'none' }}
                    ></div>
                </div>
                
                <div className="mt-4 text-sm text-gray-400">
                    <p>
                        This heatmap shows when you're most active on Spotify throughout the week. 
                        Darker colors indicate more tracks played during that hour of the day.
                    </p>
                    {data && data.data.every(row => row.every(cell => cell === 0)) && (
                        <p className="mt-2 text-yellow-500">
                            No listening data available for this time period. Continue using Spotify with Re-Wrapped to see your activity patterns!
                        </p>
                    )}
                </div>
            </div>
        );
};

ListeningHeatmap.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default ListeningHeatmap;