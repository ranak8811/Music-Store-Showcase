const GalleryView = ({
  songs,
  playingSongIndex,
  isPlaying,
  togglePlay,
  audioProgress,
  lyricsContainerRefs,
  getActiveLyricsIndex,
  loadMoreRef,
  loadingMore,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs.map((song) => {
          const isActive = playingSongIndex === song.index;
          const isSongPlaying = isActive && isPlaying;
          const activeLyricIdx = isActive
            ? getActiveLyricsIndex(song, audioProgress)
            : -1;

          return (
            <div
              key={song.index}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col group"
            >
              <div
                className="aspect-square w-full border-b border-slate-800/80 bg-slate-950 flex-shrink-0 relative overflow-hidden"
                dangerouslySetInnerHTML={{ __html: song.coverSvg }}
              />

              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2.5">
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
                    By <strong className="text-slate-300">{song.artist}</strong>
                  </p>

                  <div className="mt-1 flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Live Lyrics
                    </span>
                    <div
                      ref={(el) =>
                        (lyricsContainerRefs.current[song.index] = el)
                      }
                      className="h-[70px] overflow-y-hidden bg-slate-950 border border-slate-800/60 rounded-lg p-2 text-[11px] flex flex-col gap-1.5 text-center justify-center items-center"
                    >
                      {song.lyrics.map((line, idx) => (
                        <div
                          key={idx}
                          className={`transition-all duration-300 font-medium ${
                            activeLyricIdx === idx
                              ? "text-violet-400 font-bold text-xs scale-102 transform"
                              : "text-slate-600 hidden"
                          }`}
                        >
                          {line.text}
                        </div>
                      ))}
                      {activeLyricIdx === -1 && (
                        <span className="text-slate-600">[Outro/Intro]</span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic border-t border-slate-800/60 pt-2 leading-relaxed">
                    "{song.reviewText}"
                  </p>
                </div>

                <button
                  onClick={() => togglePlay(song)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all tracking-wider uppercase cursor-pointer flex items-center justify-center gap-2 ${
                    isSongPlaying
                      ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20"
                      : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/20"
                  }`}
                >
                  {isSongPlaying
                    ? "Pause"
                    : isActive && audioProgress > 0
                      ? "Resume"
                      : "Play Track"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div
        ref={loadMoreRef}
        className="w-full py-12 flex justify-center items-center text-slate-500 text-sm font-medium"
      >
        {loadingMore ? (
          <span className="flex items-center gap-2 text-violet-400 animate-pulse">
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></span>
            Loading more songs...
          </span>
        ) : (
          <span>Scroll down to generate more songs</span>
        )}
      </div>
    </div>
  );
};

export default GalleryView;
