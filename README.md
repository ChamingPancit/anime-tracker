# My Anime Collection

A full-stack web application for tracking your favorite anime series. Search from thousands of anime titles, add them to your personal collection with ratings, dates watched, and custom notes.

## Features

- **User Authentication**: Register and login with email/password
- **Anime Search**: Search from MyAnimeList's extensive database using the Jikan API
- **Personal Collection**: Add anime to your list with custom information
- **User-Specific Lists**: Each user has their own anime collection
- **Ratings & Notes**: Rate anime 1-10 and add personal notes for each title
- **Track Progress**: Record the date you watched each anime
- **MAL Integration**: View episodes, MyAnimeList ratings, and air status for each anime
- **Responsive Design**: Clean, card-based UI with hover interactions
- **Delete Management**: Remove anime from your collection with ease

## Tech Stack

**Frontend:**

- EJS (Embedded JavaScript templating)
- HTML5
- CSS3 (Flexbox, transitions, hover effects)

**Backend:**

- Node.js
- Express.js
- PostgreSQL
- Passport.js (authentication)
- bcrypt (password hashing)

**APIs:**

- Jikan v4 API (MyAnimeList data source)

## Installation

### Prerequisites

- Node.js and npm installed
- PostgreSQL database
- Git

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd anime-list
```

2. Install dependencies:

```bash
npm install
```

3. Create a PostgreSQL database and tables:

```sql
-- Users table for authentication
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- Anime table with user_id foreign key
CREATE TABLE anime (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  rating INT,
  cover VARCHAR(500),
  notes TEXT,
  date_watched DATE,
  episodes INT,
  malrating FLOAT,
  status VARCHAR(100),
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
```

4. Configure database connection in `index.js`

5. Start the server:

```bash
npm start
```

Or with nodemon for development:

```bash
nodemon index.js
```

6. Open `http://localhost:3000` in your browser

## Usage

1. **Register**: Create a new account with email, username, and password
2. **Login**: Access your personal anime collection
3. **Search Anime**: Use the search bar in the header to find anime titles
4. **Add to Collection**: Click "Add to My List" on search results
5. **Enter Details**:
   - Date watched (when you completed it)
   - Your rating (1-10 scale)
   - Personal notes
6. **View Collection**: Your anime appears on the anime page
7. **Hover for Details**: Hover over cards to see episodes, MAL rating, and status
8. **Delete**: Remove anime by clicking the Delete button
9. **Logout**: Click logout in the header to end your session

## Project Structure

```
anime-list/
├── index.js                 # Main server file
├── package.json
├── public/
│   └── styles/
│       └── main.css        # Application styling
└── views/
    ├── index.ejs           # Main anime collection page
    ├── add.ejs             # Search results page
    └── partials/
        ├── header.ejs
        └── footer.ejs
```

## API Integration

Uses the **Jikan v4 API** (https://jikan.moe/) for anime data:

- Search endpoint: `/anime?q=search_term`
- Details endpoint: `/anime/{mal_id}`

## Future Enhancements

- Edit anime entries
- Sort and filter collection
- Watch list and completed list separation
- Export collection to CSV
- Social sharing features
- User profiles and follow system
- Review and rating system

## License

MIT

## Contributing

Feel free to fork and submit pull requests!
