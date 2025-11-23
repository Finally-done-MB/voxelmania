// Web Audio API Context
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let sfxGain: GainNode | null = null; // Separate gain for SFX (independent of music)
let compressor: DynamicsCompressorNode | null = null;
let reverbNode: ConvolverNode | null = null;
let ambientInterval: ReturnType<typeof setInterval> | null = null;
let activeOscillators: OscillatorNode[] = []; // Track all active oscillators for immediate stop

// Configuration
const REVERB_SECONDS = 3.0; // Length of reverb tail

// Pentatonic Scale (C Major Pentatonic: C, D, E, G, A)
// Frequencies in Hz for C4, D4, E4, G4, A4
const SCALE = [261.63, 293.66, 329.63, 392.00, 440.00]; 

export const initAudio = () => {
  if (audioCtx) return;

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  audioCtx = new AudioContextClass();
  // Store reference for checking state
  (window as any).__audioCtx = audioCtx;

  // Master Chain: Source -> Compressor -> MasterGain -> Reverb -> Destination
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0; // Start muted (muted autoplay is allowed)

  // SFX Gain: Independent of music volume
  sfxGain = audioCtx.createGain();
  sfxGain.gain.value = 1; // SFX always at full volume (controlled by isSfxMuted separately)

  compressor = audioCtx.createDynamicsCompressor();
  compressor.threshold.value = -24;
  compressor.knee.value = 30;
  compressor.ratio.value = 12;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;

  // Create Algorithmic Reverb (Impulse Response)
  reverbNode = audioCtx.createConvolver();
  reverbNode.buffer = createReverbImpulse(REVERB_SECONDS, 2.0); // 2.0 decay

  // Connect the chain
  // Music path: Compressor -> MasterGain -> Destination
  compressor.connect(masterGain);
  masterGain.connect(audioCtx.destination);

  // SFX path: SfxGain -> Destination (SFX connects directly to sfxGain, bypassing masterGain)
  sfxGain.connect(audioCtx.destination);

  // Wet signal path (Reverb): Master -> Reverb -> Destination
  // We send a portion of master to reverb for that "spacey" feel
  const reverbGain = audioCtx.createGain();
  reverbGain.gain.value = 0.4; // 40% wet mix
  masterGain.connect(reverbGain);
  reverbGain.connect(reverbNode);
  reverbNode.connect(audioCtx.destination);
};

export const resumeAudio = async () => {
  if (!audioCtx) {
    initAudio();
    // Start music immediately (muted autoplay is allowed)
    startAmbientMusic();
  }
  if (audioCtx?.state === 'suspended') {
    await audioCtx.resume();
  }
};

// --- Generative Ambient Music ---

export const startAmbientMusic = () => {
  // Don't restart if already playing
  if (ambientInterval) {
    return; // Music is already playing
  }
  
  if (!audioCtx) initAudio();
  if (!audioCtx) return;
  
  // Try to resume if suspended (needed for audio to actually play)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(console.error);
  }

  // Play a note every 2-4 seconds
  const scheduleNextNote = () => {
    playAmbientNote();
    const nextTime = 2000 + Math.random() * 2000;
    ambientInterval = setTimeout(scheduleNextNote, nextTime);
  };

  scheduleNextNote();
};


export const stopAmbientMusic = () => {
  // Stop the interval immediately
  if (ambientInterval) {
    clearTimeout(ambientInterval);
    ambientInterval = null;
  }
  // Stop all currently playing oscillators immediately
  activeOscillators.forEach(osc => {
    try {
      osc.stop();
      osc.disconnect();
    } catch (e) {
      // Oscillator might already be stopped
    }
  });
  activeOscillators = [];
  
  // Fade out master gain quickly (mute)
  if (masterGain && audioCtx) {
    const now = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0, now + 0.05); // Very quick fade (50ms)
  }
};

// Set volume (for unmuting)
export const setMusicVolume = (volume: number) => {
  if (masterGain && audioCtx) {
    const now = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(volume, now + 0.1); // Smooth fade
  }
};

