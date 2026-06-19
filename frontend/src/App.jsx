import React, { useState, useEffect, useCallback } from "react";
import api from "./utils/api";
import { playMelody, stopMelody } from "./utils/audio";
import Toolbar from "./components/Toolbar";

const App = () => {
  // 1. Toolbar State
  const [locale, setLocale] = useState("en");
  const [seed, setSeed] = useState("42");
  const [likes, setLikes] = useState(3.7);

  // 2. Pagination State
  const [page, setPage] = useState(1);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 3. Row Expansion & Audio State
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [playingSongIndex, setPlayingSongIndex] = useState(null);
  const [stopAudioFn, setStopAudioFn] = useState(null);

  // Helper: Generate Random Seed
  const generateRandomSeed = useCallback(() => {
    const randomSeedVal = Math.floor(
      Math.random() * Number.MAX_SAFE_INTEGER,
    ).toString();
    setSeed(randomSeedVal);
  }, []);

  // Fetch Songs based on inputs
  const fetchSongs = useCallback(async () => {
    setLoading(true);
    setError("");
    // Stop any playing audio before page changes
    stopActiveAudio();

    try {
      const response = await api.get("/songs", {
        params: {
          seed,
          page,
          locale,
          likes,
        },
      });
      setSongs(response.data.songs);
    } catch (err) {
      console.error("API Error:", err);
      setError("Failed to load songs. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }, [seed, page, locale, likes]);

  // Reset page to 1 on input parameter changes
  useEffect(() => {
    setPage(1);
  }, [seed, locale, likes]);

  // Fetch songs when seed, page, locale, or likes update
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopMelody();
    };
  }, []);

  // Toggle Row Expansion
  const toggleRow = (index) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
      // If expanded row is playing, stop the audio when closed
      if (playingSongIndex === index) {
        stopActiveAudio();
      }
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  // Stop Active Audio Helper
  const stopActiveAudio = () => {
    if (stopAudioFn) {
      stopAudioFn();
      setStopAudioFn(null);
    }
    stopMelody();
    setPlayingSongIndex(null);
  };

  // Play/Stop Song Toggle
  const handlePlayToggle = (song) => {
    if (playingSongIndex === song.index) {
      stopActiveAudio();
    } else {
      const stopFn = playMelody(song.musicTrack, () => {
        // Callback when song finishes automatically
        setPlayingSongIndex(null);
        setStopAudioFn(null);
      });
      setStopAudioFn(() => stopFn);
      setPlayingSongIndex(song.index);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center p-6">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        {/* Header */}
        <header className="text-center mt-4">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent sm:text-5xl">
            Music Store Showcase
          </h1>
          <p className="mt-2 text-slate-400">
            A seed-based, server-side deterministic music viewer.
          </p>
        </header>

        {/* Toolbar Component */}
        <Toolbar
          locale={locale}
          setLocale={setLocale}
          seed={seed}
          setSeed={setSeed}
          likes={likes}
          setLikes={setLikes}
          generateRandomSeed={generateRandomSeed}
        />

        {/* Error Alert */}
        {error && (
          <div className="bg-red-950/40 border border-red-900 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Table View */}
        <main className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="text-center text-slate-400 py-24 animate-pulse">
              Generating and composing songs on server...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                    <th className="p-4 w-[80px]">Index</th>
                    <th className="p-4">Title</th>
                    <th className="p-4">Artist</th>
                    <th className="p-4">Album</th>
                    <th className="p-4">Genre</th>
                    <th className="p-4 text-right">Likes</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map((song) => {
                    const isExpanded = expandedRows.has(song.index);
                    const isPlaying = playingSongIndex === song.index;

                    return (
                      <React.Fragment key={song.index}>
                        {/* Parent Row */}
                        <tr
                          onClick={() => toggleRow(song.index)}
                          className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors cursor-pointer"
                        >
                          <td className="p-4 font-mono text-slate-500">
                            #{song.index}
                          </td>
                          <td className="p-4 font-bold text-slate-200">
                            {song.title}
                          </td>
                          <td className="p-4 text-slate-300">{song.artist}</td>
                          <td className="p-4 text-slate-400">{song.album}</td>
                          <td className="p-4 text-indigo-400 font-medium">
                            {song.genre}
                          </td>
                          <td className="p-4 text-right text-violet-400 font-bold">
                            ❤️ {song.likes}
                          </td>
                          <td className="p-4 text-center">
                            <button className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-slate-300 transition-colors">
                              {isExpanded ? "Collapse" : "Expand"}
                            </button>
                          </td>
                        </tr>

                        {/* Collapsible Expanded Detail Row */}
                        {isExpanded && (
                          <tr className="bg-slate-950/40 border-b border-slate-800">
                            <td colSpan="7" className="p-6">
                              <div className="flex flex-col md:flex-row gap-6 items-center">
                                {/* SVG Dynamic Cover Art */}
                                <div
                                  className="w-[160px] h-[160px] rounded-lg overflow-hidden border border-slate-800 shadow-md flex-shrink-0"
                                  dangerouslySetInnerHTML={{
                                    __html: song.coverSvg,
                                  }}
                                />

                                {/* Extra details */}
                                <div className="flex-1 flex flex-col gap-3 justify-center text-center md:text-left">
                                  <div>
                                    <h4 className="text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                      Album review
                                    </h4>
                                    <p className="text-sm italic text-slate-300 mt-1">
                                      "{song.reviewText}"
                                    </p>
                                  </div>

                                  {/* Play/Pause Button */}
                                  <div className="mt-2">
                                    <button
                                      onClick={() => handlePlayToggle(song)}
                                      className={`px-5 py-2 rounded-lg font-bold text-sm transition-all shadow cursor-pointer flex items-center gap-2 mx-auto md:mx-0 ${
                                        isPlaying
                                          ? "bg-red-600 hover:bg-red-500 text-white"
                                          : "bg-violet-600 hover:bg-violet-500 text-white"
                                      }`}
                                    >
                                      {isPlaying ? (
                                        <>
                                          <span className="w-2.5 h-2.5 bg-white rounded-sm animate-pulse"></span>
                                          Stop Preview
                                        </>
                                      ) : (
                                        <>
                                          <span className="border-y-4 border-y-transparent border-l-6 border-l-white"></span>
                                          Play Preview
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Toolbar */}
          {!loading && (
            <div className="bg-slate-950/60 p-4 border-t border-slate-800 flex items-center justify-between">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Previous
              </button>
              <span className="text-slate-400 text-sm font-semibold">
                Page <strong className="text-slate-200">{page}</strong>
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
