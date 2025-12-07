import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const PORT = 3000;
const API_URL = "https://api.jikan.moe/v4/anime";

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "animeList",
  password: "123456",
  port: "5432",
});

try {
  db.connect();
  console.log("Connected to Database");
} catch (error) {
  console.error("Error connecting to database:", error.stack);
}

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM anime");
    const anime = result.rows;
    res.render("index.ejs", { animes: anime });
  } catch (error) {
    console.error("Error fetching data:", error.stack);
  }
});

app.get("/add-form", (req, res) => {
  res.render("add.ejs", { animes: [] });
});

app.post("/search", async (req, res) => {
  try {
    const animeTitle = req.body.animeTitle;
    console.log("Searching for:", animeTitle);
    const result = await axios.get(
      `${API_URL}?q=${encodeURIComponent(animeTitle)}`
    );
    const animeList = result.data.data;
    console.log("Found:", animeList.length, "results");
    res.render("add.ejs", { animes: animeList });
  } catch (error) {
    console.error("Error searching anime:", error.stack);
    res.render("add.ejs", { content: "Error searching anime", animes: [] });
  }
});

app.post("/add-anime", async (req, res) => {
  try {
    const mal_id = req.body.mal_id;
    const result = await axios.get(`${API_URL}/${mal_id}`);
    const { title, image_url, date_watched, rating, notes } = req.body;
    const episodes = result.data.data.episodes || 0;
    const malRating = result.data.data.score || 0;
    const status = result.data.data.status || "Unknown";

    await db.query(
      "INSERT INTO anime (title, rating, cover, notes, date_watched, episodes, malrating, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        title,
        rating,
        image_url,
        notes,
        date_watched,
        episodes,
        malRating,
        status,
      ]
    );
    res.redirect("/");
  } catch (error) {
    console.error("Error adding anime:", error.stack);
  }
});

app.post("/delete/:id", async (req, res) => {
  const id = req.body.animeId;
  try {
    await db.query("DELETE FROM anime WHERE id = $1", [id]);
    res.redirect("/");
  } catch (error) {
    console.error("Error removing item:", error.stack);
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
