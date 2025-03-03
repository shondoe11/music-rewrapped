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

**Regular Users**  
- As a user, I want to view my personalized music stats so that I can see my listening trends and discover new events based on my tastes.  
- As a user, I want to tag and save concerts I’m interested in so that I can easily track events I want to attend.  

**Admin Users**  
- As an admin, I want to monitor aggregated user data so that I can ensure the platform is functioning optimally and address any issues.  
- As an admin, I want to manage user-generated content and event recommendations to maintain quality and relevancy.  

**Concert Promoter Users**  
- As a promoter, I want to submit and update event details so that I can reach a targeted audience based on their music preferences.  
- As a promoter, I want to view engagement analytics on my events so that I can optimize my promotional strategies.  

---

# Data Model

**Users Table**  
- User ID, OAuth tokens, email, profile info, role (regular, admin, promoter), and preferences  

**Listening History Table**  
- Record of Spotify activity (track IDs, play timestamps, user associations)  

**Aggregated Stats Table**  
- Processed metrics (top tracks, top artists, genre distribution, geographic trends)  

**Concert Events Table**  
- Event ID, title, location, date, promoter info, and tagging details  

**User Preferences & Tags Table**  
- User-selected tags, saved concerts, filtering criteria for personalized recommendations  

**API Integration Logs**  
- Tracking calls to Spotify and Ticketmaster APIs for caching and performance monitoring  