// Set SFX volume (independent of music)
export const setSfxVolume = (volume: number) => {
  if (sfxGain && audioCtx) {
    const now = audioCtx.currentTime;
    sfxGain.gain.cancelScheduledValues(now);
    sfxGain.gain.setValueAtTime(sfxGain.gain.value, now);
    sfxGain.gain.linearRampToValueAtTime(volume, now + 0.1); // Smooth fade
  }
};

const playAmbientNote = () => {
  if (!audioCtx || !masterGain || !compressor) {
    console.warn('Cannot play ambient note: audio nodes not initialized', { audioCtx: !!audioCtx, masterGain: !!masterGain, compressor: !!compressor });
    return;
  }

  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    // Track this oscillator for immediate stopping
    activeOscillators.push(osc);
    
    // Pick a random note from the scale
    const baseFreq = SCALE[Math.floor(Math.random() * SCALE.length)];
    // Randomize octave: -1, 0, or +1
    const octaveMultiplier = Math.pow(2, Math.floor(Math.random() * 3) - 1);
    const freq = baseFreq * octaveMultiplier;

    osc.type = 'triangle'; // Soft, bell-like tone
    osc.frequency.value = freq;

    // Envelope (ADSR)
    const now = audioCtx.currentTime;
    const attack = 0.5 + Math.random() * 0.5; // Slow attack
    const release = 2.0 + Math.random() * 1.0; // Long release

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + attack); // Low volume for ambient
    gain.gain.exponentialRampToValueAtTime(0.001, now + attack + release);

    osc.connect(gain);
    gain.connect(compressor); // Music goes through compressor -> masterGain

    osc.start(now);
    osc.stop(now + attack + release + 1);
    
    // Clean up after note finishes
    osc.onended = () => {
      gain.disconnect();
      // Remove from active oscillators list
      const index = activeOscillators.indexOf(osc);
      if (index > -1) {
        activeOscillators.splice(index, 1);
      }
    };
  } catch (error) {
    console.error('Error playing ambient note:', error);
  }
};

// --- SFX: Explosion ---

export const playExplosionSound = () => {
  // Initialize audio context if needed (independent of music state)
  if (!audioCtx) initAudio();
  if (!audioCtx || !compressor) return;
  // Resume audio context if suspended (needed for SFX to play)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(console.error);
  }

  const t = audioCtx.currentTime;
  
  // 1. Noise Burst (The "Boom")
  const bufferSize = audioCtx.sampleRate * 2; // 2 seconds
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.setValueAtTime(1000, t);
  noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 1); // Sweep down

  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(1, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(sfxGain || compressor); // Connect to sfxGain for independent volume control
  
  noise.start(t);
  noise.stop(t + 2);

  // 2. Sub-bass thump
  const sub = audioCtx.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(150, t);
  sub.frequency.exponentialRampToValueAtTime(40, t + 0.5); // Pitch drop

  const subGain = audioCtx.createGain();
  subGain.gain.setValueAtTime(0.8, t);
  subGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

  sub.connect(subGain);
  subGain.connect(sfxGain || compressor); // Connect to sfxGain for independent volume control

  sub.start(t);
  sub.stop(t + 0.5);
};

// --- SFX: Crumble (Granular) ---

export const playCrumbleSound = () => {
  // Initialize audio context if needed (independent of music state)
  if (!audioCtx) initAudio();
  if (!audioCtx || !compressor) return;
  // Resume audio context if suspended (needed for SFX to play)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(console.error);
  }

  // Play 5-10 small "grains" of sound
  const grains = 5 + Math.floor(Math.random() * 5);
  
  for (let i = 0; i < grains; i++) {
    // Stagger them slightly
    const offset = Math.random() * 0.3; // Within 300ms
    playCrumbleGrain(offset);
  }
};

