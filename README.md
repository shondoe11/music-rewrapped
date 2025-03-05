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
- Multiple user roles (regular, admin, promoter) with specific privileges  

---

# Wireframe

**WF Overview**  
- **Home Dashboard**: Summary of listening stats, current top tracks/artists, and event recommendations  
- **Detail Views**: Interactive charts for trends over time, geographic insights, and genre breakdowns  
- **Event Page**: Concert details, tagging functionality, and user-saved event list  
- **Admin/Promoter Panels**: Interfaces for managing user data, event submissions, and analytics  

---

# User Stories

## Regular Users

1. **Spotify OAuth Onboarding**  
   - *As a user, I want to sign in through Spotify OAuth, so that I can securely grant the app permission to access my listening data without sharing my credentials directly.*

2. **Personalized Dashboard**  
   - *As a user, I want to see a dashboard summarizing my top tracks, artists, and genres, so that I can quickly gauge my recent listening habits.*

3. **Detailed Listening History**  
   - *As a user, I want to explore my listening history over time, so that I can discover trends such as peak hours or day-by-day usage.*

4. **Concert Recommendations**  
   - *As a user, I want to see concert suggestions relevant to my top artists and location, so that I can easily find events I might enjoy.*

5. **Tagging & Favorites**  
   - *As a user, I want to tag and save concerts or recommended events, so that I can quickly revisit them later.*

6. **Profile Customization**  
   - *As a user, I want to set personal preferences (like location radius or preferred genres), so that the system tailors my event suggestions.*

7. **Social Sharing (Stretch)**  
   - *As a user, I want to share interesting stats on social media, so that I can show my friends my music tastes.*

---

## Admin Users

1. **Admin Login & Role Management**  
   - *As an admin, I want to log into an admin panel securely, so that I can manage the system without exposing sensitive controls to regular users.*

2. **User Oversight & Moderation**  
   - *As an admin, I want to see a list of all registered users, so that I can manage or moderate user profiles if necessary.*

3. **Concert/Event Moderation**  
   - *As an admin, I want to review and approve events submitted by promoters, so that I can maintain quality and relevancy of listings.*

4. **Analytics Dashboard**  
   - *As an admin, I want to see platform-wide metrics (e.g., user growth, top artists), so that I can make data-driven decisions.*

5. **API & System Health**  
   - *As an admin, I want to monitor API call rates and caching performance, so that I can ensure the app stays within quotas and maintains fast responses.*

6. **User Feedback & Reporting**  
   - *As an admin, I want to manage and respond to user-reported issues or feedback, so that I can maintain a positive user experience.*

---

## Concert Promoter Users

1. **Promoter Registration & Dashboard**  
   - *As a concert promoter, I want to log in and access a dedicated promoter dashboard, so that I can manage my events.*

2. **Event Creation & Management**  
   - *As a promoter, I want to create and edit event listings, so that I can reach the right audience with up-to-date information.*

3. **Analytics & Insights**  
   - *As a promoter, I want to see how many users have viewed or tagged my events, so that I can gauge event popularity and adjust promotions.*

4. **Targeted Recommendations**  
   - *As a promoter, I want to customize or suggest events to specific user segments (by genre or location), so that my events reach the most relevant audience.*

5. **Collaboration with Admin**  
   - *As a promoter, I want to easily contact admins if I encounter issues or need special promotions, so that communication is streamlined.*

---

# Data Model

1. **Users Table**  
   - Columns: User ID, OAuth tokens, email, profile info, role (regular, admin, promoter), and preferences.

2. **Listening History Table**  
   - Stores records of Spotify activity (track IDs, play timestamps, user associations).

3. **Aggregated Stats Table**  
   - Holds processed metrics (top tracks, top artists, genre distribution, geographic trends).

4. **Concert Events Table**  
   - Contains event ID, title, location, date, promoter info, and tagging details.

5. **User Preferences & Tags Table**  
   - Stores user-selected tags, saved concerts, filtering criteria for personalized recommendations.

6. **API Integration Logs**  
   - Tracks calls to Spotify and Ticketmaster APIs for caching and performance monitoring.
