import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import Loader from '../../styles/Loader';
import { getLongestListeningStreak } from '../../services/analyticsService';

const ListeningStreakSummary = ({ userId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const svgRef = useRef();
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const streakData = await getLongestListeningStreak(userId);
                setData(streakData);
                setError(null);
            } catch (err) {
                console.error('Error fetching listening streak data:', err);
                setError('Failed to load listening streak data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [userId]);
    
    //& create & update radial chart
    useEffect(() => {
        if (loading || !data || !data.monthly_hours || Object.keys(data.monthly_hours).length === 0) return;
        
        //~ clear prev chart
        d3.select(svgRef.current).selectAll("*").remove();
        
        //~ chart dimensions
        const width = 600;
        const height = 600;
        const margin = 60;
        const innerRadius = 80;
        const outerRadius = Math.min(width, height) / 2 - margin;
        
        //~ SVG
        const svg = d3.select(svgRef.current)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", "100%")
            .attr("height", "100%")
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);
            
        //~ process data
        const monthsData = [];
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        
        //& get reference year frm data / use current year
        let referenceYear = new Date().getFullYear();
        const monthlyHours = data.monthly_hours;
        const dataMonths = Object.keys(monthlyHours);
        
        if (dataMonths.length > 0) {
            //~ extract year frm first data point if avail
            referenceYear = parseInt(dataMonths[0].split('-')[0], 10);
        }
        
        //& generate all 12 months w empty data
        for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
            const monthNum = monthIndex + 1;
            const yearMonth = `${referenceYear}-${String(monthNum).padStart(2, '0')}`;
            
            monthsData.push({
                month: months[monthIndex],
                yearMonth: yearMonth,
                hours: 0 //~ default 0 hours
            });
        }
        
        //& now fill actual data where it exists
        Object.entries(monthlyHours).forEach(([yearMonth, hours]) => {
            const [year, monthStr] = yearMonth.split('-');
            const monthIndex = parseInt(monthStr, 10) - 1; //~ convert 0-based index
            
            //~ only update if year match reference year
            if (parseInt(year, 10) === referenceYear && monthIndex >= 0 && monthIndex < 12) {
                monthsData[monthIndex].hours = hours;
            }
        });
        
        //~ get max value fr scale
        const maxHours = d3.max(monthsData, d => d.hours) || 1;
        
        //~ scales
        const angleScale = d3.scaleLinear()
            .domain([0, monthsData.length])
            .range([0, 2 * Math.PI]);
            
        const radiusScale = d3.scaleLinear()
            .domain([0, maxHours])
            .range([innerRadius, outerRadius]);
            
        //~ add x axis (circles)
        const xAxisTicks = [maxHours * 0.25, maxHours * 0.5, maxHours * 0.75, maxHours];
        
        svg.selectAll(".circle-axis")
            .data(xAxisTicks)
            .join("circle")
            .attr("class", "circle-axis")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", d => radiusScale(d))
            .attr("fill", "none")
            .attr("stroke", "#374151")
            .attr("stroke-dasharray", "2,2")
            .attr("stroke-width", 1);
            
        //~ add x axis labels
        svg.selectAll(".circle-axis-label")
            .data(xAxisTicks)
            .join("text")
            .attr("class", "circle-axis-label")
            .attr("x", 0)
            .attr("y", d => -radiusScale(d))
            .attr("dy", -5)
            .attr("text-anchor", "middle")
            .attr("fill", "#9CA3AF")
            .attr("font-size", "10px")
            .text(d => `${Math.round(d)} hrs`);
            
        //~ add y axis (months)
        svg.selectAll(".month-line")
            .data(monthsData)
            .join("line")
            .attr("class", "month-line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => Math.cos(angleScale(i) - Math.PI / 2) * outerRadius)
            .attr("y2", (d, i) => Math.sin(angleScale(i) - Math.PI / 2) * outerRadius)
            .attr("stroke", "#374151")
            .attr("stroke-width", 1)
            .attr("opacity", 0.5);
            
        //~ add month labels
        svg.selectAll(".month-label")
            .data(monthsData)
            .join("text")
            .attr("class", "month-label")
            .attr("x", (d, i) => Math.cos(angleScale(i) - Math.PI / 2) * (outerRadius + 20))
            .attr("y", (d, i) => Math.sin(angleScale(i) - Math.PI / 2) * (outerRadius + 20))
            .attr("text-anchor", "middle")
            .attr("fill", "#D1D5DB")
            .attr("font-size", "12px")
            .text(d => d.month);
        
        //~ gradient
        const gradient = svg.append("defs")
            .append("radialGradient")
            .attr("id", "radialGradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", outerRadius);
            
        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#4ADE80")
            .attr("stop-opacity", 0.7);
            
        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#4ADE80")
            .attr("stop-opacity", 0.1);
            
        //~ create custom path fr filled area
        let pathData = "";
        
        //~ first draw line to inner radius at starting point
        let hasData = false;
        let startIndex = -1;
        
        //~ find first month w data
        for (let i = 0; i < monthsData.length; i++) {
            if (monthsData[i].hours > 0) {
                hasData = true;
                startIndex = i;
                break;
            }
        }
        
        if (hasData) {
            //& start @ center
            pathData = "M 0,0 ";
            
            //& draw line to first data point
            const startAngle = angleScale(startIndex) - Math.PI / 2;
            const startX = Math.cos(startAngle) * radiusScale(monthsData[startIndex].hours);
            const startY = Math.sin(startAngle) * radiusScale(monthsData[startIndex].hours);
            
            pathData += `L ${startX},${startY} `;
            
            //& add only months w data to path
            for (let i = 0; i < monthsData.length; i++) {
                if (monthsData[i].hours > 0) {
                    const angle = angleScale(i) - Math.PI / 2;
                    const x = Math.cos(angle) * radiusScale(monthsData[i].hours);
                    const y = Math.sin(angle) * radiusScale(monthsData[i].hours);
                    
                    pathData += `L ${x},${y} `;
                }
            }
            
            //~ close path back to center
            pathData += "Z";
            
            //~ draw custom path
            svg.append("path")
                .attr("d", pathData)
                .attr("fill", "url(#radialGradient)")
                .attr("stroke", "#4ADE80")
                .attr("stroke-width", 2)
                .attr("opacity", 0.6);
        } else {
            //~ fallback if no data - create small circle in center
            svg.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", innerRadius + 10)
                .attr("fill", "url(#radialGradient)")
                .attr("opacity", 0.6);
        }
            
        //& highlight months w actual data
        monthsData.forEach((d, i) => {
            if (d.hours > 0) {
                //~ add highlight to month w data
                svg.append("circle")
                    .attr("cx", Math.cos(angleScale(i) - Math.PI / 2) * radiusScale(d.hours))
                    .attr("cy", Math.sin(angleScale(i) - Math.PI / 2) * radiusScale(d.hours))
                    .attr("r", 8)
                    .attr("fill", "rgba(74, 222, 128, 0.2)")
                    .attr("stroke", "#4ADE80")
                    .attr("stroke-width", 1);
            }
        });
            
        //~ dots - only show dots fr months w data
        svg.selectAll(".dot")
            .data(monthsData)  //~ use all months data
            .join("circle")
            .attr("class", "dot")
            .attr("cx", (d, i) => Math.cos(angleScale(i) - Math.PI / 2) * (d.hours > 0 ? radiusScale(d.hours) : innerRadius))
            .attr("cy", (d, i) => Math.sin(angleScale(i) - Math.PI / 2) * (d.hours > 0 ? radiusScale(d.hours) : innerRadius))
            .attr("r", d => d.hours > 0 ? 5 : 3)  //~ smaller dots fr months w no data
            .attr("fill", d => d.hours > 0 ? "#4ADE80" : "#555555")  //~ diff color fr months w no data
            .attr("stroke", "#FFF")
            .attr("stroke-width", d => d.hours > 0 ? 1.5 : 0.5)  //~ thinner stroke fr months w no data
            .append("title")
            .text(d => `${d.month}: ${Math.round(d.hours)} hours`);
            
        //~ center text
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "-0.5em")
            .attr("fill", "#FFF")
            .attr("font-size", "16px")
            .text("Hours");
            
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.5em")
            .attr("fill", "#FFF")
            .attr("font-size", "16px")
            .text("Listened");
            
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
    
    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (hours > 0) {
            return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
        }
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };
    
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow mb-8">
            <div className="flex flex-col md:flex-row items-start justify-between mb-6">
                <h3 className="text-xl font-semibold mb-4 md:mb-0">Listening Streak Summary</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 text-center">
                    <div className="text-sm text-gray-400 mb-1">Total Listening Time</div>
                    <div className="text-3xl font-bold text-green-500">{formatTime(data.total_minutes)}</div>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 text-center">
                    <div className="text-sm text-gray-400 mb-1">Total Tracks Played</div>
                    <div className="text-3xl font-bold text-green-500">{data.total_tracks.toLocaleString()}</div>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 text-center">
                    <div className="text-sm text-gray-400 mb-1">Biggest Listening Day</div>
                    <div className="text-3xl font-bold text-green-500">{formatDate(data.biggest_listening_day)}</div>
                </div>
            </div>
            
            <div className="mt-6">
                <h4 className="text-lg font-medium mb-4 text-center">Monthly Listening Hours</h4>
                <div className="relative flex justify-center">
                    <svg ref={svgRef} width="100%" height="500"></svg>
                </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-400">
                <p>
                    This chart shows your listening activity over the past year. The radial visualization displays hours spent listening to music each month, with higher values extending further from the center.
                </p>
            </div>
        </div>
    );
};

ListeningStreakSummary.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default ListeningStreakSummary;