const playCrumbleGrain = (offset: number) => {
  if (!audioCtx || !compressor) return;
  
  const t = audioCtx.currentTime + offset;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  // Random high-ish pitch (like stone hitting stone)
  osc.type = 'square';
  osc.frequency.value = 200 + Math.random() * 600; 

  // Very short envelope (click/thud)
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.1, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

  // Filter to make it sound more like rock/material
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 400 + Math.random() * 400;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain || compressor); // Connect to sfxGain for independent volume control

  osc.start(t);
  osc.stop(t + 0.15);
};

// --- Audio Pool Manager for Particle Collisions ---
// Uses ambient granular texture + sparse prominent impacts (best practice for many particles)

interface CollisionEvent {
  velocity: number;
  isGround: boolean;
  timestamp: number;
}

class AudioPoolManager {
  private collisionQueue: CollisionEvent[] = [];
  private lastCollisionTime: Map<string, number> = new Map();
  
  // Configuration - Sparse sampling for prominent impacts only
  private readonly MAX_PROMINENT_IMPACTS_PER_SECOND = 3; // Very sparse - only biggest impacts
  private readonly MIN_VELOCITY_FOR_PROMINENT = 8; // Only play individual sounds for big impacts
  private readonly DEBOUNCE_TIME = 200; // ms
  private readonly GROUND_Y_THRESHOLD = -4.5;
  
  // Ambient granular texture (continuous, not per-collision)
  private ambientGainNode: GainNode | null = null;
  private ambientInterval: ReturnType<typeof setInterval> | null = null;
  private isAmbientActive: boolean = false;
  private activityLevel: number = 0; // 0-1, tracks particle activity
  
  // Explosion-specific handling
  private isExplosionMode: boolean = false;
  private explosionStartTime: number = 0;
  private readonly EXPLOSION_BURST_DURATION = 0.5; // seconds - initial burst phase
  
  // Rate limiting for prominent impacts
  private prominentImpactsThisSecond: number = 0;
  private secondStartTime: number = 0;

  setExplosionMode(isExplosion: boolean): void {
    this.isExplosionMode = isExplosion;
    if (isExplosion) {
      this.explosionStartTime = performance.now() / 1000; // Convert to seconds
      // Immediately boost activity for explosion
      this.activityLevel = 0.8;
    }
  }
  
  addCollision(velocity: number, isGround: boolean, particleId: string): void {
    const now = performance.now();
    const nowSeconds = now / 1000;
    
    // Update activity level (for ambient texture)
    // Explosions get faster activity buildup
    const activityBoost = this.isExplosionMode ? 0.05 : 0.01;
    this.activityLevel = Math.min(1, this.activityLevel + activityBoost);
    
    // Debounce (shorter for explosions during burst phase)
    const debounceTime = this.isExplosionMode && 
      (nowSeconds - this.explosionStartTime) < this.EXPLOSION_BURST_DURATION 
      ? this.DEBOUNCE_TIME * 0.5 
      : this.DEBOUNCE_TIME;
    
    const lastTime = this.lastCollisionTime.get(particleId) || 0;
    if (now - lastTime < debounceTime) return;
    
    // During explosion burst phase, lower threshold for prominent impacts
    const timeSinceExplosion = this.isExplosionMode 
      ? nowSeconds - this.explosionStartTime 
      : Infinity;
    const isInBurstPhase = timeSinceExplosion < this.EXPLOSION_BURST_DURATION;
    const velocityThreshold = isInBurstPhase ? 5 : this.MIN_VELOCITY_FOR_PROMINENT;
    
    // Queue prominent impacts
    if (velocity >= velocityThreshold) {
      this.collisionQueue.push({
        velocity,
        isGround,
        timestamp: now
      });
    }
    
    this.lastCollisionTime.set(particleId, now);
    
    // Clean old entries
    if (this.lastCollisionTime.size > 1000) {
      const cutoff = now - debounceTime * 10;
      for (const [id, time] of this.lastCollisionTime.entries()) {
        if (time < cutoff) this.lastCollisionTime.delete(id);
      }
    }
  }

