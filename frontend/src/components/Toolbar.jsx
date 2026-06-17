const Toolbar = ({
  locale,
  setLocale,
  seed,
  setSeed,
  likes,
  setLikes,
  generateRandomSeed,
}) => {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-6 items-center justify-between shadow-lg">
      {/* Language / Region Selection */}
      <div className="flex flex-col gap-1.5 min-w-[150px]">
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
      <div className="flex flex-col gap-1.5 flex-1 min-w-[250px]">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Seed Value
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Enter seed value"
            className="flex-1 bg-slate-950 text-slate-100 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 transition-colors"
          />
          <button
            onClick={generateRandomSeed}
            className="bg-violet-600 hover:bg-violet-500 text-slate-100 font-medium text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Random
          </button>
        </div>
      </div>

      {/* Likes Per Song Control */}
      <div className="flex flex-col gap-1.5 min-w-[200px] flex-1">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Likes per Song</span>
          <span className="text-violet-400 font-bold normal-case text-sm">
            {likes}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={likes}
            onChange={(e) => setLikes(parseFloat(e.target.value))}
            className="flex-1 accent-violet-600 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
