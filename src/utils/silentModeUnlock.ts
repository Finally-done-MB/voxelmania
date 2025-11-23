/**
 * Silent Mode Unlocker for iOS/Android
 * 
 * iOS devices have a hardware mute switch that blocks Web Audio API playback.
 * However, HTML5 <audio> elements can bypass this restriction. By playing
 * a silent audio file via HTML5 audio, we "unlock" the Web Audio API to
 * work even when the device is in silent mode.
 * 
 * This must be called on a user interaction event (browser requirement).
 */

let unlockAttempted = false;
let unlockAudio: HTMLAudioElement | null = null;

/**
 * Creates a silent audio buffer programmatically
 * Returns a Data URI for a silent MP3-like audio
 */
function createSilentAudioDataURI(): string {
  // Create a minimal silent audio buffer
  // Using a very short silent WAV file encoded as base64
  // This is a 1-sample silent WAV file (44.1kHz, mono, 16-bit)
  const silentWavBase64 = 'UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  return `data:audio/wav;base64,${silentWavBase64}`;
}

/**
 * Unlocks Web Audio API by playing silent HTML5 audio
 * This bypasses iOS silent mode restrictions
 * 
 * Must be called from a user interaction handler (click, touch, etc.)
 */
export const unlockSilentMode = (): Promise<void> => {
  return new Promise((resolve) => {
    // Only attempt once per session (browser may cache the unlock)
    if (unlockAttempted && unlockAudio) {
      // If we already have an audio element, try playing it again
      unlockAudio.currentTime = 0;
      unlockAudio.play().then(() => {
        resolve();
      }).catch(() => {
        // If play fails, create a new one
        createNewUnlockAudio().then(resolve);
      });
      return;
    }

    createNewUnlockAudio().then(resolve);
  });
};

function createNewUnlockAudio(): Promise<void> {
  return new Promise((resolve) => {
    unlockAttempted = true;

    // Create a temporary audio element
    unlockAudio = new Audio();
    unlockAudio.src = createSilentAudioDataURI();
    unlockAudio.volume = 0.01; // Very quiet, but not zero (some browsers ignore zero)
    unlockAudio.preload = 'auto';

    let resolved = false;
    const safeResolve = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };

    // Set up event handlers
    const handleCanPlay = () => {
      unlockAudio?.play()
        .then(() => {
          // Success - Web Audio API should now work
          console.log('✅ Silent mode unlock successful');
          safeResolve();
        })
        .catch((error) => {
          // Play failed, but we'll continue anyway
          console.warn('Silent mode unlock play failed:', error);
          safeResolve(); // Resolve anyway - Web Audio might still work
        });
    };

    const handleError = () => {
      // Audio creation failed, but continue anyway
      console.warn('Silent mode unlock audio creation failed');
      safeResolve();
    };

    // CRITICAL FIX: Add timeout to prevent hanging forever on mobile
    const timeout = setTimeout(() => {
      console.warn('Silent mode unlock timeout - continuing anyway');
      safeResolve();
    }, 300); // 300ms timeout

    unlockAudio.addEventListener('canplaythrough', handleCanPlay, { once: true });
    unlockAudio.addEventListener('error', handleError, { once: true });

    // Also try 'loadeddata' as a fallback (fires earlier than canplaythrough)
    unlockAudio.addEventListener('loadeddata', () => {
      clearTimeout(timeout);
      handleCanPlay();
    }, { once: true });

    // Start loading
    unlockAudio.load();
  });
}

/**
 * Cleanup function (optional, for memory management)
 */
export const cleanupSilentModeUnlock = () => {
  if (unlockAudio) {
    unlockAudio.pause();
    unlockAudio.src = '';
    unlockAudio = null;
  }
  unlockAttempted = false;
};

