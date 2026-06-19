import { Mp3Encoder } from '@breezystack/lamejs';

// MIDI pitch to frequency
const mToF = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

/**
 * Synthesizes a MIDI melody track into a 16-bit PCM array and encodes to MP3.
 * Runs completely in-memory in ~50ms per song.
 * @param {object} musicTrack - Melody note data
 * @returns {Buffer} MP3 audio file buffer
 */
export const synthesizeToMp3 = (musicTrack) => {
  const sampleRate = 22050; // 22.05 kHz for fast serverless execution
  const tempo = musicTrack.tempo;
  const beatDuration = 60 / tempo;
  const totalBeats = 16.5; // Final outro beat mark
  const totalDuration = totalBeats * beatDuration;
  const totalSamples = Math.ceil(totalDuration * sampleRate);

  // Create raw PCM sample array (16-bit signed shorts)
  const samples = new Int16Array(totalSamples);
  const synthType = musicTrack.synthType || "sine";

  // Render each note sequentially into the PCM buffer
  musicTrack.melody.forEach((note) => {
    const noteStartTime = note.time * beatDuration;
    const noteEndTime = (note.time + note.duration) * beatDuration;

    const startSample = Math.floor(noteStartTime * sampleRate);
    const endSample = Math.min(
      totalSamples,
      Math.floor(noteEndTime * sampleRate),
    );
    const durationSamples = endSample - startSample;

    const frequency = mToF(note.midi);

    for (let s = startSample; s < endSample; s++) {
      const t = (s - startSample) / sampleRate; // Time in seconds relative to note start
      const angle = 2 * Math.PI * frequency * t;

      let amp = 0;

      // Select synth wave form math
      if (synthType === "sine") {
        amp = Math.sin(angle);
      } else if (synthType === "triangle") {
        const period = 1 / frequency;
        const phase = (t % period) / period;
        amp = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
      } else if (synthType === "sawtooth") {
        const period = 1 / frequency;
        amp = 2 * ((t % period) / period) - 1;
      } else {
        amp = Math.sin(angle) >= 0 ? 0.8 : -0.8; // Square
      }

      // Smooth Envelope (Linear attack & exponential decay approximation)
      let env = 1;
      const attackTime = 0.04;
      const attackSamples = Math.floor(attackTime * sampleRate);

      if (s - startSample < attackSamples) {
        env = (s - startSample) / attackSamples;
      } else {
        const remainingSamples = endSample - s;
        env = Math.max(0, remainingSamples / durationSamples);
      }

      // Multiply amplitude * volume envelope * scale factor (avoid clipping)
      const sampleVal = Math.floor(amp * env * 8000);

      // Sum overlay values to allow chord overlays without clipping
      samples[s] = Math.max(-32768, Math.min(32767, samples[s] + sampleVal));
    }
  });

  // MP3 Encoding via @breezystack/lamejs
  const mp3encoder = new Mp3Encoder(1, sampleRate, 96); // Mono, 22.05kHz, 96kbps bitrate
  const mp3Chunks = [];
  const sampleBlockSize = 1152; // Lame standard chunk block size

  for (let i = 0; i < samples.length; i += sampleBlockSize) {
    const chunk = samples.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(chunk);
    if (mp3buf.length > 0) {
      mp3Chunks.push(Buffer.from(mp3buf));
    }
  }

  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
    mp3Chunks.push(Buffer.from(mp3buf));
  }

  return Buffer.concat(mp3Chunks);
};
