import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import JSZip from "jszip";
import { generateSongsPage } from "./utils/generator.js";
import { synthesizeToMp3 } from "./utils/audioEncoder.js"; // Import encoder

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// API Endpoint to fetch songs page
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

// NEW API: Dynamic ZIP & MP3 Exporter
app.get("/api/songs/export", async (req, res) => {
  try {
    const seed = req.query.seed || "0";
    const page = parseInt(req.query.page) || 1;
    const locale = req.query.locale === "de" ? "de" : "en";
    const likes = parseFloat(req.query.likes) || 0;
    const limit = parseInt(req.query.limit) || 20;

    if (page < 1 || likes < 0 || likes > 10) {
      return res.status(400).json({ error: "Invalid parameters." });
    }

    // 1. Generate song data (using same seed/page yields identical tracks!)
    const songs = generateSongsPage(seed, page, locale, likes, limit);

    // 2. Initialize JSZip
    const zip = new JSZip();

    // 3. Synthesize and add each song to ZIP in-memory
    songs.forEach((song) => {
      const mp3Buffer = synthesizeToMp3(song.musicTrack);

      // Clean filename characters to avoid ZIP errors
      const safeTitle = song.title.replace(/[/\\?%*:|"<>. ]/g, "_");
      const safeArtist = song.artist.replace(/[/\\?%*:|"<>. ]/g, "_");
      const safeAlbum = song.album.replace(/[/\\?%*:|"<>. ]/g, "_");

      const filename = `${song.index}-${safeTitle}-by-${safeArtist}-${safeAlbum}.mp3`;

      zip.file(filename, mp3Buffer, { binary: true });
    });

    // 4. Generate ZIP file buffer
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    // 5. Send ZIP file attachment headers
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="music_showcase_seed_${seed}_page_${page}.zip"`,
    );

    res.send(zipBuffer);
  } catch (error) {
    console.error("Error exporting songs ZIP:", error);
    res.status(500).json({ error: "Server error generating ZIP export." });
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "Music Store Showcase API is running smoothly!",
    status: "healthy",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
