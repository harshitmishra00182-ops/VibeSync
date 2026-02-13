import React, { useState, useEffect, useRef } from 'react';
import CameraWithMood from '../components/CameraWithMood';
import { moodPlaylists } from '../data/moodPlaylists';
import FullMoodRoom from '../components/MoodRoom';

const Experience = () => {
  const [currentMood, setCurrentMood] = useState(null);
  const [isMoodLocked, setIsMoodLocked] = useState(false);
  const [lockedMood, setLockedMood] = useState(null);
  
  // Use locked mood for both music AND HDR when locked
  const activeMood = isMoodLocked ? lockedMood : currentMood;

  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [volume, setVolume] = useState(1.0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPlayPrompt, setShowPlayPrompt] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [VolumeDirection, setVolumeDirection] = useState(0);
  const [isMoodRoomOpen, setIsMoodRoomOpen] = useState(false);

  const audioRef = useRef(null);

  

  useEffect(() => {
    // bina face detection ke bhi chalega agar mood lock h toh
    if (!activeMood) {
      setSongs([]);
      setCurrentSongIndex(0);
      return;
    }

    if (!isMoodLocked && !faceDetected) {
      return; 
    }

    const loadSongs = async () => {
      setIsLoading(true);
      setError(null);

      const curated = moodPlaylists[activeMood.toLowerCase()];
      if (curated && curated.length > 0) {
        setSongs(curated);
      } else {
        try {
          const query = `${activeMood} hindi bollywood`;
          const res = await fetch(
            `https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}&limit=10`
          );
          const data = await res.json();
          const results = data?.data?.results || [];
          setSongs(results.length > 0 ? results : []);
        } catch (err) {
          console.error("Song loading error:", err);
          setError("Couldn't load songs");
        }
      }
      setIsLoading(false);
    };

    loadSongs();
  }, [activeMood, isMoodLocked]);

  // Song loading and playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || songs.length === 0) return;

    const song = songs[currentSongIndex];
    if (!song) return;

    const src = song.url || song.downloadUrl?.[4]?.url || song.url;
    if (!src) return;

    if (audio.src !== src) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = src;
      audio.load();
      audio.play().catch(() => setShowPlayPrompt(true));
    }

    const handleEnded = () => setCurrentSongIndex((i) => (i + 1) % songs.length);
    audio.addEventListener('ended', handleEnded);

    return () => audio.removeEventListener('ended', handleEnded);
  }, [songs, currentSongIndex]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, [volume]);

  const handleVolumeDown = () => {
    setVolume((prevVolume) => {
      const newVolume = Math.max(0, prevVolume - 0.2);
      console.log(`🔉 Volume decreased: ${(newVolume * 100).toFixed(0)}%`);
      return newVolume;
    });
    setVolumeDirection(-1);
    setTimeout(() => setVolumeDirection(0), 500);
  };

  const handleVolumeUp = () => {
    setVolume((prevVolume) => {
      const newVolume = Math.min(1, prevVolume + 0.2);
      console.log(`🔊 Volume increased: ${(newVolume * 100).toFixed(0)}%`);
      return newVolume;
    });
    setVolumeDirection(1);
    setTimeout(() => setVolumeDirection(0), 500);
  };

  // Mood lock handler
  const handleMoodLock = () => {
    console.log("Lock button clicked. Current state:", { isMoodLocked, currentMood });
    if (isMoodLocked) {
      // Unlock
      setIsMoodLocked(false);
      setLockedMood(null);
      console.log("Unlocking mood");
    } else if (currentMood) {
      //  current detected mood lock
      setLockedMood(currentMood);
      setIsMoodLocked(true);
      console.log("Locking mood to:", currentMood);
    }
  };

  const handleMetaverseClick = () => {
    console.log("Metaverse button clicked. Active mood:", activeMood);
    if (activeMood) {
      setIsMoodRoomOpen(true);
      console.log("Opening mood room");
    } else {
      console.warn("No active mood - metaverse disabled");
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col lg:flex-row overflow-hidden">
      {/* Camera */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full relative bg-gray-900">
        <CameraWithMood
          onMoodChange={setCurrentMood}
          onFaceDetected={setFaceDetected}
          onCameraReady={() => setIsCameraReady(true)}
          onVolumeDown={handleVolumeDown}
          onVolumeUp={handleVolumeUp}
        />

        {!isCameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-xl z-50">
            Waiting for camera...
          </div>
        )}

        {isCameraReady && !faceDetected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white z-50">
            <div className="text-center px-6">
              {isMoodLocked ? (
                <>
                  <p className="text-xl sm:text-2xl font-bold mb-3 text-yellow-300">Mood locked 🔒</p>
                  <p className="text-base sm:text-lg opacity-90">Music & environment continue</p>
                </>
              ) : (
                <>
                  <p className="text-xl sm:text-2xl font-bold mb-2">No face detected</p>
                  <p className="text-base sm:text-lg opacity-80">Make sure face is visible</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Music Player */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col items-center justify-start lg:justify-center p-4 sm:p-6 lg:p-12 bg-gradient-to-br from-purple-950 via-indigo-950 to-black text-white relative z-10 overflow-y-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 lg:mb-8 text-center">
          {activeMood ? (
            <>
              Feeling <span className="text-purple-400 capitalize">{activeMood}</span>
              {isMoodLocked && <span className="ml-2 text-yellow-400 text-2xl sm:text-3xl">🔒</span>}
            </>
          ) : (
            "Detecting your mood..."
          )}
        </h2>

        {isLoading && <p className="text-lg sm:text-xl opacity-70 mb-4 sm:mb-6">Loading songs...</p>}
        {error && <p className="text-red-400 text-lg sm:text-xl mb-4 sm:mb-6 text-center">{error}</p>}

        {songs.length > 0 && (
          <div className="w-full max-w-md relative z-20 pb-20 lg:pb-6">
            {songs[currentSongIndex]?.image && (
              <img
                src={songs[currentSongIndex].image}
                alt={songs[currentSongIndex].name}
                className="w-full aspect-square rounded-2xl shadow-2xl mb-4 sm:mb-6 object-cover"
              />
            )}

            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-1 line-clamp-2">
              {songs[currentSongIndex]?.name || songs[currentSongIndex]?.title || '—'}
            </h3>

            <p className="text-center text-base sm:text-lg opacity-80 mb-3 sm:mb-4">
              {songs[currentSongIndex]?.artist || '—'}
            </p>

            <audio
              ref={audioRef}
              controls
              controlsList="nodownload noplaybackrate"
              className="w-full h-10 md:h-12 mb-4 sm:mb-6 rounded-lg bg-gradient-to-r from-purple-950/40 to-indigo-950/40 shadow-lg"
              onVolumeChange={(e) => {
              
                const audioVolume = e.target.volume;
                if (Math.abs(audioVolume - volume) > 0.1) {
                  setVolume(audioVolume);
                }
              }}
            />

            {/* Volume Indicator */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm opacity-70">Volume</span>
                <span className="text-xs sm:text-sm font-bold">{Math.round(volume * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${volume * 100}%` }}
                />
              </div>
              <p className="text-xs opacity-60 mt-2 text-center">
                💡 Tilt your head left/right to adjust volume
              </p>
            </div>

            {/* Responsive Button  */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
              
              <button
                onClick={() => setCurrentSongIndex((i) => (i - 1 + songs.length) % songs.length)}
                className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 hover:bg-gray-600 rounded-full text-white font-medium shadow-lg text-xs sm:text-sm md:text-base transition"
              >
                Previous
              </button>

              {/* Lock Mood button*/}
              <button
                onClick={handleMoodLock}
                disabled={!currentMood && !isMoodLocked}
                className={`
                  px-3 sm:px-4 py-2.5 sm:py-3 rounded-full font-medium shadow-lg text-xs sm:text-sm md:text-base transition
                  ${isMoodLocked ? 'bg-yellow-600 hover:bg-yellow-500 text-black' : 'bg-gray-700 hover:bg-gray-500 text-white'}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isMoodLocked ? '🔓 Unlock' : '🔒 Lock'}
              </button>

              {/* Skip Song button */}
              <button
                onClick={() => setCurrentSongIndex((i) => (i + 1) % songs.length)}
                className="px-3 sm:px-5 py-2.5 sm:py-3.5 bg-purple-600 hover:bg-purple-700 rounded-full text-white font-bold shadow-xl text-xs sm:text-sm md:text-base lg:text-lg transition transform hover:scale-105 col-span-2 sm:col-span-1"
              >
                Skip Song
              </button>

              {/* Metaverse Mode button */}
              <button
                onClick={handleMetaverseClick}
                disabled={!activeMood}
                className={`
                  px-3 sm:px-5 py-3 sm:py-4 rounded-full font-bold shadow-xl transform transition text-xs sm:text-sm md:text-base
                  col-span-2 sm:col-span-3 lg:col-span-2
                  ${activeMood 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 text-white' 
                    : 'bg-gray-700 opacity-50 cursor-not-allowed text-gray-400'
                  }
                `}
              >
                🌌 Metaverse Mode
              </button>

              {/* Back button to explore page*/}
              <button
                onClick={() => window.location.href = '/explore'}
                className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-600 hover:bg-gray-500 rounded-full text-white font-medium shadow-lg text-xs sm:text-sm md:text-base transition col-span-2 sm:col-span-3 lg:col-span-1"
              >
                Back
              </button>
            </div>

            {showPlayPrompt && (
              <div className="text-center mt-4 bg-black/60 p-3 sm:p-4 rounded-xl border border-yellow-500/50">
                <p className="text-yellow-300 mb-2 sm:mb-3 text-sm sm:text-base">Browser blocked autoplay</p>
                <button
                  onClick={() => audioRef.current?.play()}
                  className="px-5 sm:px-8 py-3 sm:py-4 bg-green-600 hover:bg-green-700 rounded-full text-white font-bold shadow-xl text-sm sm:text-base"
                >
                  Play Music Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full screen Mood Room overlay  */}
      {isMoodRoomOpen && activeMood && (
        <FullMoodRoom 
          mood={activeMood}
          onClose={() => {
            console.log("Closing mood room");
            setIsMoodRoomOpen(false);
          }} 
        />
      )}
    </div>
  );
};

export default Experience;