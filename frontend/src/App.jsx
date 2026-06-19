import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "./utils/api";
import { playMelody, stopMelody } from "./utils/audio";
import Toolbar from "./components/Toolbar";

const App = () => {
  // 1. Toolbar State
  const [locale, setLocale] = useState("en");
  const [seed, setSeed] = useState("42");
  const [likes, setLikes] = useState(3.7);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'gallery'

  // 2. Pagination & Infinite Scroll State
  const [page, setPage] = useState(1);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // 3. Audio State
  const [playingSongIndex, setPlayingSongIndex] = useState(null);
  const [stopAudioFn, setStopAudioFn] = useState(null);

  // 4. Infinite Scroll DOM Reference
  const loadMoreRef = useRef(null);

  // Helper: Stop Active Audio
  const stopActiveAudio = useCallback(() => {
    if (stopAudioFn) {
      stopAudioFn();
      setStopAudioFn(null);
    }
    stopMelody();
    setPlayingSongIndex(null);
  }, [stopAudioFn]);

  // Fetch songs with option to append for infinite scroll
  const loadSongs = useCallback(
    async (targetPage, shouldAppend) => {
      if (targetPage === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError("");

      try {
        const response = await api.get("/songs", {
          params: {
            seed,
            page: targetPage,
            locale,
            likes,
          },
        });

        const newSongs = response.data.songs;

        setSongs((prevSongs) => {
          if (shouldAppend) {
            return [...prevSongs, ...newSongs];
          }
          return newSongs;
        });
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to load songs from server.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [seed, locale, likes],
  );

  // Trigger loading page 1 whenever any query parameter changes
  useEffect(() => {
    setPage(1);
    stopActiveAudio();
    loadSongs(1, false);
    // Smooth scroll to top when parameters change
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [seed, locale, likes, viewMode]);

  // Clean up audio on page exit
  useEffect(() => {
    return () => {
      stopMelody();
    };
  }, []);

  // Intersection Observer for Infinite Scrolling (Gallery Mode)
  useEffect(() => {
    if (viewMode !== "gallery" || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            loadSongs(nextPage, true); // Append the next page data
            return nextPage;
          });
        }
      },
      {
        rootMargin: "100px", // Pre-trigger fetch 100px before bottom is reached
        threshold: 0.1,
      },
    );

    const currentTrigger = loadMoreRef.current;
    if (currentTrigger) {
      observer.observe(currentTrigger);
    }

    return () => {
      if (currentTrigger) {
        observer.unobserve(currentTrigger);
      }
    };
  }, [viewMode, loading, loadingMore, loadSongs]);

  // Toggle Row/Card Audio playback
  const handlePlayToggle = (song) => {
    if (playingSongIndex === song.index) {
      stopActiveAudio();
    } else {
      const stopFn = playMelody(song.musicTrack, () => {
        setPlayingSongIndex(null);
        setStopAudioFn(null);
      });
      setStopAudioFn(() => stopFn);
      setPlayingSongIndex(song.index);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadSongs(newPage, false); // Replace for Table Mode pagination
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const generateRandomSeed = useCallback(() => {
    const randomSeedVal = Math.floor(
      Math.random() * Number.MAX_SAFE_INTEGER,
    ).toString();
    setSeed(randomSeedVal);
  }, []);

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

        {/* Toolbar */}
        <Toolbar
          locale={locale}
          setLocale={setLocale}
          seed={seed}
          setSeed={setSeed}
          likes={likes}
          setLikes={setLikes}
          viewMode={viewMode}
          setViewMode={setViewMode}
          generateRandomSeed={generateRandomSeed}
        />

        {/* Error Alert */}
        {error && (
          <div className="bg-red-950/40 border border-red-900 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Content Renderers */}
        <main className="w-full">
          {loading ? (
            <div className="text-center text-slate-400 py-24 animate-pulse">
              Generating and composing songs on server...
            </div>
          ) : (
            <>
              {/* VIEW 1: TABLE VIEW */}
              {viewMode === "table" && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
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
                        </tr>
                      </thead>
                      <tbody>
                        {songs.map((song) => (
                          <tr
                            key={song.index}
                            className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="p-4 font-mono text-slate-500">
                              #{song.index}
                            </td>
                            <td className="p-4 font-bold text-slate-200">
                              {song.title}
                            </td>
                            <td className="p-4 text-slate-300">
                              {song.artist}
                            </td>
                            <td className="p-4 text-slate-400">{song.album}</td>
                            <td className="p-4 text-indigo-400 font-medium">
                              {song.genre}
                            </td>
                            <td className="p-4 text-right text-violet-400 font-bold">
                              ❤️ {song.likes}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Pagination Controls */}
                  <div className="bg-slate-950/60 p-4 border-t border-slate-800 flex items-center justify-between">
                    <button
                      disabled={page <= 1}
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Previous
                    </button>
                    <span className="text-slate-400 text-sm font-semibold">
                      Page <strong className="text-slate-200">{page}</strong>
                    </span>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 2: GALLERY VIEW (GRID + INFINITE SCROLL) */}
              {viewMode === "gallery" && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {songs.map((song) => {
                      const isPlaying = playingSongIndex === song.index;
                      return (
                        <div
                          key={song.index}
                          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col group"
                        >
                          {/* SVG Album Cover Art */}
                          <div
                            className="aspect-square w-full border-b border-slate-800/80 bg-slate-950 flex-shrink-0 relative overflow-hidden"
                            dangerouslySetInnerHTML={{ __html: song.coverSvg }}
                          />

                          {/* Detail / Text Info */}
                          <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold bg-slate-950 px-2.5 py-1 rounded-md text-slate-400 border border-slate-800">
                                  #{song.index}
                                </span>
                                <span className="text-xs font-bold text-violet-400">
                                  ❤️ {song.likes} Likes
                                </span>
                              </div>
                              <h3 className="text-lg font-extrabold text-slate-100 truncate mt-1 group-hover:text-violet-400 transition-colors">
                                {song.title}
                              </h3>
                              <p className="text-sm text-slate-400">
                                By{" "}
                                <strong className="text-slate-300">
                                  {song.artist}
                                </strong>
                              </p>
                              <div className="flex gap-2 mt-1">
                                <span className="text-[11px] font-semibold bg-indigo-950/50 text-indigo-400 border border-indigo-900/50 px-2 py-0.5 rounded-full">
                                  {song.genre}
                                </span>
                                <span className="text-[11px] font-semibold bg-slate-950 text-slate-500 border border-slate-800 px-2 py-0.5 rounded-full">
                                  {song.album}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 italic mt-2 border-t border-slate-800/60 pt-2 leading-relaxed">
                                "{song.reviewText}"
                              </p>
                            </div>

                            {/* Audio synth toggle */}
                            <button
                              onClick={() => handlePlayToggle(song)}
                              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all tracking-wider uppercase cursor-pointer flex items-center justify-center gap-2 ${
                                isPlaying
                                  ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20"
                                  : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/20"
                              }`}
                            >
                              {isPlaying ? (
                                <>
                                  <span className="w-2 h-2 bg-white rounded-sm animate-ping"></span>
                                  Stop Preview
                                </>
                              ) : (
                                <>
                                  <span className="border-y-3.5 border-y-transparent border-l-5 border-l-white"></span>
                                  Play Preview
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Infinite Scroll Intersection Trigger Element */}
                  <div
                    ref={loadMoreRef}
                    className="w-full py-12 flex justify-center items-center text-slate-500 text-sm font-medium"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2 text-violet-400 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"></span>
                        Loading more songs...
                      </span>
                    ) : (
                      <span>Scroll down to generate more songs</span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
