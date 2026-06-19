let activeAudioContext = null;
let stopCallback = null;

export const playMelody = (musicTrack, onFinished) => {
  // Stop any currently playing audio track
  stopMelody();

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    alert("Web Audio API is not supported in this browser.");
    return;
  }

  const ctx = new AudioContextClass();
  activeAudioContext = ctx;

  const tempo = musicTrack.tempo;
  const beatDuration = 60 / tempo; // Duration of one beat in seconds
  const synthType = musicTrack.synthType || "sine";

  let maxTime = 0;

  // Schedule each note on the AudioContext timeline
  musicTrack.melody.forEach((note) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = synthType;

    // MIDI pitch to frequency formula: f = 440 * 2^((d-69)/12)
    const frequency = 440 * Math.pow(2, (note.midi - 69) / 12);
    osc.frequency.setValueAtTime(
      frequency,
      ctx.currentTime + note.time * beatDuration,
    );

    // Apply ADS (Attack-Decay-Sustain) Volume Envelope to prevent popping sounds
    gainNode.gain.setValueAtTime(0, ctx.currentTime + note.time * beatDuration);
    gainNode.gain.linearRampToValueAtTime(
      0.15,
      ctx.currentTime + note.time * beatDuration + 0.04,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + (note.time + note.duration) * beatDuration,
    );

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Schedule start and stop on the hardware timer
    osc.start(ctx.currentTime + note.time * beatDuration);
    osc.stop(ctx.currentTime + (note.time + note.duration) * beatDuration);

    const noteEndTime = note.time + note.duration;
    if (noteEndTime > maxTime) {
      maxTime = noteEndTime;
    }
  });

  // Automatically clean up context and fire callback when song ends
  const timeoutId = setTimeout(
    () => {
      stopMelody();
      onFinished();
    },
    maxTime * beatDuration * 1000,
  );

  stopCallback = () => {
    clearTimeout(timeoutId);
    if (ctx.state !== "closed") {
      ctx.close();
    }
  };

  return stopCallback;
};

/**
 * Stops any playing synth audio.
 */
export const stopMelody = () => {
  if (stopCallback) {
    stopCallback();
    stopCallback = null;
    activeAudioContext = null;
  }
};
