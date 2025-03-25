import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import Loader from '../../styles/Loader';
import { getListeningTrends } from '../../services/analyticsService';

const ListeningTrendsChart = ({ userId }) => {
    const [timeFrame, setTimeFrame] = useState('daily');
    const [days, setDays] = useState(30);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const svgRef = useRef();
    const tooltipRef = useRef();
    
    //& fetch data when time frame / days change
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const trendsData = await getListeningTrends(userId, timeFrame, days);
                setData(trendsData);
                setError(null);
            } catch (err) {
                console.error('Error fetching listening trends:', err);
                setError('Failed to load listening trends data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [userId, timeFrame, days]);
    
    //& create & update chart using D3
    useEffect(() => {
        if (loading || !data || data.length === 0) return;
        
        //~ clear prev chart
        d3.select(svgRef.current).selectAll("*").remove();
        
        //~ set up dimensions & margins
        const margin = { top: 30, right: 60, bottom: 60, left: 60 };
        const width = 900 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        
        //~ create SVG container
        const svg = d3.select(svgRef.current)
            .attr("viewBox", `0 0 900 400`)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);
            
        //~ parse dates & ensure proper format
        let parsedData = data.map(d => ({
            date: new Date(d.date),
            trackCount: d.trackCount,
            minutes: d.minutes
        }));
        
        if (timeFrame === 'weekly') {
            parsedData = parsedData.filter(d => {
                //~ 1 = monday in getDay() (0 = sunday)
                const dayOfWeek = d.date.getDay();
                //~ keep only Mondays / closest data points to mondays
                if (parsedData.length <= 7) {
                    //~ if we have few data points, keep all
                    return true;
                }
                return dayOfWeek === 1; //~ monday
            });
        }
        
        //~ set up x axis (time scale)
        const x = d3.scaleTime()
            .domain(d3.extent(parsedData, d => d.date))
            .range([0, width]);
            
        //~ add x axis
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x)
                .tickFormat(d => {
                    if (timeFrame === 'daily') {
                        return d3.timeFormat("%b %d")(d);
                    } else if (timeFrame === 'weekly') {
                        return `Week of ${d3.timeFormat("%b %d")(d)}`;
                    } else {
                        return d3.timeFormat("%b %Y")(d);
                    }
                }))
            .selectAll("text")
            .style("font-size", "12px")
            .style("fill", "#ccc")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");
            
        //~ set up y axis (left) fr track count
        const yTrackCount = d3.scaleLinear()
            .domain([0, d3.max(parsedData, d => d.trackCount) * 1.1])
            .range([height, 0]);
            
        //~ add left y axis
        svg.append("g")
            .call(d3.axisLeft(yTrackCount))
            .selectAll("text")
            .style("font-size", "12px")
            .style("fill", "#ccc");
            
        //~ add left y axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 15)
            .attr("x", -height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", "#4ADE80")
            .text("Tracks Played");
            
        //~ set up y axis (right) for mins
        const yMinutes = d3.scaleLinear()
            .domain([0, d3.max(parsedData, d => d.minutes) * 1.1])
            .range([height, 0]);
            
        //~ add right y axis
        svg.append("g")
            .attr("transform", `translate(${width}, 0)`)
            .call(d3.axisRight(yMinutes))
            .selectAll("text")
            .style("font-size", "12px")
            .style("fill", "#ccc");
            
        //~ add right y axis label
        svg.append("text")
            .attr("transform", "rotate(90)")
            .attr("y", -width - margin.right + 15)
            .attr("x", height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", "#3B82F6")
            .text("Minutes Listened");
            
        //~ add line fr tracks played
        const tracksLine = d3.line()
            .x(d => x(d.date))
            .y(d => yTrackCount(d.trackCount))
            .curve(d3.curveMonotoneX);
            
        svg.append("path")
            .datum(parsedData)
            .attr("fill", "none")
            .attr("stroke", "#4ADE80")
            .attr("stroke-width", 2)
            .attr("d", tracksLine);
            
        //~ add line fr minutes listened
        const minutesLine = d3.line()
            .x(d => x(d.date))
            .y(d => yMinutes(d.minutes))
            .curve(d3.curveMonotoneX);
            
        svg.append("path")
            .datum(parsedData)
            .attr("fill", "none")
            .attr("stroke", "#3B82F6")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5")
            .attr("d", minutesLine);
            
        //& add dots fr tracks played
        svg.selectAll(".track-dot")
            .data(parsedData)
            .enter()
            .append("circle")
            .attr("class", "track-dot")
            .attr("cx", d => x(d.date))
            .attr("cy", d => yTrackCount(d.trackCount))
            .attr("r", 4)
            .attr("fill", "#4ADE80")
            .on("mouseover", function(event, d) {
                //~ show tooltip
                d3.select(tooltipRef.current)
                    .style("display", "block")
                    .style("left", (event.pageX - 50) + "px")
                    .style("top", (event.pageY - 400) + "px")
                    .html(`
                        <div class="date">${formatTooltipDate(d.date, timeFrame)}</div>
                        <div class="tracks"><span>Tracks:</span> ${d.trackCount}</div>
                        <div class="minutes"><span>Minutes:</span> ${d.minutes}</div>
                    `);
                    
                //~ highlight dot
                d3.select(this)
                    .attr("r", 6)
                    .attr("stroke", "white")
                    .attr("stroke-width", 2);
            })
            .on("mouseout", function() {
                //~ hide tooltip
                d3.select(tooltipRef.current)
                    .style("display", "none");
                    
                //~ restore dot
                d3.select(this)
                    .attr("r", 4)
                    .attr("stroke", "none");
            });
            
        //& add dots fr minutes listened
        svg.selectAll(".minutes-dot")
            .data(parsedData)
            .enter()
            .append("circle")
            .attr("class", "minutes-dot")
            .attr("cx", d => x(d.date))
            .attr("cy", d => yMinutes(d.minutes))
            .attr("r", 4)
            .attr("fill", "#3B82F6")
            .on("mouseover", function(event, d) {
                //~ show tooltip
                d3.select(tooltipRef.current)
                    .style("display", "block")
                    .style("left", (event.pageX - 50) + "px")
                    .style("top", (event.pageY - 400) + "px")
                    .html(`
                        <div class="date">${formatTooltipDate(d.date, timeFrame)}</div>
                        <div class="tracks"><span>Tracks:</span> ${d.trackCount}</div>
                        <div class="minutes"><span>Minutes:</span> ${d.minutes}</div>
                    `);
                    
                //~ highlight dot
                d3.select(this)
                    .attr("r", 6)
                    .attr("stroke", "white")
                    .attr("stroke-width", 2);
            })
            .on("mouseout", function() {
                //~ hide tooltip
                d3.select(tooltipRef.current)
                    .style("display", "none");
                    
                //~ restore dot
                d3.select(this)
                    .attr("r", 4)
                    .attr("stroke", "none");
            });
            
        //~ add legend
        const legend = svg.append("g")
            .attr("transform", `translate(${width / 2 - 100}, ${height + margin.bottom - 20})`);
            
        //~ tracks legend
        legend.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 6)
            .attr("fill", "#4ADE80");
            
        legend.append("text")
            .attr("x", 15)
            .attr("y", 4)
            .text("Tracks Played")
            .style("font-size", "14px")
            .style("fill", "#ccc");
            
        //~ mins legend
        legend.append("circle")
            .attr("cx", 150)
            .attr("cy", 0)
            .attr("r", 6)
            .attr("fill", "#3B82F6");
            
        legend.append("text")
            .attr("x", 165)
            .attr("y", 4)
            .text("Minutes Listened")
            .style("font-size", "14px")
            .style("fill", "#ccc");
        
    }, [data, loading, timeFrame]);
    
    //& helper function format tooltip dates based on timeframe
    const formatTooltipDate = (date, timeFrame) => {
        if (timeFrame === 'daily') {
            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        } else if (timeFrame === 'weekly') {
            //~ fr weekly, show week range
            const endDate = new Date(date);
            endDate.setDate(date.getDate() + 6);
            return `Week of ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
        } else {
            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
        }
    };
    
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
                <h3 className="text-xl font-semibold">Listening Trends</h3>
                
                <div className="flex space-x-2">
                    <button
                        onClick={() => setTimeFrame('daily')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            timeFrame === 'daily' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        Daily
                    </button>
                    <button
                        onClick={() => setTimeFrame('weekly')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            timeFrame === 'weekly' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setTimeFrame('monthly')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            timeFrame === 'monthly' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        Monthly
                    </button>
                </div>
            </div>
            
            <div className="relative">
                <svg ref={svgRef} width="100%" height="400"></svg>
                <div
                    ref={tooltipRef}
                    className="absolute bg-gray-900 text-white p-2 rounded shadow-lg pointer-events-none hidden"
                    style={{ display: 'none' }}
                >
                    <div className="date font-bold"></div>
                    <div className="tracks">
                        <span className="text-green-500">Tracks:</span> <span></span>
                    </div>
                    <div className="minutes">
                        <span className="text-blue-500">Minutes:</span> <span></span>
                    </div>
                </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-400">
                <p>
                    This chart shows your listening activity over time. Toggle between daily, weekly, and monthly views to see different patterns.
                </p>
                {data.length === 0 && (
                    <p className="mt-2 text-yellow-500">
                        No listening data available for this time period. Continue using Spotify with Re-Wrapped to see your trends!
                    </p>
                )}
            </div>
        </div>
    );
};

ListeningTrendsChart.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default ListeningTrendsChart;