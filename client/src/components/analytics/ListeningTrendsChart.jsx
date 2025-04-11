import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import Loader from '../../styles/Loader';
import { getListeningTrends } from '../../services/analyticsService';
import { motion } from 'framer-motion';

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
        const margin = { top: 20, right: 60, bottom: 70, left: 60 };
        const width = 900 - margin.left - margin.right;
        const height = 420 - margin.top - margin.bottom;
        
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
                        return `${d3.timeFormat("%b %d")(d)}`;
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
            
        //~ add gradient fr tracks line
        const tracksGradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "tracksGradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");
            
        tracksGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#4ADE80");
            
        tracksGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#22C55E");
            
        //~ add gradient fr minutes line
        const minutesGradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "minutesGradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");
            
        minutesGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#3B82F6");
            
        minutesGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#60A5FA");
            
        //~ area under tracks line
        const tracksArea = d3.area()
            .x(d => x(d.date))
            .y0(height)
            .y1(d => yTrackCount(d.trackCount))
            .curve(d3.curveMonotoneX);
            
        svg.append("path")
            .datum(parsedData)
            .attr("fill", "url(#tracksGradient)")
            .attr("fill-opacity", 0.1)
            .attr("d", tracksArea);
            
        //~ add line fr tracks played
        const tracksLine = d3.line()
            .x(d => x(d.date))
            .y(d => yTrackCount(d.trackCount))
            .curve(d3.curveMonotoneX);
            
        svg.append("path")
            .datum(parsedData)
            .attr("fill", "none")
            .attr("stroke", "url(#tracksGradient)")
            .attr("stroke-width", 3)
            .attr("d", tracksLine);
            
        //~ add line fr minutes listened
        const minutesLine = d3.line()
            .x(d => x(d.date))
            .y(d => yMinutes(d.minutes))
            .curve(d3.curveMonotoneX);
            
        svg.append("path")
            .datum(parsedData)
            .attr("fill", "none")
            .attr("stroke", "url(#minutesGradient)")
            .attr("stroke-width", 3)
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
                //~ chart container position fr better tooltip positioning
                const chartRect = svgRef.current.getBoundingClientRect();
                const tooltipWidth = 200;
                const tooltipHeight = 100;
                
                //~ calculate position (above the point)
                let xPosition = event.clientX - chartRect.left - tooltipWidth / 2;
                let yPosition = event.clientY - chartRect.top - tooltipHeight - 10;
                
                //~ make sure tooltip stays within chart bounds
                xPosition = Math.max(0, Math.min(xPosition, chartRect.width - tooltipWidth));
                yPosition = Math.max(10, yPosition);
                
                //~ show tooltip
                d3.select(tooltipRef.current)
                    .style("display", "block")
                    .style("left", `${xPosition}px`)
                    .style("top", `${yPosition}px`)
                    .style("transform", "translateY(0)")
                    .html(`
                        <div class="date">${formatTooltipDate(d.date, timeFrame)}</div>
                        <div class="tracks"><span>Tracks:</span> ${d.trackCount}</div>
                        <div class="minutes"><span>Minutes:</span> ${d.minutes}</div>
                    `);
                    
                //~ highlight dot
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 7)
                    .attr("stroke", "white")
                    .attr("stroke-width", 2);
            })
            .on("mouseout", function() {
                //~ hide tooltip
                d3.select(tooltipRef.current)
                    .style("display", "none");
                    
                //~ restore dot
                d3.select(this)
                    .transition()
                    .duration(200)
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
                //~ chart container position fr better tooltip positioning
                const chartRect = svgRef.current.getBoundingClientRect();
                const tooltipWidth = 200;
                const tooltipHeight = 100;
                
                //~ calculate position (above the point)
                let xPosition = event.clientX - chartRect.left - tooltipWidth / 2;
                let yPosition = event.clientY - chartRect.top - tooltipHeight - 10; 
                
                //~ make sure tooltip stays within chart bounds
                xPosition = Math.max(0, Math.min(xPosition, chartRect.width - tooltipWidth));
                yPosition = Math.max(10, yPosition);
                
                //~ show tooltip
                d3.select(tooltipRef.current)
                    .style("display", "block")
                    .style("left", `${xPosition}px`)
                    .style("top", `${yPosition}px`)
                    .style("transform", "translateY(0)")
                    .html(`
                        <div class="date">${formatTooltipDate(d.date, timeFrame)}</div>
                        <div class="tracks"><span>Tracks:</span> ${d.trackCount}</div>
                        <div class="minutes"><span>Minutes:</span> ${d.minutes}</div>
                    `);
                    
                //~ highlight dot
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 7)
                    .attr("stroke", "white")
                    .attr("stroke-width", 2);
            })
            .on("mouseout", function() {
                //~ hide tooltip
                d3.select(tooltipRef.current)
                    .style("display", "none");
                    
                //~ restore dot
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 4)
                    .attr("stroke", "none");
            });
            
        //~ add legend
        const legend = svg.append("g")
            .attr("transform", `translate(${width / 2 - 100}, ${height + 40})`);
            
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
        return (
            <motion.div 
                className="flex justify-center items-center h-64"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Loader />
            </motion.div>
        );
    }
    
    if (error) {
        return (
            <motion.div 
                className="p-6 bg-red-900/20 border border-red-500/50 rounded-xl backdrop-blur-sm text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <p className="text-red-400 font-medium text-lg">{error}</p>
                <p className="text-gray-400 mt-2">Please try refreshing the page.</p>
            </motion.div>
        );
    }
    
    return (
        <motion.div 
            className="bg-gray-800/40 backdrop-blur-xl p-6 rounded-xl border border-gray-700/50 shadow-xl hover:shadow-green-500/5 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
                <motion.h3 
                    className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    Listening Trends
                </motion.h3>
                
                <motion.div 
                    className="flex space-x-1 sm:space-x-2 bg-gray-900/50 p-1 rounded-lg w-full sm:w-auto justify-around sm:justify-start"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <button
                        onClick={() => setTimeFrame('daily')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${
                            timeFrame === 'daily' 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' 
                            : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
                        }`}
                    >
                        Daily
                    </button>
                    <button
                        onClick={() => setTimeFrame('weekly')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${
                            timeFrame === 'weekly' 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' 
                            : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
                        }`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setTimeFrame('monthly')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${
                            timeFrame === 'monthly' 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' 
                            : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
                        }`}
                    >
                        Monthly
                    </button>
                </motion.div>
            </div>
            
            <div className="relative">
                <svg ref={svgRef} width="100%" height="420" className="overflow-visible"></svg>
                <div
                    ref={tooltipRef}
                    className="absolute bg-gray-900/90 backdrop-blur-md text-white p-3 rounded-lg shadow-lg border border-gray-700/50 pointer-events-none hidden z-50 max-w-[200px]"
                    style={{ display: 'none', position: 'absolute' }}
                >
                    <div className="date font-bold text-sm mb-1 text-gray-300"></div>
                    <div className="tracks text-sm">
                        <span className="text-green-400 font-medium">Tracks:</span> <span></span>
                    </div>
                    <div className="minutes text-sm">
                        <span className="text-blue-400 font-medium">Minutes:</span> <span></span>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 text-sm text-gray-400 border-t border-gray-700/30 pt-4">
                <p>
                    This chart shows your listening activity over time. Toggle between daily, weekly, and monthly views to see different patterns.
                </p>
                {data.length === 0 && (
                    <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                        <p className="text-yellow-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            No listening data available for this time period. Continue using Spotify with Re-Wrapped to see your trends!
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

ListeningTrendsChart.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default ListeningTrendsChart;