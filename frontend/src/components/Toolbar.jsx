import React from "react";

const Toolbar = ({
  locale,
  setLocale,
  seed,
  setSeed,
  likes,
  setLikes,
  likesInput,
  setLikesInput,
  likesError,
  setLikesError,
  viewMode,
  setViewMode,
  generateRandomSeed,
}) => {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-6 items-center justify-between shadow-lg">
      {/* Display Mode Selection */}
      <div className="flex flex-col gap-1.5 min-w-[150px]">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Display Mode
        </label>
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode("table")}
            className={`flex-1 text-xs font-semibold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-violet-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode("gallery")}
            className={`flex-1 text-xs font-semibold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === "gallery"
                ? "bg-violet-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Gallery
          </button>
        </div>
      </div>

      {/* Language Selection */}
      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Language
        </label>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          className="bg-slate-950 text-slate-100 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 transition-colors"
        >
          <option value="en">English (US)</option>
          <option value="de">German (Germany)</option>
        </select>
      </div>

      {/* Seed Configuration */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-[240px]">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Seed Value
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Enter seed"
            className="flex-1 bg-slate-950 text-slate-100 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 transition-colors"
          />
          <button
            onClick={generateRandomSeed}
            className="bg-violet-600 hover:bg-violet-500 text-slate-100 font-medium text-sm px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Random
          </button>
        </div>
      </div>

      {/* Likes Per Song - Advanced Validation Controls */}
      <div className="flex flex-col gap-1.5 min-w-[240px] flex-1">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Likes per Song</span>
          {likesError ? (
            <span className="text-red-400 font-bold lowercase text-xs animate-pulse">
              ⚠️ {likesError}
            </span>
          ) : (
            <span className="text-violet-400 font-bold normal-case text-sm">
              {likes}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Slider: bounded by safe values */}
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={likesError ? 0 : likes}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setLikes(val);
              setLikesInput(e.target.value);
              setLikesError(""); // Clear errors when slider changes
            }}
            className="flex-1 accent-violet-600 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />

          {/* Precision Input Box: handles custom typing */}
          <input
            type="text"
            value={likesInput}
            onChange={(e) => {
              const valString = e.target.value;
              setLikesInput(valString);

              // 1. Check if blank
              if (valString.trim() === "") {
                setLikesError("Cannot be blank");
                return;
              }

              // 2. Parse and validate number
              const num = parseFloat(valString);
              if (isNaN(num)) {
                setLikesError("Must be a number");
              } else if (num < 0 || num > 10) {
                setLikesError("Must be 0 to 10");
              } else {
                // Clear errors and propagate state
                setLikesError("");
                setLikes(num);
              }
            }}
            className={`w-14 bg-slate-950 text-slate-100 border rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none transition-colors ${
              likesError
                ? "border-red-500 focus:border-red-500"
                : "border-slate-750 focus:border-violet-500"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
