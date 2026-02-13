import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Mood = ({ isMinimalist }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const audioRefs = useRef(new Map());           // song.id = <audio> element
  const currentPlayingRef = useRef(null);         // currently playing song id

  const moods = [
    { name: 'Happy', emoji: '😊', color: 'from-yellow-400 via-orange-500 to-pink-500' },
    { name: 'Sad', emoji: '😢', color: 'from-blue-900 via-indigo-800 to-purple-900' },
    { name: 'Angry', emoji: '😠', color: 'from-red-900 via-red-700 to-orange-900' },
    { name: 'Neutral', emoji: '😐', color: 'from-gray-800 via-gray-700 to-gray-900' },
    { name: 'Tensed', emoji: '😰', color: 'from-green-900 via-teal-800 to-blue-900' },
    { name: 'Excited', emoji: '🤩', color: 'from-purple-500 via-fuchsia-500 to-pink-500' },
    { name: 'Relaxed', emoji: '😌', color: 'from-cyan-600 via-blue-500 to-indigo-600' },
    { name: 'Romantic', emoji: '❤️', color: 'from-pink-600 via-rose-500 to-red-600' },
  ];

  const moodToQueryMap = {
    
    Happy : 'Diljit party ',
    Sad : 'arijit sad songs  ',
    Angry : 'angry songs',
    Neutral: ' lo-fi  ',
    Tensed: 'anxious',
    Excited:   "Diljit dance",
    Relaxed: ' lo-fi  calm ',
    Romantic:  "Arijit Singh love",
  };

  useEffect(() => {
    if (selectedMood) {
      document.body.className = `bg-gradient-to-br ${selectedMood.color} transition-all duration-1000`;
      gsap.to(document.body, { scale: 1.02, duration: 0.5, yoyo: true, repeat: 1 });

      // Reset page
      setPage(1);
      setTracks([]);
      setHasMore(true);
      fetchMusicForMood(selectedMood.name, 1);
    } else {
      // Default background of mood
      document.body.className = isMinimalist
        ? 'bg-gradient-to-br from-[#fff5f7] via-[#ffebee] to-[#fce4ec]'
        : 'bg-gradient-to-br from-[#0f0c29] via-[#1a173f] to-[#2c1c5c]';
      setTracks([]);
      setError(null);
      setHasMore(false);

      // Pause song
      if (currentPlayingRef.current) {
        const audio = audioRefs.current.get(currentPlayingRef.current);
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
        currentPlayingRef.current = null;
      }
    }

    // unmount useRef cleanup
    return () => {
      audioRefs.current.clear();
      currentPlayingRef.current = null;
    };
  }, [selectedMood, isMinimalist]);

  const fetchMusicForMood = async (moodName, pageNum) => {
    setLoading(true);
    setError(null);
    const query = moodToQueryMap[moodName] || `${moodName.toLowerCase()} hindi bollywood`;

    try {
      //change krna pdskta h
      const response = await fetch(
        `https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}&limit=12&page=${pageNum}`
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const newSongs = data?.data?.results || [];

      if (newSongs.length === 0) {
        setHasMore(false);
      }

      if (pageNum === 1) {
        setTracks(newSongs);
      } else {
        setTracks((prev) => [...prev, ...newSongs]);
      }

      setHasMore(newSongs.length >= 12);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Couldn't load songs");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMusicForMood(selectedMood.name, nextPage);
  };

  const handlePlay = (songId) => {
    // Pause previous song
    if (currentPlayingRef.current && currentPlayingRef.current !== songId) {
      const prevAudio = audioRefs.current.get(currentPlayingRef.current);
      if (prevAudio) {
        prevAudio.pause();
        prevAudio.currentTime = 0; 
      }
    }
    currentPlayingRef.current = songId;
  };

  const resetMood = () => {
    setSelectedMood(null);
    setPage(1);
  };

  return (
    <section className="py-16 md:py-20 px-5 md:px-[5%] relative z-[2]">
      <h2
        className={`text-4xl md:text-6xl font-black mb-10 md:mb-14 text-center transition-colors ${
          isMinimalist ? 'text-[#ad1457]' : 'text-white'
        }`}
      >
        Pick Your Vibe
      </h2>

      {/* Mood selection cards css */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 max-w-[1400px] mx-auto mb-16">
        {moods.map((mood) => (
          <div
            key={mood.name}
            onClick={() => setSelectedMood(mood)}
            className={`p-6 md:p-10 rounded-3xl text-center cursor-pointer transition-all duration-400 hover:scale-105 active:scale-98 ${
              selectedMood?.name === mood.name
                ? 'ring-4 ring-white/50 shadow-2xl scale-105'
                : ''
            } ${
              isMinimalist
                ? 'bg-white/70 backdrop-blur-md border border-white/80 hover:bg-white/90'
                : 'bg-white/8 backdrop-blur-xl border border-white/10 hover:border-purple-400/50'
            }`}
          >
            <div className="text-5xl md:text-7xl mb-4 md:mb-6">{mood.emoji}</div>
            <h4 className={`text-xl md:text-2xl font-black ${
              isMinimalist ? 'text-[#ad1457]' : 'text-white'
            }`}>
              {mood.name}
            </h4>
          </div>
        ))}
      </div>

      {selectedMood && (
        <div className="max-w-6xl mx-auto">
          <div className="p-8 md:p-12 rounded-3xl bg-black/20 backdrop-blur-xl border border-white/15 text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">
              {selectedMood.name} • Bollywood Vibes
            </h3>

            {loading && page === 1 && (
              <p className="text-lg md:text-xl py-10">Loading songs...</p>
            )}

            {error && <p className="text-red-400 text-lg py-6">{error}</p>}

            


            {tracks.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {tracks.map((song) => {
                    const audioSrc = song.downloadUrl?.[4]?.url || song.url || null;

                    return (
                      <div
                        key={song.id}
                        className="p-5 md:p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-white/30 transition-all group"
                      >
                        {/* Artwork */}
                        {song.image?.[2]?.url ? (
                          <img
                            src={song.image[2].url}
                            alt={song.name}
                            className="w-full aspect-square object-cover rounded-xl mb-4 shadow-lg group-hover:shadow-2xl transition-shadow"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full aspect-square bg-gradient-to-br from-gray-800 to-gray-950 rounded-xl mb-4 flex items-center justify-center text-4xl opacity-40">
                            🎵
                          </div>
                        )}

                        <h5 className="font-semibold text-base md:text-lg mb-1 line-clamp-1">
                          {song.name}
                        </h5>
                        <p className="text-xs md:text-sm opacity-70 mb-3 line-clamp-1">
                          {song.artists?.primary_artists?.map(a => a.name).join(", ") || "—"}
                        </p>

                        {audioSrc ? (
                          <audio
                            ref={(el) => {
                              if (el) {
                                audioRefs.current.set(song.id, el);
                              } else {
                                audioRefs.current.delete(song.id);
                              }
                            }}
                            controls
                            src={audioSrc}
                            className="w-full h-10 mt-1"
                            onPlay={() => handlePlay(song.id)}
                          />
                        ) : (
                          <p className="text-xs opacity-60 italic mt-2">
                            No preview available
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {hasMore && (
                  <div className="text-center mt-12 md:mt-16">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="px-10 py-4 bg-purple-600/80 hover:bg-purple-600 rounded-full text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Loading...' : 'Load More Songs'}
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="mt-12 flex flex-wrap justify-center gap-4 md:gap-6">
              
              <button
                onClick={resetMood}
                className="px-7 py-3 bg-gray-700 hover:bg-gray-600 rounded-full text-white"
              >
                Back to Moods
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Mood;