import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { getSpotifyTopArtistsWithGenres } from '../api';
import { isSafari } from '../utils/browserDetection';
import SpotifyAttribution from './utils/SpotifyAttribution';

const timeFrameMapping = [
  { label: 'Last 4 Weeks', value: 'short_term' },
  { label: 'Last 6 Months', value: 'medium_term' },
  { label: 'All Time', value: 'long_term' }
];

const FavoriteGenresEvolution = ({ userId }) => {
  const [data, setData] = useState([]);
  const [topGenres, setTopGenres] = useState([]); //~ new state to store union of top genres
  const svgRef = useRef();
  const tooltipRef = useRef();
  
  //& animation states & ref fr scroll detection
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  //& handle visibility detection when scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        //& update visibility state based on intersection
        setIsVisible(entries[0].isIntersecting);
      },
      { threshold: 0.2 } //~ higher threshold since taller component
    );
    
    //& capture current ref value to avoid stale refs in cleanup
    const currentRef = containerRef.current;
    
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    Promise.all(
      timeFrameMapping.map(tf =>
        getSpotifyTopArtistsWithGenres(userId, tf.value, 50)
          .then(result => {
            const genreData = {}; //~ { genre: { count, totalRank, uniqueArtists: Set } }
            result.artists.forEach((artist, idx) => {
              if (artist.genres && artist.genres.length > 0) {
                artist.genres.forEach(g => {
                  if (!genreData[g]) {
                    genreData[g] = { count: 0, totalRank: 0, uniqueArtists: new Set() };
                  }
                  genreData[g].count += 1;
                  genreData[g].totalRank += (idx + 1);
                  genreData[g].uniqueArtists.add(artist.id || artist.name);
                });
              }
            });
            //& output object including counts + extra info (store under prefixed key)
            const output = { timeFrame: tf.label };
            Object.entries(genreData).forEach(([genre, obj]) => {
              output[genre] = obj.count;
              output[`_${genre}`] = {
                avgRank: obj.count ? obj.totalRank / obj.count : 0,
                numArtists: obj.uniqueArtists.size
              };
            });
            return output;
          })
      )
    )
      .then(results => {
        //& compute global counts to determine overall top 10 genres
        let globalGenreCounts = {};
        results.forEach(obj => {
          Object.entries(obj).forEach(([key, value]) => {
            if (key !== 'timeFrame' && !key.startsWith('_')) {
              globalGenreCounts[key] = (globalGenreCounts[key] || 0) + value;
            }
          });
        });
        const top10Genres = Object.entries(globalGenreCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(entry => entry[0]);
        setTopGenres(top10Genres); //~ store union of top genres
        //& result filtering: include only top genres + extra info.
        const filteredResults = results.map(obj => {
          const newObj = { timeFrame: obj.timeFrame };
          top10Genres.forEach(genre => {
            newObj[genre] = obj[genre] || 0;
            newObj[`_${genre}`] = obj[`_${genre}`] || { avgRank: 0, numArtists: 0 };
          });
          return newObj;
        });
        setData(filteredResults);
      })
      .catch(err => {
        console.error("Failed to fetch favorite genres evolution data:", err);
      });
  }, [userId]);

  useEffect(() => {
    if (data.length === 0 || topGenres.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    //& margin & dimension adjustments fr responsiveness
    const margin = { top: 20, right: 50, bottom: 120, left: 65 },
      width = 900 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    //& use topGenres state fr keys so all 10 items show in legend
    const keys = topGenres;
    
    //& stack layout w wiggle offset fr streamgraph effect
    const stack = d3.stack().keys(keys).order(d3.stackOrderNone).offset(d3.stackOffsetWiggle);
    const series = stack(data);
    
    //& pre-calculate all visual percentages by timeframe for accurate tooltips
    const visualPercentages = {};
    data.forEach((timeFrameObj, timeIndex) => {
      const timeFrame = timeFrameObj.timeFrame;
      visualPercentages[timeFrame] = {};
      
      //& get total visual height for this timeframe
      const totalVisualHeight = series.reduce((acc, genreSeries) => {
        const height = Math.abs(genreSeries[timeIndex][1] - genreSeries[timeIndex][0]);
        return acc + height;
      }, 0);
      
      //& calculate percentage for each genre in this timeframe
      series.forEach((genreSeries) => {
        const genre = genreSeries.key;
        const height = Math.abs(genreSeries[timeIndex][1] - genreSeries[timeIndex][0]);
        visualPercentages[timeFrame][genre] = {
          height,
          percentage: totalVisualHeight > 0 ? (height / totalVisualHeight) * 100 : 0,
          hasVisibleStream: height > 0.001
        };
      });
    });

    //& X scale using time frame labels w minimal padding to stretch fully
    const x = d3.scalePoint()
      .domain(data.map(d => d.timeFrame))
      .range([0, width])
      .padding(0.1);

    const yMin = d3.min(series, layer => d3.min(layer, d => d[0]));
    const yMax = d3.max(series, layer => d3.max(layer, d => d[1]));
    const y = d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);

    //& color scale fr genres
    const color = d3.scaleOrdinal()
      .domain(keys)
      .range([
        "#4ADE80",
        "#3B82F6",
        "#F472B6",
        "#FB923C",
        "#A78BFA",
        "#34D399",
        "#F87171",
        "#FBBF24",
        "#60A5FA",
        "#C084FC"
      ]);

    //& area generator fr streamgraph w curved interpolation (using catmull rom for better curves)
    const area = d3.area()
      .x((d, i) => x(data[i].timeFrame))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]))
      .curve(d3.curveCatmullRom);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    if (!isSafari()) {
      //& draw layers w tooltip interactivity (non-Safari browsers)
      g.selectAll(".layer")
        .data(series)
        .enter().append("path")
        .attr("class", "layer")
        .attr("d", area)
        .style("fill", d => color(d.key))
        .style("opacity", 0.8)
        .on("mouseover", function(event) {
          d3.select(tooltipRef.current).style("display", "block");
        })
        .on("mousemove", function(event, d) {
          const [mouseX] = d3.pointer(event, g.node());
          const timeFrames = data.map(tf => tf.timeFrame);
          let closestIndex = 0;
          let minDist = Infinity;
          timeFrames.forEach((tf, idx) => {
            const dist = Math.abs(x(tf) - mouseX);
            if (dist < minDist) {
              minDist = dist;
              closestIndex = idx;
            }
          });
          const datum = data[closestIndex];
          const timeFrame = datum.timeFrame;
          
          const visualData = visualPercentages[timeFrame][d.key];
          const displayPercentage = Math.max(0.1, visualData.percentage).toFixed(1);
          
          const extra = datum[`_${d.key}`] || { avgRank: 0, numArtists: 0 };
          
          let artistCount = extra.numArtists || 0;
          if (artistCount === 0 && visualData.hasVisibleStream) {
            const totalArtists = Object.values(datum)
              .filter(v => typeof v === 'object' && v !== null && 'numArtists' in v)
              .reduce((sum, v) => sum + (v.numArtists || 0), 0);
            artistCount = Math.max(1, Math.floor((visualData.percentage / 100) * totalArtists) || 1);
          }
          
          let avgRank = artistCount > 0 ? extra.avgRank : 0;
          if (avgRank === 0 && visualData.hasVisibleStream) {
            avgRank = Math.max(1, Math.round(50 - ((visualData.percentage / 100) * 45)));
          }
          
          d3.select(tooltipRef.current)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px")
            .style("background", "rgba(0, 0, 0, 0.85)")
            .style("color", "#1DB954")
            .style("border-radius", "8px")
            .style("padding", "12px")
            .style("box-shadow", "0 4px 6px rgba(0, 0, 0, 0.1)")
            .style("font-weight", "500")
            .style("font-size", "14px")
            .style("line-height", "1.5")
            .html(`<strong style="color: #1DB954">Genre:</strong> <span style="color: white">${d.key}</span><br/>
                    <strong style="color: #1DB954">% Contribution:</strong> <span style="color: white">${displayPercentage}%</span><br/>
                    <strong style="color: #1DB954">Avg Rank:</strong> <span style="color: white">${avgRank.toFixed(1)}</span>`);
        })
        .on("mouseout", function() {
          d3.select(tooltipRef.current).style("display", "none");
        });
    } else {
      //& Safari-specific rendering & interaction
      console.log('Rendering Safari-specific chart');
      
      //~ first draw paths w/o events
      g.selectAll(".layer")
        .data(series)
        .enter().append("path")
        .attr("class", "layer")
        .attr("d", area)
        .style("fill", d => color(d.key))
        .style("opacity", 0.8);
      
      //~ create container fr hover areas
      const tooltipAreas = g.append("g").attr("class", "safari-tooltip-areas");
      
      //~ add invisible hover rectangles fr each genre/timeframe
      data.forEach((timeFrameData, timeIndex) => {
        keys.forEach((genreKey, genreIndex) => {
          const xPos = x(timeFrameData.timeFrame);
          const seriesData = series[genreIndex];
          const yPos = y(seriesData[timeIndex][1]);
          const height = Math.abs(y(seriesData[timeIndex][0]) - y(seriesData[timeIndex][1]));
          
          if (height > 0) {
            tooltipAreas.append("rect")
              .attr("x", xPos - 40)
              .attr("y", yPos)
              .attr("width", 80)
              .attr("height", height)
              .attr("fill", "transparent")
              .attr("data-genre", genreKey)
              .attr("data-timeframe", timeFrameData.timeFrame)
              .attr("class", "safari-tooltip-trigger")
              .style("cursor", "pointer")
              .on("mouseover", function() {
                const timeFrame = timeFrameData.timeFrame;
                
                //& use pre-calculated visual percentages
                const visualData = visualPercentages[timeFrame][genreKey];
                const displayPercentage = Math.max(0.1, visualData.percentage).toFixed(1);
                
                //& Calculate metrics based on visual proportion if raw data is zero
                const extra = timeFrameData[`_${genreKey}`] || { avgRank: 0, numArtists: 0 };
                
                //& Estimate artist count from visual percentage if actual count is zero
                let artistCount = extra.numArtists || 0;
                if (artistCount === 0 && visualData.hasVisibleStream) {
                  //~ estimate based on relative proportion [at least 1 artist]
                  const totalArtists = Object.values(timeFrameData)
                    .filter(v => typeof v === 'object' && v !== null && 'numArtists' in v)
                    .reduce((sum, v) => sum + (v.numArtists || 0), 0);
                  artistCount = Math.max(1, Math.floor((visualData.percentage / 100) * totalArtists) || 1);
                }
                
                //& Estimate average rank if actual rank is zero
                let avgRank = artistCount > 0 ? extra.avgRank : 0;
                if (avgRank === 0 && visualData.hasVisibleStream) {
                  //~ estimate based on % [smaller % get higher ranks]
                  avgRank = Math.max(1, Math.round(50 - ((visualData.percentage / 100) * 45)));
                }
                
                d3.select(tooltipRef.current)
                  .style("display", "block")
                  .style("background", "rgba(0, 0, 0, 0.85)")
                  .style("color", "#1DB954")
                  .style("border-radius", "8px")
                  .style("padding", "12px")
                  .style("box-shadow", "0 4px 6px rgba(0, 0, 0, 0.1)")
                  .style("font-weight", "500")
                  .style("font-size", "14px")
                  .style("line-height", "1.5")
                  .html(`<strong style="color: #1DB954">Genre:</strong> <span style="color: white">${genreKey}</span><br/>
                          <strong style="color: #1DB954">% Contribution:</strong> <span style="color: white">${displayPercentage}%</span><br/>
                          <strong style="color: #1DB954">Avg Rank:</strong> <span style="color: white">${avgRank.toFixed(1)}</span>`);
              })
              .on("mousemove", function(event) {
                d3.select(tooltipRef.current)
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 28) + "px");
              })
              .on("mouseout", function() {
                d3.select(tooltipRef.current).style("display", "none");
              });
          }
        });
      });
    }

    //& x-axis format & styling
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(10))
      .selectAll("text")
      .style("font-size", "16px")
      .style("fill", "#1e293b")
      .style("font-weight", "600");
      
    //& x-axis lines
    g.selectAll(".domain")
      .style("stroke", "rgba(30, 41, 59, 0.5)");
    g.selectAll(".tick line")
      .style("stroke", "rgba(30, 41, 59, 0.5)");

    //& y-axis format & styling
    const yAxis = g.append("g")
      .call(d3.axisLeft(y).ticks(5));
    
    yAxis.selectAll("text")
      .style("font-size", "14px")
      .style("fill", "#1e293b")
      .style("font-weight", "600");
      
    //& y-axis lines
    yAxis.select(".domain")
      .style("stroke", "rgba(30, 41, 59, 0.5)");
    yAxis.selectAll(".tick line")
      .style("stroke", "rgba(30, 41, 59, 0.5)");
      
    yAxis.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -50)
      .attr("fill", "#1e293b")
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .text("Genre count");

    //& legend positioning
    const legendAreaWidth = width;
    const legendItemWidth = 150;
    const itemsPerRow = Math.floor(legendAreaWidth / legendItemWidth) || 1;
    const legend = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${height + margin.top + 60})`);

    keys.forEach((key, i) => {
      const col = i % itemsPerRow;
      const row = Math.floor(i / itemsPerRow);
      legend.append("circle")
        .attr("cx", col * legendItemWidth + 9)
        .attr("cy", row * 30 + 9)
        .attr("r", 9)
        .attr("fill", color(key));
      legend.append("text")
        .attr("x", col * legendItemWidth + 22)
        .attr("y", row * 30 + 14)
        .style("font-size", "14px")
        .style("fill", "#1e293b")
        .style("font-weight", "600")
        .text(key);
    });

    //& Safari-specific SVG fixes
    if (isSafari()) {
      //~ set more explicit SVG attributes
      svg.attr('width', '100%')
         .attr('height', '100%')
         .attr('preserveAspectRatio', 'xMidYMid meet');
    }
  }, [data, topGenres]);

  return (
    <div className="mt-4" ref={containerRef}>
      <div 
        className="bg-gray-100/10 backdrop-blur-sm rounded-xl border border-gray-300/20 shadow-lg overflow-hidden p-4"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}
      >
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <svg ref={svgRef} viewBox="0 0 900 400" preserveAspectRatio="xMidYMid meet" width="100%" height="100%"></svg>
        </div>
        <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-300/20">
          <SpotifyAttribution size="sm" variant="black" />
          <a 
            href={`https://open.spotify.com/search/${encodeURIComponent(topGenres[0] || 'genres')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-green-500 transition-colors duration-300"
          >
            {topGenres.length > 0 ? `Explore ${topGenres[0]} on Spotify` : 'View Genres on Spotify'}
          </a>
        </div>
      </div>
      <div 
        ref={tooltipRef} 
        style={{ 
          position: 'absolute', 
          display: 'none',
          zIndex: 10,
          pointerEvents: 'none',
          transition: 'all 0.2s ease'
        }}
      ></div>
    </div>
  );
};

export default FavoriteGenresEvolution;