const PlayerBar = ({
  activeSong,
  isPlaying,
  togglePlay,
  stopActiveAudio,
  audioProgress,
  audioDuration,
  handleSeek,
  volume,
  handleVolumeChange,
  synth,
  handleSynthChange,
  formatTime,
}) => {
  if (!activeSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl z-50 animate-slide-up">
      <div className="flex items-center gap-3 min-w-[200px] w-full md:w-auto">
        <div
          className="w-10 h-10 rounded overflow-hidden border border-slate-800 flex-shrink-0"
          dangerouslySetInnerHTML={{ __html: activeSong.coverSvg }}
        />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-slate-100 truncate">
            {activeSong.title}
          </span>
          <span className="text-xs text-slate-400 truncate">
            {activeSong.artist}
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-4 w-full max-w-xl">
        <button
          onClick={() => togglePlay(activeSong)}
          className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-full transition-colors cursor-pointer flex-shrink-0 flex items-center justify-center w-9 h-9"
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={stopActiveAudio}
          className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-2 rounded-full transition-colors cursor-pointer flex-shrink-0 flex items-center justify-center w-9 h-9"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
        </button>

        <span className="text-xs font-mono text-slate-400">
          {formatTime(audioProgress)}
        </span>
        <input
          type="range"
          min="0"
          max={audioDuration || 10}
          step="0.05"
          value={audioProgress}
          onChange={handleSeek}
          className="flex-1 accent-violet-600 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-xs font-mono text-slate-400">
          {formatTime(audioDuration)}
        </span>
      </div>

      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Synth:</span>
          <select
            value={synth}
            onChange={handleSynthChange}
            className="bg-slate-950 text-slate-100 border border-slate-800 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-violet-500"
          >
            <option value="sine">Sine (Soft)</option>
            <option value="triangle">Triangle (Retro)</option>
            <option value="sawtooth">Saw (Lead)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 min-w-[120px]">
          <svg
            className="w-4 h-4 text-slate-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 accent-violet-600 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;
