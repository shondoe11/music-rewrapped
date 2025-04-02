# Music Re-Wrapped

## Project Brief

Music Re-Wrapped is an interactive app that aggregates Spotify listening data and integrates live event suggestions. The platform provides users with personalized insights into their music habits through dynamic data visualizations while offering event discovery and management capabilities. Users can explore their recently played tracks, top tracks, albums, artists, and evolving genre preferences. The application supports multiple user roles (guest, regular, and promoter) and leverages Spotify’s API for personalized data.

## Tech Stack

- **Backend:**  
  - **Python + Flask:** Lightweight and flexible framework ideal for building RESTful APIs.  
  - **PostgreSQL:** Robust relational database system for storing user data and aggregated metrics.  
  - **Celery:** For distributed background task processing, such as syncing and aggregating listening data.  
  - **Redis:** For high-performance caching, session management, and as a Celery message broker.

- **Frontend:**  
  - **React JS:** Provides a dynamic, component-based UI, enabling interactive dashboards.  
  - **SWC (via React-SWC):** Offers faster compilation and build times, enhancing developer productivity.
  - **TailwindCSS:** For quick and responsive styling.  
  - **D3.js:** For creating custom, complex data visualizations.  
  - **Recharts:** For simpler and reusable chart components.  
  - **Reactbits.dev Components:** To leverage pre-built, modular UI components that accelerate development and ensure design consistency.  
  - **Axios:** For streamlined API requests.  
  - **React-Toastify:** For user notifications and alerts.  
  - **React Hook Form:** For efficient and performant form management.

- **Other Tools:**  
  - **Git** for version control  
  - **Vite** for fast development build processes

## Key Features (Accomplished)

- **User Authentication:**  
  - Integration with Spotify OAuth for initial login.
  - Re-Wrapped registration that upgrades a guest user to a full account.
  
- **Dashboard:**  
  - Displays user-specific data including recently played tracks, top tracks, top albums, and top artists.  
  - Interactive visualizations:
    - **Top Tracks/Albums/Artists Charts:** Rendered using animated lists and responsive UI components.
    - **Favorite Genres Evolution:** A dynamic stream graph built with D3.js that shows genre trends over different time frames.
  
- **Events Page:**  
  - Lists recommended events (fetched via external APIs like Ticketmaster and Jambase) and internal sponsored events.
  - Allows users to save events for later reference.
  - Provides country-based search functionality for event listings.
  
- **Promoter Panel:**  
  - Enables promoters to submit new events and manage existing event listings.
  - Analytics dashboard with metrics like views, saves, and engagement.
  - Time series data visualization for event performance tracking.
  - Targeting effectiveness analysis to optimize event promotion strategies.

- **User Profile:**  
  - Displays profile information synced from Spotify.
  - Allows users to update interest preferences and change their password.
  
- **API Integration:**  
  - Server endpoints to interact with Spotify for recently played tracks, top artists, top tracks, and top albums.
  - Endpoints to handle event-related operations (list, save, delete, and promoter events).
  - Analytics endpoints for tracking and reporting event performance metrics.

## Data Model

- **Users Table:**  
  - Stores user authentication data (Spotify OAuth tokens), basic profile info (email, display name, profile image), role (guest, regular, promoter), and preferences.
  
- **Listening History Table:**  
  - Records Spotify activity (track IDs, play timestamps, duration, and associated genres).
  
- **Aggregated Stats Table:**  
  - Contains processed metrics such as top tracks, top artists, and genre distribution for each user.
  
- **Events Table:**  
  - Maintains concert and event details (title, location, date, promoter info, tags, and external URLs).
  - Tracks performance metrics such as views, saves, and engagement scores.

- **Event Metrics Log Table:** 
  - Stores time-series data for event analytics to track daily views and saves.
  
- **User Preferences & Tags Table:**  
  - Captures user-specific settings for interests and personalization.

- **Saved Events Table:**  
  - Links users to their saved events for easy retrieval.

- **API Integration Logs:**  
  - Logs API calls to external services (Spotify, Ticketmaster, Jambase) for performance monitoring and caching purposes.

## Architecture Diagram

```mermaid
flowchart TD
    subgraph CLIENT["Client Side (React App)"]
        A["React Application"]
        B["Axios HTTP Requests"]
    end

    subgraph SERVER["Server Side (Flask App)"]
        D["Flask Endpoints"]
        E["Authentication & OAuth"]
        F["Celery Worker Tasks"]
        G["SQLAlchemy / PostgreSQL"]
        H["Redis (Caching & Sessions)"]
    end

    subgraph EXTERNAL["External APIs"]
        J["Spotify API"]
        K["Ticketmaster API"]
        L["Jambase API"]
    end

    %% Data Flow
    A --> B
    B --> D
    D --> G
    D --> H
    D --> E
    D -->|Fetch Data| J
    D -->|Fetch Events| K
    D -->|Fetch Events| L
    D -->|Triggers| F
    F --> G
    F --> H
  ```

## Key Learnings

Developing Music Re-Wrapped provided several valuable insights into technology selection and system architecture:

- **Backend (Python + Flask):**  
  - *Lightweight & Flexible:* Flask’s minimalistic design allowed for rapid development and easy integration with extensions like Flask-Migrate.
  ```
  from flask import Flask
  from server.config import DevelopmentConfig
  from .extensions import db
  from flask_migrate import Migrate

  migrate = Migrate()  <- Flask-Migrate instance

  def create_app(config_class=DevelopmentConfig):
      app = Flask(__name__)
      app.config.from_object(config_class)
      
      db.init_app(app)
      migrate.init_app(app, db)  <- Flask-Migrate is easily integrated here

      return app
  ```
  - *Ease of API Development:* Python’s extensive ecosystem made it straightforward to interact with external APIs, manage authentication flows, and handle complex data aggregation tasks.