  startAmbientTexture(): void {
    if (this.isAmbientActive || !audioCtx || !compressor) return;
    
    this.isAmbientActive = true;
    
    // Create gain node for ambient texture
    this.ambientGainNode = audioCtx.createGain();
    this.ambientGainNode.gain.value = 0;
    this.ambientGainNode.connect(sfxGain || compressor); // Connect to sfxGain for independent volume control
    
    // Play granular grains continuously based on activity
    const playGrain = () => {
      if (!audioCtx || !this.ambientGainNode || !this.isAmbientActive) return;
      
      // For explosions, use faster, more intense grains during burst phase
      const timeSinceExplosion = this.isExplosionMode 
        ? (performance.now() / 1000) - this.explosionStartTime 
        : Infinity;
      const isInBurstPhase = timeSinceExplosion < this.EXPLOSION_BURST_DURATION;
      
      // Activity determines grain frequency and volume
      // Explosions get faster grains during burst
      const baseInterval = isInBurstPhase ? 30 : 50;
      const maxInterval = isInBurstPhase ? 100 : 200;
      const grainInterval = Math.max(baseInterval, maxInterval - this.activityLevel * (maxInterval - baseInterval));
      
      // Higher volume during explosion burst
      const baseVolume = isInBurstPhase ? 0.05 : 0.02;
      const maxVolume = isInBurstPhase ? 0.15 : 0.1;
      const grainVolume = baseVolume + this.activityLevel * (maxVolume - baseVolume);
      
      playAmbientCollisionGrain(grainVolume, isInBurstPhase);
      
      this.ambientInterval = setTimeout(playGrain, grainInterval);
    };
    
    // Faster fade-in for explosions
    const fadeTime = this.isExplosionMode ? 0.1 : 0.5;
    if (this.ambientGainNode) {
      const now = audioCtx.currentTime;
      this.ambientGainNode.gain.setValueAtTime(0, now);
      this.ambientGainNode.gain.linearRampToValueAtTime(1, now + fadeTime);
    }
    
    playGrain();
  }
  
  stopAmbientTexture(): void {
    if (this.ambientInterval) {
      clearTimeout(this.ambientInterval);
      this.ambientInterval = null;
    }
    
    if (this.ambientGainNode && audioCtx) {
      const now = audioCtx.currentTime;
      this.ambientGainNode.gain.linearRampToValueAtTime(0, now + 0.3);
      setTimeout(() => {
        if (this.ambientGainNode) {
          this.ambientGainNode.disconnect();
          this.ambientGainNode = null;
        }
      }, 300);
    }
    
    this.isAmbientActive = false;
    this.activityLevel = 0;
  }
  
  updateActivityLevel(deltaTime: number): void {
    // Decay activity level over time
    this.activityLevel = Math.max(0, this.activityLevel - deltaTime * 0.5);
  }

  processQueue(isSfxMuted: boolean = false): void {
    if (!audioCtx || !compressor || isSfxMuted) {
      this.collisionQueue = [];
      return;
    }
    
    const now = performance.now();
    const nowSeconds = now / 1000;
    
    // Update rate limiting
    if (now - this.secondStartTime > 1000) {
      this.prominentImpactsThisSecond = 0;
      this.secondStartTime = now;
    }
    
    if (this.collisionQueue.length === 0) return;
    
    // Sort by velocity (highest first)
    this.collisionQueue.sort((a, b) => b.velocity - a.velocity);
    
    // During explosion burst, allow more prominent impacts
    const timeSinceExplosion = this.isExplosionMode 
      ? nowSeconds - this.explosionStartTime 
      : Infinity;
    const isInBurstPhase = timeSinceExplosion < this.EXPLOSION_BURST_DURATION;
    const maxImpacts = isInBurstPhase ? 8 : this.MAX_PROMINENT_IMPACTS_PER_SECOND; // More during burst
    
    // Play prominent impact sounds
    for (const event of this.collisionQueue) {
      if (this.prominentImpactsThisSecond >= maxImpacts) break;
      
      // Play prominent impact sound
      if (event.isGround) {
        playGroundImpactSound(event.velocity);
      } else {
        playParticleCollisionSound(event.velocity);
      }
      
      this.prominentImpactsThisSecond++;
    }
    
    // Clear processed events
    this.collisionQueue = [];
  }
  
