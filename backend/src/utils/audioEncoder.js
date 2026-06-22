import { Mp3Encoder } from "@breezystack/lamejs";

// MIDI pitch to frequency
const mToF = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

export const synthesizeToMp3 = (musicTrack) => {
  const sampleRate = 22050;
  const tempo = musicTrack.tempo;
  const beatDuration = 60 / tempo;
  const totalBeats = 16.5;
  const totalDuration = totalBeats * beatDuration;
  const totalSamples = Math.ceil(totalDuration * sampleRate);

  const samples = new Int16Array(totalSamples);
  const synthType = musicTrack.synthType || "sine";

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
      const t = (s - startSample) / sampleRate;
      const angle = 2 * Math.PI * frequency * t;

      let amp = 0;

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
        amp = Math.sin(angle) >= 0 ? 0.8 : -0.8;
      }

      let env = 1;
      const attackTime = 0.04;
      const attackSamples = Math.floor(attackTime * sampleRate);

      if (s - startSample < attackSamples) {
        env = (s - startSample) / attackSamples;
      } else {
        const remainingSamples = endSample - s;
        env = Math.max(0, remainingSamples / durationSamples);
      }

      const sampleVal = Math.floor(amp * env * 8000);

      samples[s] = Math.max(-32768, Math.min(32767, samples[s] + sampleVal));
    }
  });

  const mp3encoder = new Mp3Encoder(1, sampleRate, 96);
  const mp3Chunks = [];
  const sampleBlockSize = 1152;

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
