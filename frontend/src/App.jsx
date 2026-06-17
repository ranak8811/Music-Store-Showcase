import { useState, useEffect, useCallback } from "react";
import Toolbar from "./components/Toolbar";
import api from "./api";

const App = () => {
  const [locale, setLocale] = useState("en");
  const [seed, setSeed] = useState("42");
  const [likes, setLikes] = useState(3.7);

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateRandomSeed = useCallback(() => {
    const randomSeedVal = Math.floor(
      Math.random() * Number.MAX_SAFE_INTEGER,
    ).toString();
    setSeed(randomSeedVal);
  }, []);

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/songs", {
        params: {
          seed,
          page: 1,
          locale,
          likes,
        },
      });

      setSongs(response.data.songs);
    } catch (error) {
      console.error("API Error:", error);
      setError(
        "Failed to load songs from server. Make sure backend is running.",
      );
    } finally {
      setLoading(false);
    }
  }, [seed, locale, likes]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center p-6">
      <div className="w-full max-w-5xl flex flex-col gap-8">
        {/* Header */}
        <header className="text-center mt-6">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent sm:text-5xl">
            Music Store Showcase
          </h1>
          <p className="mt-2 text-slate-400">
            Generate and preview music lists deterministically.
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

        {/* Error State */}
        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Display Generated Song Data */}
        <main className="w-full">
          {loading ? (
            <div className="text-center text-slate-400 py-12 animate-pulse text-lg">
              Generating songs on server...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {songs?.map((song) => (
                <div
                  key={song.index}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      #{song.index}
                    </span>
                    <span className="text-xs font-semibold text-violet-400 flex items-center gap-1">
                      ❤️ {song.likes} Likes
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 truncate mt-1">
                    {song.title}
                  </h3>
                  <div className="text-sm text-slate-400 flex justify-between">
                    <span>
                      Artist:{" "}
                      <strong className="text-slate-300">{song.artist}</strong>
                    </span>
                    <span>
                      Genre:{" "}
                      <strong className="text-indigo-400">{song.genre}</strong>
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Album: {song.album}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