  checkGroundImpact(y: number): boolean {
    return y <= this.GROUND_Y_THRESHOLD;
  }
}

// Ambient collision grain (continuous texture)
const playAmbientCollisionGrain = (volume: number, isExplosionBurst: boolean = false) => {
  if (!audioCtx || !compressor) return;
  
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  // For explosions, use wider frequency range and more energy
  if (isExplosionBurst) {
    osc.type = 'sawtooth'; // Richer harmonics for explosions
    osc.frequency.value = 150 + Math.random() * 600; // 150-750 Hz (wider range)
  } else {
    osc.type = 'square';
    osc.frequency.value = 200 + Math.random() * 400; // 200-600 Hz
  }
  
  // Slightly longer grains for explosions
  const duration = isExplosionBurst 
    ? 0.04 + Math.random() * 0.04  // 40-80ms
    : 0.03 + Math.random() * 0.03;  // 30-60ms
    
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  
  // Filter: wider bandpass for explosions
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  if (isExplosionBurst) {
    filter.frequency.value = 200 + Math.random() * 500; // 200-700 Hz
    filter.Q.value = 2; // Less sharp for more energy
  } else {
    filter.frequency.value = 300 + Math.random() * 300;
    filter.Q.value = 3;
  }
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain || compressor); // Connect to sfxGain for independent volume control
  
  osc.start(t);
  osc.stop(t + duration + 0.01);
};

const audioPoolManager = new AudioPoolManager();

// Export for use in DebrisField
export const addCollisionEvent = (velocity: number, isGround: boolean, particleId: string) => {
  audioPoolManager.addCollision(velocity, isGround, particleId);
};

export const processCollisionQueue = (isSfxMuted: boolean = false, deltaTime: number = 0.016) => {
  audioPoolManager.updateActivityLevel(deltaTime);
  audioPoolManager.processQueue(isSfxMuted);
};

export const checkGroundImpact = (y: number): boolean => {
  return audioPoolManager.checkGroundImpact(y);
};

export const startDebrisAmbient = (isExplosion: boolean = false) => {
  audioPoolManager.setExplosionMode(isExplosion);
  audioPoolManager.startAmbientTexture();
};

export const stopDebrisAmbient = () => {
  audioPoolManager.setExplosionMode(false);
  audioPoolManager.stopAmbientTexture();
};

// --- SFX: Particle Collision ---

const playParticleCollisionSound = (velocity: number) => {
  // Initialize audio context if needed (independent of music state)
  if (!audioCtx) initAudio();
  if (!audioCtx || !compressor) return;
  // Resume audio context if suspended (needed for SFX to play)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(console.error);
  }

  const t = audioCtx.currentTime;
  
  // Scale volume and pitch based on velocity
  const velocityFactor = Math.min(velocity / 20, 1); // Normalize to 0-1
  const volume = 0.05 + velocityFactor * 0.15; // 0.05 to 0.2
  const pitchVariation = 0.8 + Math.random() * 0.4; // ±20% variation
  
  // Higher frequency for particle-to-particle (more "clicky")
  const baseFreq = 300 + velocityFactor * 400; // 300-700 Hz
  const freq = baseFreq * pitchVariation;
  
  // Short click/thud sound
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'square';
  osc.frequency.value = freq;
  
  // Very short envelope (50-100ms)
  const duration = 0.05 + velocityFactor * 0.05;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  
  // Bandpass filter for material-like sound
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = 2;
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain || compressor); // Connect to sfxGain for independent volume control
  
  osc.start(t);
  osc.stop(t + duration + 0.01);
};

// --- SFX: Click Impact (Pew/Bam) ---

