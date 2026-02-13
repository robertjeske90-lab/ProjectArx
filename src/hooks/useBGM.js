import { useState, useEffect, useRef, useCallback } from 'react';
import { ASSET_CONFIG } from '../data/assetConfig';

// Global Audio Context (singleton)
let globalAudioContext = null;

export function useBGM() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolumeState] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Build music URL
  const getMusicUrl = useCallback((category, filename) => {
    return `${ASSET_CONFIG.music.baseUrl}/${category}/${filename}`;
  }, []);

  // Play a track
  const play = useCallback(async (category, filename, options = {}) => {
    if (!audioRef.current) return;

    const { fadeIn = true, loop = true } = options;
    const url = getMusicUrl(category, filename);

    // If same track, just resume
    if (currentTrack?.url === url && audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    // Fade out current track if playing
    if (isPlaying && fadeIn) {
      await fadeOut(500);
    }

    // Load new track
    audioRef.current.src = url;
    audioRef.current.loop = loop;
    audioRef.current.volume = fadeIn ? 0 : (isMuted ? 0 : volume);

    try {
      await audioRef.current.play();
      setCurrentTrack({ category, filename, url });
      setIsPlaying(true);

      // Fade in
      if (fadeIn && !isMuted) {
        fadeToVolume(volume, 1000);
      }
    } catch (err) {
      console.warn('Audio playback failed:', err);
      // Browser might block autoplay - that's okay
    }
  }, [currentTrack, isPlaying, volume, isMuted, getMusicUrl]);

  // Pause playback
  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Stop and reset
  const stop = useCallback(async (fadeOut = true) => {
    if (!audioRef.current) return;

    if (fadeOut && isPlaying) {
      await fadeToVolume(0, 500);
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTrack(null);
  }, [isPlaying]);

  // Set volume (0-1)
  const setVolume = useCallback((newVolume) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clamped);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Fade to target volume
  const fadeToVolume = useCallback((targetVolume, duration = 1000) => {
    return new Promise((resolve) => {
      if (!audioRef.current) {
        resolve();
        return;
      }

      // Clear existing fade
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }

      const startVolume = audioRef.current.volume;
      const volumeDiff = targetVolume - startVolume;
      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = volumeDiff / steps;
      let currentStep = 0;

      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          audioRef.current.volume = targetVolume;
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
          resolve();
        } else {
          audioRef.current.volume = startVolume + (volumeStep * currentStep);
        }
      }, stepDuration);
    });
  }, []);

  // Fade out helper
  const fadeOut = useCallback((duration = 500) => {
    return fadeToVolume(0, duration);
  }, [fadeToVolume]);

  // Play character theme
  const playCharacterTheme = useCallback((themeId) => {
    if (!themeId) return;
    play('themes', `${themeId}.mp3`);
  }, [play]);

  // Play ambient
  const playAmbient = useCallback((ambientId) => {
    if (!ambientId) return;
    play('ambient', `${ambientId}.mp3`, { loop: true });
  }, [play]);

  // Play combat music
  const playCombat = useCallback((intensity = 'medium') => {
    const combatTracks = {
      low: 'battle_03.mp3',
      medium: 'battle_01.mp3',
      high: 'battle_02.mp3',
      epic: 'boss_01.mp3'
    };
    play('combat', combatTracks[intensity] || combatTracks.medium);
  }, [play]);

  return {
    // State
    isPlaying,
    currentTrack,
    volume,
    isMuted,
    
    // Controls
    play,
    pause,
    stop,
    setVolume,
    toggleMute,
    fadeToVolume,
    
    // Convenience methods
    playCharacterTheme,
    playAmbient,
    playCombat,
  };
}

// Simple BGM Controls Component
export function BGMControls({ className = '' }) {
  const { isPlaying, volume, isMuted, pause, setVolume, toggleMute, currentTrack } = useBGM();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className="p-2 text-gray-400 hover:text-white transition-colors"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
      </button>
      
      {/* Volume Slider */}
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        title={`Volume: ${Math.round(volume * 100)}%`}
      />
      
      {/* Now Playing */}
      {currentTrack && (
        <span className="text-gray-500 text-xs truncate max-w-[100px]">
          {currentTrack.filename}
        </span>
      )}
    </div>
  );
}

export default useBGM;
