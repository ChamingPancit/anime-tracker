# My Anime Collection

A full-stack web application for tracking your favorite anime series. Search from thousands of anime titles, add them to your personal collection with ratings, dates watched, and custom notes.

## Features

- **Anime Search**: Search from MyAnimeList's extensive database using the Jikan API
- **Personal Collection**: Add anime to your list with custom information
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

3. Create a PostgreSQL database and table:
```sql
CREATE TABLE anime (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  rating INT,
  cover VARCHAR(500),
  notes TEXT,
  date_watched DATE,
  episodes INT,
  mal_rating FLOAT,
  status VARCHAR(100)
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

1. **Search Anime**: Click "Add Anime" button, search for anime titles
2. **Add to Collection**: Click "Add to My List" on search results
3. **Enter Details**: 
   - Date watched (when you completed it)
   - Your rating (1-10 scale)
   - Personal notes
4. **View Collection**: Your anime appears on the main page
5. **Hover for Details**: Hover over cards to see episodes, MAL rating, and status
6. **Delete**: Remove anime by clicking the Delete button

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
- User authentication
- Watch list and completed list separation
- Export collection to CSV
- Social sharing features

## License

MIT

## Contributing

Feel free to fork and submit pull requests!
