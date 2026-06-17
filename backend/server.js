import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateSongsPage } from "./utils/generator.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Music Store Showcase API is running smoothly!",
    status: "healthy",
  });
});

app.get("/api/songs", (req, res) => {
  try {
    const seed = req.query.seed || "0";
    const page = parseInt(req.query.page) || 1;
    const locale = req.query.locale === "de" ? "de" : "en";
    const likes = parseFloat(req.query.likes) || 0;
    const limit = parseInt(req.query.limit) || 20;

    if (page < 1) {
      return res
        .status(400)
        .json({ error: "Page number must be 1 or greater." });
    }

    if (likes < 0 || likes > 10) {
      return res
        .status(400)
        .json({ error: "Likes average must be between 0 and 10." });
    }

    const songs = generateSongsPage(seed, page, locale, likes, limit);

    res.json({
      seed,
      page,
      locale,
      likes,
      songs,
    });
  } catch (error) {
    console.error("Error generating songs:", error);
    res.status(500).json({ error: "Server error generating songs data." });
  }
});

app.listen(PORT, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});