export const playClickImpactSound = () => {
  // Initialize audio context if needed (independent of music state)
  if (!audioCtx) initAudio();
  if (!audioCtx || !compressor) return;
  // Resume audio context if suspended (needed for SFX to play)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(console.error);
  }

  const t = audioCtx.currentTime;
  
  // Low-pitched "pew" or "bam" sound
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  // Low frequency for "bam" sound (80-120 Hz)
  osc.type = 'sawtooth'; // Rich harmonics
  osc.frequency.value = 80 + Math.random() * 40; // 80-120 Hz
  
  // Short, punchy envelope
  const duration = 0.15; // 150ms
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.25, t + 0.01); // Quick attack
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  
  // Low-pass filter for deeper, more muffled "bam" sound
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 200; // Cut off high frequencies
  filter.Q.value = 1;
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(compressor);
  
  osc.start(t);
  osc.stop(t + duration + 0.01);
  
  // Add a subtle click at the start for "pew" character
  const click = audioCtx.createOscillator();
  const clickGain = audioCtx.createGain();
  
  click.type = 'square';
  click.frequency.value = 150 + Math.random() * 100; // 150-250 Hz
  
  clickGain.gain.setValueAtTime(0, t);
  clickGain.gain.linearRampToValueAtTime(0.1, t + 0.002);
  clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  
  click.connect(clickGain);
  clickGain.connect(sfxGain || compressor); // Connect to sfxGain for independent volume control
  
  click.start(t);
  click.stop(t + 0.03);
};

// --- SFX: Ground Impact ---

export const playGroundImpactSound = (velocity: number) => {
  // Initialize audio context if needed (independent of music state)
  if (!audioCtx) initAudio();
  if (!audioCtx || !compressor) return;
  // Resume audio context if suspended (needed for SFX to play)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(console.error);
  }

  const t = audioCtx.currentTime;
  
  // Scale volume and pitch based on velocity
  const velocityFactor = Math.min(velocity / 20, 1); // Normalize to 0-1
  const volume = 0.08 + velocityFactor * 0.2; // 0.08 to 0.28 (louder than collisions)
  const pitchVariation = 0.85 + Math.random() * 0.3; // ±15% variation
  
  // Lower frequency for ground impacts (more "thud")
  const baseFreq = 150 + velocityFactor * 200; // 150-350 Hz
  const freq = baseFreq * pitchVariation;
  
  // Thud sound with slight low-frequency emphasis
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sawtooth'; // Richer harmonic content
  osc.frequency.value = freq;
  
  // Slightly longer envelope (80-150ms)
  const duration = 0.08 + velocityFactor * 0.07;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  
  // Low-pass filter for deeper, more muffled sound
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400 + velocityFactor * 300; // 400-700 Hz
  filter.Q.value = 1;
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain || compressor); // Connect to sfxGain for independent volume control
  
  osc.start(t);
  osc.stop(t + duration + 0.01);
  
  // Add subtle sub-bass for larger impacts
  if (velocityFactor > 0.5) {
    const sub = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    
    sub.type = 'sine';
    sub.frequency.value = 60 + velocityFactor * 40; // 60-100 Hz
    
    subGain.gain.setValueAtTime(0, t);
    subGain.gain.linearRampToValueAtTime(volume * 0.3, t + 0.01);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + duration * 1.5);
    
    sub.connect(subGain);
    subGain.connect(sfxGain || compressor); // Connect to sfxGain for independent volume control
    
    sub.start(t);
    sub.stop(t + duration * 1.5);
  }
};

// --- Utilities ---

function createReverbImpulse(duration: number, decay: number) {
  if (!audioCtx) return audioCtx!.createBuffer(2, 1, 44100); // Fallback

  const length = audioCtx.sampleRate * duration;
  const impulse = audioCtx.createBuffer(2, length, audioCtx.sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    // Exponential decay noise
    const n = i / length;
    const envelope = Math.pow(1 - n, decay);
    
    left[i] = (Math.random() * 2 - 1) * envelope;
    right[i] = (Math.random() * 2 - 1) * envelope;
  }

  return impulse;
}
