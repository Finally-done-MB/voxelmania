// Web Audio API Context
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let compressor: DynamicsCompressorNode | null = null;
let reverbNode: ConvolverNode | null = null;
let ambientInterval: ReturnType<typeof setInterval> | null = null;

// Configuration
const FADE_TIME = 2.0; // Seconds for fade in/out
const REVERB_SECONDS = 3.0; // Length of reverb tail

// Pentatonic Scale (C Major Pentatonic: C, D, E, G, A)
// Frequencies in Hz for C4, D4, E4, G4, A4
const SCALE = [261.63, 293.66, 329.63, 392.00, 440.00]; 

export const initAudio = () => {
  if (audioCtx) return;

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  audioCtx = new AudioContextClass();

  // Master Chain: Source -> Compressor -> MasterGain -> Reverb -> Destination
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.5; // Default volume

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
  // Dry signal path: Compressor -> Master -> Destination
  compressor.connect(masterGain);
  masterGain.connect(audioCtx.destination);

  // Wet signal path (Reverb): Master -> Reverb -> Destination
  // We send a portion of master to reverb for that "spacey" feel
  const reverbGain = audioCtx.createGain();
  reverbGain.gain.value = 0.4; // 40% wet mix
  masterGain.connect(reverbGain);
  reverbGain.connect(reverbNode);
  reverbNode.connect(audioCtx.destination);
};

export const resumeAudio = async () => {
  if (!audioCtx) initAudio();
  if (audioCtx?.state === 'suspended') {
    await audioCtx.resume();
  }
};

// --- Generative Ambient Music ---

export const startAmbientMusic = () => {
  if (ambientInterval) return;
  if (!audioCtx) initAudio();

  // Play a note every 2-4 seconds
  const scheduleNextNote = () => {
    playAmbientNote();
    const nextTime = 2000 + Math.random() * 2000;
    ambientInterval = setTimeout(scheduleNextNote, nextTime);
  };

  scheduleNextNote();
};

export const stopAmbientMusic = () => {
  if (ambientInterval) {
    clearTimeout(ambientInterval);
    ambientInterval = null;
  }
};

const playAmbientNote = () => {
  if (!audioCtx || !masterGain || !compressor) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
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
  gain.connect(compressor); // Send to compressor (which goes to reverb)

  osc.start(now);
  osc.stop(now + attack + release + 1);
};

// --- SFX: Explosion ---

export const playExplosionSound = () => {
  if (!audioCtx || !compressor) return;
  resumeAudio();

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
  noiseGain.connect(compressor);
  
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
  subGain.connect(compressor);

  sub.start(t);
  sub.stop(t + 0.5);
};

// --- SFX: Crumble (Granular) ---

export const playCrumbleSound = () => {
  if (!audioCtx || !compressor) return;
  resumeAudio();

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
  gain.connect(compressor);

  osc.start(t);
  osc.stop(t + 0.15);
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
