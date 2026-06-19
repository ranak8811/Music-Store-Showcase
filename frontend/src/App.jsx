import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "./utils/api";
import {
  playMelody,
  pauseMelody,
  stopMelody,
  setVolume,
  changeSynthType,
} from "./utils/audio";
import Toolbar from "./components/Toolbar";
import TableView from "./components/TableView";
import GalleryView from "./components/GalleryView";
import PlayerBar from "./components/PlayerBar";

const App = () => {
  // 1. Toolbar State
  const [locale, setLocale] = useState("en");
  const [seed, setSeed] = useState("42");
  const [likes, setLikes] = useState(3.7);
  const [likesInput, setLikesInput] = useState("3.7");
  const [likesError, setLikesError] = useState("");
  const [viewMode, setViewMode] = useState("table");

  // 2. Pagination State
  const [page, setPage] = useState(1);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // 3. Export Loading State
  const [exporting, setExporting] = useState(false);

  // 4. Audio Player Master States
  const [activeSong, setActiveSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.5);
  const [synth, setSynthState] = useState("sine");

  // 5. Set row expansion
  const [expandedRows, setExpandedRows] = useState(new Set());

  // 6. DOM References
  const loadMoreRef = useRef(null);
  const lyricsContainerRefs = useRef({});

  // Helper: Stop Active Audio
  const stopActiveAudio = useCallback(() => {
    stopMelody();
    setIsPlaying(false);
    setActiveSong(null);
    setAudioProgress(0);
    setAudioDuration(0);
  }, []);

  // Global Pointer Event Listeners for Synth Playback
  useEffect(() => {
    window.__audioProgressCb = (elapsed, duration) => {
      setAudioProgress(elapsed);
      setAudioDuration(duration);
    };
    window.__audioFinishedCb = () => {
      setIsPlaying(false);
      setActiveSong(null);
      setAudioProgress(0);
    };
    return () => {
      window.__audioProgressCb = null;
      window.__audioFinishedCb = null;
    };
  }, []);

  // Fetch API Controller
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
          params: { seed, page: targetPage, locale, likes },
        });
        const newSongs = response.data.songs;
        setSongs((prev) => (shouldAppend ? [...prev, ...newSongs] : newSongs));
      } catch (err) {
        console.error(err);
        setError(
          "Failed to load songs from server. Make sure backend is running.",
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [seed, locale, likes],
  );

  // Sync inputs and trigger API calls
  useEffect(() => {
    if (likesError) return;

    setPage(1);
    stopActiveAudio();
    setExpandedRows(new Set());
    loadSongs(1, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [seed, locale, likes, viewMode, likesError]);

  // Clean up audio on page exit
  useEffect(() => {
    return () => {
      stopMelody();
    };
  }, []);

  // Trigger ZIP Export and Dynamic Download Link
  const handleExport = async () => {
    if (likesError) return;
    setExporting(true);
    setError("");

    try {
      // 1. Trigger API with responseType set to blob
      const response = await api.get("/songs/export", {
        params: { seed, page, locale, likes },
        responseType: "blob", // Critical to handle binary data
      });

      // 2. Create local browser blob URL representation
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));

      // 3. Create dummy DOM link and trigger virtual click
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute(
        "download",
        `music_showcase_seed_${seed}_page_${page}.zip`,
      );
      document.body.appendChild(link);

      link.click(); // Trigger browser download dialog

      // 4. Cleanup dummy DOM and revoke resource memory
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Export failed:", err);
      setError("Failed to download ZIP archive. Try again.");
    } finally {
      setExporting(false);
    }
  };

  // Find active lyric index by playback beat
  const getActiveLyricsIndex = (song, progressSec) => {
    if (!song || !song.musicTrack) return -1;
    const beatDuration = 60 / song.musicTrack.tempo;
    const currentBeat = progressSec / beatDuration;

    let activeIndex = -1;
    for (let i = 0; i < song.lyrics.length; i++) {
      if (currentBeat >= song.lyrics[i].time) {
        activeIndex = i;
      }
    }
    return activeIndex;
  };

  // Auto Scroll Lyrics
  useEffect(() => {
    if (!activeSong) return;
    const activeIdx = getActiveLyricsIndex(activeSong, audioProgress);
    if (activeIdx === -1) return;

    const container = lyricsContainerRefs.current[activeSong.index];
    if (container) {
      const activeLineEl = container.children[activeIdx];
      if (activeLineEl) {
        container.scrollTo({
          top:
            activeLineEl.offsetTop -
            container.clientHeight / 2 +
            activeLineEl.clientHeight / 2,
          behavior: "smooth",
        });
      }
    }
  }, [audioProgress, activeSong]);

  // Play/Pause toggle
  const togglePlay = (song) => {
    if (activeSong && activeSong.index === song.index) {
      if (isPlaying) {
        pauseMelody();
        setIsPlaying(false);
      } else {
        playMelody(
          song.musicTrack,
          audioProgress,
          window.__audioProgressCb,
          window.__audioFinishedCb,
        );
        setVolume(volume);
        setIsPlaying(true);
      }
    } else {
      stopActiveAudio();
      setActiveSong(song);
      setSynthState(song.musicTrack.synthType || "sine");
      playMelody(
        song.musicTrack,
        0,
        window.__audioProgressCb,
        window.__audioFinishedCb,
      );
      setVolume(volume);
      setIsPlaying(true);
    }
  };

  // Progress Seek (Jump offset)
  const handleSeek = (e) => {
    if (!activeSong) return;
    const newOffset = parseFloat(e.target.value);
    setAudioProgress(newOffset);
    playMelody(
      activeSong.musicTrack,
      newOffset,
      window.__audioProgressCb,
      window.__audioFinishedCb,
    );
    setVolume(volume);
    setIsPlaying(true);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolumeState(val);
    setVolume(val);
  };

  const handleSynthChange = (e) => {
    const val = e.target.value;
    setSynthState(val);
    changeSynthType(val);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadSongs(newPage, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleRow = (index) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  const generateRandomSeed = useCallback(() => {
    const randomSeedVal = Math.floor(
      Math.random() * Number.MAX_SAFE_INTEGER,
    ).toString();
    setSeed(randomSeedVal);
  }, []);

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Infinite Scroll Trigger
  useEffect(() => {
    if (viewMode !== "gallery" || loading || loadingMore || likesError) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            loadSongs(nextPage, true);
            return nextPage;
          });
        }
      },
      {
        rootMargin: "120px",
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
  }, [viewMode, loading, loadingMore, loadSongs, likesError]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center p-6 pb-36">
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
          likesInput={likesInput}
          setLikesInput={setLikesInput}
          likesError={likesError}
          setLikesError={setLikesError}
          viewMode={viewMode}
          setViewMode={setViewMode}
          exporting={exporting}
          handleExport={handleExport}
          generateRandomSeed={generateRandomSeed}
        />

        {/* Error Alert */}
        {error && (
          <div className="bg-red-950/40 border border-red-900 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Subcomponents Rendering */}
        <main className="w-full">
          {loading ? (
            <div className="text-center text-slate-400 py-24 animate-pulse">
              Generating and composing songs on server...
            </div>
          ) : (
            <>
              {viewMode === "table" ? (
                <TableView
                  songs={songs}
                  page={page}
                  handlePageChange={handlePageChange}
                  expandedRows={expandedRows}
                  toggleRow={toggleRow}
                  playingSongIndex={activeSong?.index}
                  isPlaying={isPlaying}
                  togglePlay={togglePlay}
                  audioProgress={audioProgress}
                  lyricsContainerRefs={lyricsContainerRefs}
                  getActiveLyricsIndex={getActiveLyricsIndex}
                />
              ) : (
                <GalleryView
                  songs={songs}
                  playingSongIndex={activeSong?.index}
                  isPlaying={isPlaying}
                  togglePlay={togglePlay}
                  audioProgress={audioProgress}
                  lyricsContainerRefs={lyricsContainerRefs}
                  getActiveLyricsIndex={getActiveLyricsIndex}
                  loadMoreRef={loadMoreRef}
                  loadingMore={loadingMore}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating Global Audio Player Bar */}
      <PlayerBar
        activeSong={activeSong}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        stopActiveAudio={stopActiveAudio}
        audioProgress={audioProgress}
        audioDuration={audioDuration}
        handleSeek={handleSeek}
        volume={volume}
        handleVolumeChange={handleVolumeChange}
        synth={synth}
        handleSynthChange={handleSynthChange}
        formatTime={formatTime}
      />
    </div>
  );
};

export default App;