- **Frontend (React JS + SWC):**  
  - *Component-Based Architecture:* React JS enabled a modular design that makes it easy to build and maintain dynamic, interactive dashboards.
  - *Enhanced Performance:* Utilizing SWC for compiling React code resulted in faster build times and improved overall performance, enhancing the development experience.

- **Redis:**  
  - *High-Performance Caching:* Redis has been essential in caching frequently accessed data, reducing API response times, and ensuring smooth performance even under load.
  ```
  # sync-tasks.py: fetch_listening_history
  if track.get('artists'):
            primary_artist = track['artists'][0]
            artist_id = primary_artist.get('id')
            #~ try to get genre info from redis 1st if available
            genres = redis_client.get(f'artist_genre:{artist_id}')
            if genres is None:
                #~ cache doesn't have -> fetch from Spotify get artist endpoint
                artist_url = f'https://api.spotify.com/v1/artists/{artist_id}'
                artist_response = requests.get(artist_url, headers=headers)
                if artist_response.status_code == 200:
                    artist_data = artist_response.json()
                    genres_list = artist_data.get('genres', [])
                    if genres_list:
                        genres = ', '.join(genres_list)
                    else:
                        genres = ''
                    #~ cache genre info in redis, expire in 1 day
                    redis_client.setex(f'artist_genre:{artist_id}', timedelta(days=1), genres)
    ```
  - *Session Management:* Its reliability for managing user sessions, especially for OAuth tokens and state management, has been invaluable.
  ```
  # storing session data as seen in server/config
  # also used it to store signed state value in session for later validation in auth route during Spotify's Oauth callback process below
  # in server/routes/auth.py during the OAuth callback process
  raw_state = secrets.token_urlsafe(16)
  state = serializer.dumps(raw_state)
  session['spotify_oauth_state'] = state  # Store state in the session for validation later
  ```
- **Celery:**  
  - *Background Task Processing:* Celery enables offloading of heavy tasks such as data syncing and aggregation, ensuring that the main application remains responsive to user interactions.
  ```
  see shared_tasks in sync_tasks.py
  ```
  - *Scalability:* By decoupling real-time user interactions from intensive data processing, the system is better equipped to scale as the user base grows.
  ```
  @shared_task
  def sync_all_users():
      """
      celery task: loop thru active users and trigger bg tasks fr sync listen history and aggregating stats
      """
      users = User.query.all()
      for user in users:
          fetch_listening_history.delay(user.id) 
          aggregate_listening_history_task.delay(user.id)
      
      db.session.commit()
      
      return {'message': 'all users syncing tasks triggered'}
    ```
- **Styling & Component Reusability:**  
  - *TailwindCSS & Reactbits.dev Components:* Leveraging utility-first CSS and pre-built components has accelerated UI development and ensured a consistent design across the application.  
  - *Improved User Experience:* Dynamic visualizations (via D3.js) with a modern, responsive design has greatly enhanced the overall user experience.

## Stretch Goals

The following features were part of the original vision but have not yet been fully implemented in the current version:

- **Advanced Data Aggregation & Persistence:**  
  - Persisting long-term listening history to generate deeper insights (e.g., detailed listening streaks, monthly listening hours).
  
- **Enhanced Visualizations:**  
  - Interactive multi-line charts, heatmaps, and chord diagrams for genre–artist correlations.
  - Radial/polar charts to highlight monthly listening patterns.
  
- **Promoter Panel Analytics:**  
  - In-depth, real-time analytics including comparative bar charts for event engagement (views, saves, tags) and detailed targeting metrics.
  
- **Additional Spotify Features:**  
  - Integration of further Spotify scopes (e.g., user-read-currently-playing, user-modify-playback-state) to control and display real-time playback details.
  
- **Recommend Friends Feature:**  
  - Building a custom matching algorithm by comparing public listening data between registered users.
  
- **Expanded Event Management:**  
  - Additional external API integrations and more robust caching to reduce API calls for event data.
  
- **Improved Customization & Filtering:**  
  - Advanced filtering options for dashboards and events based on additional user preferences (geographic data, time periods, etc.).
  
- **Real-Time Notifications (Socket.IO):**  
  - Although basic server-side Socket.IO functionality exists, full integration into the frontend and user interface for real-time notifications remains a stretch goal.

## Attributions

The development of Music Re-Wrapped was influenced and supported by several key resources:

- **Spotify API Documentation:**  
  - [Spotify for Developers](https://developer.spotify.com/documentation/web-api/)
  
- **Flask and Flask-Socket.IO:**  
  - [Flask Documentation](https://flask.palletsprojects.com/)  
  - [Flask-SocketIO Documentation](https://flask-socketio.readthedocs.io/)
  
- **React and React Ecosystem:**  
  - [React Official Website](https://reactjs.org/)  
  - [React Router](https://reactrouter.com/)  
  - [React-Toastify](https://fkhadra.github.io/react-toastify/)
  
- **Data Visualization Libraries:**  
  - [D3.js Documentation](https://d3js.org/)  
  - [Recharts Documentation](https://recharts.org/en-US/)
  
- **Styling Components:**  
  - [TailwindCSS](https://tailwindcss.com/)  
  - [Reactbits.dev](https://reactbits.dev/) for reusable and modular UI components
  
- **Background Processing and Caching:**  
  - [Celery Documentation](https://docs.celeryq.dev/)  
  - [Redis Documentation](https://redis.io/documentation)

- **Additional Tools and Libraries:**  
  - [Axios](https://axios-http.com/) for API requests  
  - [React Hook Form](https://react-hook-form.com/) for form management