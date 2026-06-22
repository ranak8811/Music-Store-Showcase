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
  exporting,
  handleExport,
  generateRandomSeed,
}) => {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-6 items-center justify-between shadow-lg">
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

      <div className="flex flex-col gap-1.5 min-w-[240px] flex-1">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Likes per Song</span>
          {likesError ? (
            <span className="text-red-400 font-bold lowercase text-xs">
              ⚠️ {likesError}
            </span>
          ) : (
            <span className="text-violet-400 font-bold normal-case text-sm">
              {likes}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
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
              setLikesError("");
            }}
            className="flex-1 accent-violet-600 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <input
            type="text"
            value={likesInput}
            onChange={(e) => {
              const valString = e.target.value;
              setLikesInput(valString);

              if (valString.trim() === "") {
                setLikesError("Cannot be blank");
                return;
              }

              const num = parseFloat(valString);
              if (isNaN(num)) {
                setLikesError("Must be a number");
              } else if (num < 0 || num > 10) {
                setLikesError("Must be 0 to 10");
              } else {
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

      <div className="flex flex-col gap-1.5 justify-end">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Export
        </label>
        <button
          onClick={handleExport}
          disabled={exporting || !!likesError}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-slate-100 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
        >
          {exporting ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Zipping...
            </>
          ) : (
            <>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              Export ZIP
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
