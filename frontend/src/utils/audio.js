let ctx = null;
let globalGainNode = null;
let stopCallback = null;

let isPlaying = false;
let isPaused = false;

let activeTrack = null;
let playbackStartCtxTime = 0;
let pausedTimeOffset = 0;
let activeOscillators = [];
let progressIntervalId = null;


const mToF = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

export const playMelody = (
  musicTrack,
  offsetSeconds = 0,
  onProgress,
  onFinished,
) => {
  stopMelody();

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  ctx = new AudioContextClass();

  globalGainNode = ctx.createGain();
  globalGainNode.gain.value = 0.5;
  globalGainNode.connect(ctx.destination);

  activeTrack = musicTrack;
  isPlaying = true;
  isPaused = false;

  const tempo = musicTrack.tempo;
  const beatDuration = 60 / tempo;
  const totalBeats = 16.5;
  const totalDuration = totalBeats * beatDuration;


  pausedTimeOffset = offsetSeconds;
  playbackStartCtxTime = ctx.currentTime - offsetSeconds;

  activeOscillators = [];


  musicTrack.melody.forEach((note) => {
    const noteStartTime = note.time * beatDuration;
    const noteEndTime = (note.time + note.duration) * beatDuration;
    if (noteEndTime > offsetSeconds) {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = musicTrack.synthType || "sine";
      osc.frequency.setValueAtTime(mToF(note.midi), ctx.currentTime);


      noteGain.gain.setValueAtTime(0, ctx.currentTime);

      const delay = Math.max(0, noteStartTime - offsetSeconds);
      const scheduleStart = ctx.currentTime + delay;
      const scheduleEnd = ctx.currentTime + (noteEndTime - offsetSeconds);


      noteGain.gain.setValueAtTime(0, scheduleStart);
      noteGain.gain.linearRampToValueAtTime(
        0.2,
        scheduleStart + Math.min(0.04, (note.duration * beatDuration) / 2),
      );

      noteGain.gain.exponentialRampToValueAtTime(0.001, scheduleEnd);

      osc.connect(noteGain);
      noteGain.connect(globalGainNode);

      osc.start(scheduleStart);
      osc.stop(scheduleEnd);

      activeOscillators.push(osc);
    }
  });


  if (progressIntervalId) clearInterval(progressIntervalId);
  progressIntervalId = setInterval(() => {
    if (!ctx || ctx.state === "closed") return;
    const elapsed = ctx.currentTime - playbackStartCtxTime;

    if (elapsed >= totalDuration) {
      stopMelody();
      if (onFinished) onFinished();
    } else {
      if (onProgress) onProgress(elapsed, totalDuration);
    }
  }, 100);

  stopCallback = () => {
    if (progressIntervalId) {
      clearInterval(progressIntervalId);
      progressIntervalId = null;
    }
    activeOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        console.warn("Oscillator stop failed: ", e);
      }
    });
    activeOscillators = [];
    if (ctx && ctx.state !== "closed") {
      ctx.close();
    }
    ctx = null;
    globalGainNode = null;
    isPlaying = false;
    isPaused = false;
  };

  return stopCallback;
};

export const pauseMelody = () => {
  if (!isPlaying || isPaused || !ctx) return 0;


  const elapsed = ctx.currentTime - playbackStartCtxTime;
  pausedTimeOffset = elapsed;
  isPaused = true;


  activeOscillators.forEach((osc) => {
    try {
      osc.stop();
    } catch (e) {
      console.warn("Oscillator stop failed: ", e);
    }
  });
  activeOscillators = [];

  if (progressIntervalId) {
    clearInterval(progressIntervalId);
    progressIntervalId = null;
  }

  if (ctx && ctx.state !== "closed") {
    ctx.close();
  }
  ctx = null;
  globalGainNode = null;

  return pausedTimeOffset;
};

export const stopMelody = () => {
  if (stopCallback) {
    stopCallback();
    stopCallback = null;
  }
  pausedTimeOffset = 0;
  playbackStartCtxTime = 0;
  activeTrack = null;
};

export const setVolume = (volume) => {
  if (globalGainNode) {
    globalGainNode.gain.setValueAtTime(volume, ctx ? ctx.currentTime : 0);
  }
};

export const changeSynthType = (type) => {
  if (activeTrack) {
    activeTrack.synthType = type;

    if (isPlaying && !isPaused && ctx) {
      const elapsed = ctx.currentTime - playbackStartCtxTime;
      const progressCb = window.__audioProgressCb;
      const finishedCb = window.__audioFinishedCb;
      playMelody(activeTrack, elapsed, progressCb, finishedCb);
    }
  }
};
