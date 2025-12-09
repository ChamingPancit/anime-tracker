import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import axios from "axios";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";

const app = express();
const PORT = 3000;
const API_URL = "https://api.jikan.moe/v4/anime";
const saltRounds = 10;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "HELLO WORLD",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

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

app.get("/", (req, res) => {
  res.render("login.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send("Error Logging out");
    }
    res.redirect("/");
  });
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/anime", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const userId = req.user.id;
      const anime = await db.query(
        "SELECT * FROM anime JOIN users ON anime.user_id = users.id WHERE users.id = $1",
        [userId]
      );
      res.status(200).render("anime.ejs", { animes: anime.rows });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(500).send("Error fetching data", error.stack);
  }
});

app.get("/add-form", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  res.render("add.ejs", { animes: [] });
});

app.post("/register", async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const existing = await db.query(
      "SELECT email, username FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (existing.rows.length > 0) {
      if (existing.rows.some((user) => user.email === email)) {
        return res.status(409).send("Email has already been used");
      }
      if (existing.rows.some((user) => user.username === username)) {
        return res.status(409).send("Username has already been used");
      }
    }
    const hash = await bcrypt.hash(password, saltRounds);
    await db.query(
      "INSERT INTO users (email, password, username) VALUES ($1, $2, $3)",
      [email, hash, username]
    );
    res.status(200).redirect("/login");
  } catch (error) {
    console.error("Failed to register:", error.stack);
    res.status(500).send("An error occurred. Please try again later.");
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/anime",
    failureRedirect: "/login",
  })
);

app.post("/search", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }

  try {
    const animeTitle = req.body.animeTitle;
    console.log("Searching for:", animeTitle);
    const result = await axios.get(
      `${API_URL}?q=${encodeURIComponent(animeTitle)}`
    );
    const animeList = result.data.data;
    console.log("Found:", animeList.length, "results");
    res.status(200).render("add.ejs", { animes: animeList });
  } catch (error) {
    console.error("Error searching anime:", error.stack);
    res
      .status(400)
      .render("add.ejs", { content: "Error searching anime", animes: [] });
  }
});

app.post("/add-anime", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }

  try {
    const mal_id = req.body.mal_id;
    const result = await axios.get(`${API_URL}/${mal_id}`);
    const { title, image_url, date_watched, rating, notes } = req.body;
    const episodes = result.data.data.episodes || 0;
    const malRating = result.data.data.score || 0;
    const status = result.data.data.status || "Unknown";
    await db.query(
      "INSERT INTO anime (title, rating, cover, notes, date_watched, episodes, malrating, status, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        title,
        rating,
        image_url,
        notes,
        date_watched,
        episodes,
        malRating,
        status,
        req.user.id,
      ]
    );
    res.status(200).redirect("/anime");
  } catch (error) {
    console.error("Error adding anime:", error.stack);
    res.status(400).redirect("/anime");
  }
});

app.post("/delete/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }

  const id = req.body.animeId;
  try {
    await db.query("DELETE FROM anime WHERE id = $1", [id]);
    res.redirect("/anime");
  } catch (error) {
    console.error("Error removing item:", error.stack);
    res.status(400).redirect("/anime");
  }
});

passport.use(
  "local",
  new Strategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async function verify(email, password, cb) {
      try {
        console.log("Login attempt with email:", email);
        const result = await db.query(
          "SELECT id,  email, password FROM users WHERE email = $1",
          [email]
        );

        if (result.rows.length === 0) {
          console.log("User not found:", email);
          return cb(null, false, { message: "Wrong email or password" });
        }

        const user = result.rows[0];
        console.log("User found:", user.email);
        const storedHashedPassword = user.password;

        const validPassword = await bcrypt.compare(
          password,
          storedHashedPassword
        );

        console.log("Password valid:", validPassword);

        if (validPassword) {
          console.log("Login successful for:", user.email);
          return cb(null, user);
        } else {
          console.log("Invalid password for:", user.email);
          return cb(null, false, { message: "Wrong email or password" });
        }
      } catch (error) {
        console.log("Strategy error:", error);
        return cb(error);
      }
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const result = await db.query(
      "SELECT id, email, username FROM users WHERE id = $1",
      [id]
    );
    cb(null, result.rows[0]);
  } catch (error) {
    cb(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
