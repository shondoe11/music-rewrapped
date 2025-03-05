# Project Brief

**Objective**  
Develop an interactive dashboard that aggregates Spotify listening data with live concert/event suggestions. The tool visualizes user trends (top tracks, artists, listening habits by location, etc.) and offers personalized recommendations and tagging for events.

**Tech Stack**  
- **Backend**: Flask, PostgreSQL  
- **Frontend**: React, TailwindCSS, D3.js, Recharts  

**Key Features**  
- Real-time data visualization of Spotify metrics  
- Dynamic concert suggestions via the Ticketmaster API  
- Personalized tagging and filtering of events  
- Multiple user roles (guest, regular, promoter) with specific privileges  
- Real-time notifications powered by Flask-Socket.IO for immediate event updates

---

## 2. Wireframe

### WF Overview

#### **Home**
- **Welcome to Music Re-Wrapped**
- “Hi there, \${user}! Scroll down to learn more about your music taste ⬇️”
- **Top Songs**
  - Leaderboard visualization to display user’s most-played tracks over a time frame (1 month, 3 months, 6 months, 1 year).
  - Show top 10 items in two columns.
  - Display each track’s artwork (square with padding, border radius, and Tailwind box shadows).
- **Favorite Genres Evolution**
  - A stream graph showing the user’s most listened-to genres over a selected time frame.
- **Top Artists**
  - Leaderboard visualization for most-played artists (similar time frames).
  - Show top 10 items in two columns.
  - Display each artist’s image (circle with padding, box shadows).
- **Longest Listening Streak**
  - Summaries of total minutes listened, biggest listening day, total tracks played.
  - A radial/polar chart highlighting hours listened each month.
- **Top Listeners (Percentile Ranking)**
  - A gauge/speedometer chart to show where the user ranks among listeners of a favorite artist.

#### **Re-Wrapped Page**
This page offers users deeper insights into their music listening habits beyond the basic homepage statistics. Key elements include:

- **In-Depth Analytics & Trends**  
  - Interactive multi-line charts that compare listening trends across different time frames (daily, weekly, monthly).  
  - Heatmaps displaying listening intensity by day of the week or hour of the day.

- **Genre & Mood Analysis**  
  - Bubble charts or scatter plots representing the diversity of genres, where bubble size indicates listening duration.  
  - Chord diagrams that illustrate correlations between artists and genres based on user activity.

- **Geographic Insights**  
  - Interactive maps highlighting listener density or concert attendance by region.  
  - Flow maps showing movement trends if location data is available.

- **Personalized Recommendations**  
  - A carousel featuring suggested concerts or new album releases tailored to the user’s listening habits.  
  - Dynamic ranking charts that update as new data is pulled from Spotify and external concert APIs.

#### **Events Page**
This page is designed to showcase concert and event data in an engaging, user-friendly format. Its components include:

- **Concert Listings & Details**  
  - A card-based layout that presents upcoming concerts with details such as location, date, and artist information.  
  - Integration of interactive maps to display concert venues relative to the user’s location.

- **Tagging & Engagement**  
  - Features allowing users to tag or save events with clear visual indicators (e.g., icons or labels).  
  - Timeline visualizations that show the user's saved events over upcoming weeks or months.

- **Filtering & Sorting**  
  - Advanced filtering options based on genre, date, location, and artist.  
  - Visual widgets such as sliders and dropdown menus to refine event lists in real time.

- **Real-Time Updates**  
  - Integration with Flask-Socket.IO to push notifications of new or updated events directly to the Events page.

#### **Promoter Panel**
Tailored for concert promoters, this panel provides tools to manage events and track engagement. Key features include:

- **Event Management Dashboard**  
  - A comprehensive view of submitted events with status indicators (pending, approved, rejected).  
  - Detailed metrics for each event (views, tags, user engagement over time).

- **Interactive Analytics**  
  - Time series charts that display trends in event engagement, such as tags over time and interest spikes.  
  - Comparative bar charts for analyzing multiple events side-by-side based on geographic reach or demographic data.

- **Content Submission & Updates**  
  - Intuitive forms for submitting new events, complete with real-time validation and preview features.  
  - Tools for editing or updating event details, including version control and change history.

- **Communication & Feedback**  
  - An integrated notification system (powered by Flask-Socket.IO) for direct communication between promoters and platform support.  
  - Aggregated feedback graphs (e.g., satisfaction ratings or sentiment analysis) to help promoters optimize their event listings.

---

## 3. User Stories

### Guest Users
- As a guest user, I want to connect via Spotify OAuth so I can quickly preview personalized music stats without signing up for a full account.  
- As a guest user, I want to see a limited dashboard with key metrics (top tracks, top artists, sample visualizations) so I can evaluate the value of the platform.  
- As a guest user, I want to be prompted to register when accessing advanced features so I understand the benefits of a full account.  
- As a guest user, I want to receive notifications when my session is nearing expiration so I can decide whether to upgrade and preserve my data.

### Regular Users
- As a user, I want to view detailed dashboards of my listening history to track trends over different time frames (daily, weekly, monthly, yearly).  
- As a user, I want to filter my data by genre, time period, or geographic region to uncover personalized insights about my listening habits.  
- As a user, I want to tag and save concerts or events I’m interested in so I can build a personalized list of upcoming events.  
- As a user, I want to receive real-time concert suggestions and notifications (via WebSockets) based on my listening trends so I can discover new live events.  
- As a user, I want to share interesting statistics or visualizations on social media to engage with my network and promote the platform.

### Concert Promoter Users
- As a promoter, I want to easily submit new event details so I can reach a highly engaged audience interested in live music.  
- As a promoter, I want to update or edit my event listings in real time to ensure that the information remains accurate and current.  
- As a promoter, I want to view detailed engagement analytics (such as views, tags, and interaction trends) for my events so I can measure their success.  
- As a promoter, I want to receive aggregated feedback on my event listings to help refine my promotional strategies.  
- As a promoter, I want to communicate directly with platform support through the promoter panel so that any issues or queries can be resolved quickly.

---

## 4. Data Model

### Users Table
- **User ID**, OAuth tokens, email, profile info, role (guest, regular, promoter), and preferences

### Listening History Table
- Records of Spotify activity (track IDs, play timestamps, user associations)

### Aggregated Stats Table
- Processed metrics (top tracks, top artists, genre distribution, geographic trends)

### Concert Events Table
- Event ID, title, location, date, promoter info, tagging details

### User Preferences & Tags Table
- User-selected tags, saved concerts, filtering criteria for personalized recommendations

### API Integration Logs
- Tracking calls to Spotify and Ticketmaster APIs for caching and performance monitoring
