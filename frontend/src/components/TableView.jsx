import React from 'react';

const TableView = ({
  songs,
  page,
  handlePageChange,
  expandedRows,
  toggleRow,
  playingSongIndex,
  isPlaying,
  togglePlay,
  audioProgress,
  lyricsContainerRefs,
  getActiveLyricsIndex
}) => {
  return (
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
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => {
              const isExpanded = expandedRows.has(song.index);
              const isActive = playingSongIndex === song.index;
              const isSongPlaying = isActive && isPlaying;
              const activeLyricIdx = isActive ? getActiveLyricsIndex(song, audioProgress) : -1;

              return (
                <React.Fragment key={song.index}>

                  <tr
                    onClick={() => toggleRow(song.index)}
                    className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-mono text-slate-500">#{song.index}</td>
                    <td className="p-4 font-bold text-slate-200">
                      <div className="flex items-center gap-2">
                        {isSongPlaying && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>}
                        {song.title}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{song.artist}</td>
                    <td className="p-4 text-slate-400">{song.album}</td>
                    <td className="p-4 text-indigo-400 font-medium">{song.genre}</td>
                    <td className="p-4 text-right text-violet-400 font-bold">❤️ {song.likes}</td>
                    <td className="p-4 text-center">
                      <button className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-slate-300 transition-colors">
                        {isExpanded ? 'Collapse' : 'Expand'}
                      </button>
                    </td>
                  </tr>


                  {isExpanded && (
                    <tr className="bg-slate-950/40 border-b border-slate-800">
                      <td colSpan="7" className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-center">

                          <div
                            className="w-[140px] h-[140px] rounded-lg overflow-hidden border border-slate-800 shadow-md flex-shrink-0"
                            dangerouslySetInnerHTML={{ __html: song.coverSvg }}
                          />

                          <div className="flex-1 flex flex-col md:flex-row gap-6 w-full">

                            <div className="flex-1 flex flex-col gap-2.5">
                              <h4 className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Review</h4>
                              <p className="text-sm italic text-slate-300">"{song.reviewText}"</p>
                              <div className="mt-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); togglePlay(song); }}
                                  className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all uppercase cursor-pointer ${isSongPlaying
                                      ? 'bg-red-600 hover:bg-red-500 text-white'
                                      : isActive && audioProgress > 0
                                        ? 'bg-violet-600 hover:bg-violet-500 text-white'
                                        : 'bg-violet-600 hover:bg-violet-500 text-white'
                                    }`}
                                >
                                  {isSongPlaying ? 'Pause' : isActive && audioProgress > 0 ? 'Resume' : 'Play Track'}
                                </button>
                              </div>
                            </div>


                            <div className="w-full md:w-[280px] flex flex-col gap-1.5">
                              <h4 className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Synced Lyrics</h4>
                              <div
                                ref={(el) => lyricsContainerRefs.current[song.index] = el}
                                className="h-[100px] overflow-y-auto bg-slate-950 border border-slate-800/80 rounded-lg p-3 text-xs flex flex-col gap-2 scroll-smooth"
                              >
                                {song.lyrics.map((line, idx) => (
                                  <div
                                    key={idx}
                                    className={`transition-all duration-300 font-medium ${activeLyricIdx === idx
                                        ? 'text-violet-400 font-bold text-sm scale-102 transform origin-left'
                                        : 'text-slate-500'
                                      }`}
                                  >
                                    {line.text}
                                  </div>
                                ))}
                              </div>
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
  );
};

export default TableView;
