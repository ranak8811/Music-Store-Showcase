import seedrandom from "seedrandom";
import { Faker, en, de } from "@faker-js/faker";

// Review Template Data
const REVIEW_TEMPLATES = {
  en: [
    "A brilliant fusion of modern synths and melodic storytelling.",
    "This track offers an ethereal listening experience that stays with you.",
    "A masterclass in music composition. The chord progression is absolutely stellar.",
    "Perfect for late-night drives or ambient background work. Highly recommended!",
    "An impressive production with rich textures and a catchy rhythm structure.",
  ],
  de: [
    "Eine geniale Verschmelzung von modernen Synths und melodischer Erzählung.",
    "Dieser Track bietet ein ätherisches Hörerlebnis, das im Gedächtnis bleibt.",
    "Eine Meisterklasse der Musikkomposition. Die Akkordfolge ist absolut hervorragend.",
    "Perfekt für nächtliche Fahrten oder entspanntes Arbeiten. Sehr zu empfehlen!",
    "Eine beeindruckende Produktion mit satten Texturen und einer eingängigen Rhythmusstruktur.",
  ],
};

// Lyrics Template Data
const LYRICS_TEMPLATES = {
  en: {
    verses: [
      [
        "Walking down the digital line",
        "Frequencies are aligned in time",
        "A sound that makes you feel alive",
        "We generate until the dawn",
      ],
      [
        "Rhythms beating in my head",
        "Synthesizers glowing bright",
        "No database, just memory",
        "Deterministic beat goes on",
      ],
      [
        "Coded nights and electronic dreams",
        "Searching for the perfect seed",
        "Melodies floating in the air",
        "Echoes of the sound we share",
      ],
    ],
  },
  de: {
    verses: [
      [
        "Ich gehe den digitalen Weg",
        "Frequenzen sind zeitlich abgestimmt",
        "Ein Sound, der dich lebendig fühlen lässt",
        "Wir generieren bis zum Morgengrauen",
      ],
      [
        "Rhythmen schlagen in meinem Kopf",
        "Synthesizer leuchten hell",
        "Keine Datenbank, nur Speicher",
        "Der deterministische Takt geht weiter",
      ],
      [
        "Codierte Nächte und elektronische Träume",
        "Auf der Suche nach dem perfekten Samen",
        "Melodien schweben in der Luft",
        "Echostimmen des Klangs, den wir teilen",
      ],
    ],
  },
};

// Musical Scale Configuration (Pitches in MIDI values)
const SCALES = {
  major: [60, 62, 64, 65, 67, 69, 71, 72], // C Major
  minor: [57, 59, 60, 62, 64, 65, 67, 69], // A Minor
};

// Chords corresponding to Scale positions (Triads)
const CHORDS = {
  major: [
    [60, 64, 67], // C Major (I)
    [65, 69, 72], // F Major (IV)
    [67, 71, 74], // G Major (V)
    [57, 60, 64], // A Minor (vi)
  ],
  minor: [
    [57, 60, 64], // A Minor (i)
    [62, 65, 69], // D Minor (iv)
    [64, 67, 71], // E Minor (v)
    [60, 64, 67], // C Major (III)
  ],
};

const calculateLikes = (rng, averageLikes) => {
  const integerPart = Math.floor(averageLikes);
  const fractionalPart = averageLikes - integerPart;

  const extraLike = rng() < fractionalPart ? 1 : 0;

  return integerPart + extraLike;
};

const generateArtistName = (faker, rng) => {
  const isBand = rng() < 0.4;

  if (isBand) {
    const prefix = faker.company.buzzAdjective();
    const noun = faker.company.buzzNoun();

    return `The ${prefix.charAt(0).toUpperCase() + prefix.slice(1)} ${noun.charAt(0).toUpperCase() + noun.slice(1)}s`;
  }

  return faker.person.fullName();
};

const generateCoverSvg = (title, artist, rng) => {
  const hue1 = Math.floor(rng() * 360);
  const hue2 = (hue1 + 120 + Math.floor(rng() * 120)) % 360;
  const color1 = `hsl(${hue1}, 70%, 25%)`;
  const color2 = `hsl(${hue2}, 70%, 12%)`;

  const patternType = Math.floor(rng() * 3);
  let shapes = "";
  if (patternType === 0) {
    for (let i = 0; i < 5; i++) {
      const cx = Math.floor(rng() * 300);
      const cy = Math.floor(rng() * 300);
      const r = 30 + Math.floor(rng() * 80);
      shapes += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="white" opacity="0.05" />`;
    }
  } else if (patternType === 1) {
    for (let i = 0; i < 8; i++) {
      const x1 = Math.floor(rng() * 300);
      const y1 = Math.floor(rng() * 300);
      const x2 = Math.floor(rng() * 300);
      const y2 = Math.floor(rng() * 300);
      shapes += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="white" stroke-width="2" opacity="0.06" />`;
    }
  } else {
    for (let i = 0; i < 4; i++) {
      const x = Math.floor(rng() * 200);
      const y = Math.floor(rng() * 200);
      const w = 40 + Math.floor(rng() * 100);
      const h = 40 + Math.floor(rng() * 100);
      shapes += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="white" opacity="0.04" />`;
    }
  }

  const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, "");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
      <defs>
        <linearGradient id="grad-${cleanTitle}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad-${cleanTitle})" />
      ${shapes}
      <rect x="15" y="15" width="270" height="270" fill="none" stroke="white" stroke-width="1" opacity="0.15" />
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" opacity="0.9">
        ${title}
      </text>
      <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" fill="#cbd5e1" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="medium" opacity="0.75">
        ${artist}
      </text>
    </svg>
  `.trim();
};

const generateMusicTrack = (rng) => {
  const isMajor = rng() < 0.5;
  const scaleType = isMajor ? "major" : "minor";
  const scale = SCALES[scaleType];
  const chordSet = CHORDS[scaleType];

  const tempo = 90 + Math.floor(rng() * 40); // 90 to 130 BPM
  const synthTypes = ["sine", "triangle", "sawtooth"];
  const synthType = synthTypes[Math.floor(rng() * synthTypes.length)];

  const melody = [];
  const beatsPerBar = 4;
  const totalBars = 4;
  const totalBeats = beatsPerBar * totalBars;

  // Generate melody notes fitting the chord structure of each bar
  for (let bar = 0; bar < totalBars; bar++) {
    const barStartBeat = bar * beatsPerBar;
    const barChord = chordSet[bar % chordSet.length]; // chord progression

    // Generate up to 8 eighth notes per bar (half beat each)
    for (let step = 0; step < 8; step++) {
      const timeInBeat = barStartBeat + step * 0.5;

      // 60% chance to play a note at this step
      if (rng() < 0.6) {
        // Choose note from current chord (80% chance) or scale (20% chance)
        const chooseChordTone = rng() < 0.8;
        const noteMidi = chooseChordTone
          ? barChord[Math.floor(rng() * barChord.length)]
          : scale[Math.floor(rng() * scale.length)];

        melody.push({
          midi: noteMidi + (rng() < 0.3 ? 12 : 0), // Occasional octave jump
          time: timeInBeat,
          duration: 0.4, // slightly shorter than 0.5 beat for staccato feel
        });
      }
    }
  }

  return {
    tempo,
    synthType,
    melody,
  };
};

const generateLyrics = (locale, rng) => {
  const templates = LYRICS_TEMPLATES[locale] || LYRICS_TEMPLATES.en;
  const verseIndex = Math.floor(rng() * templates.verses.length);
  const selectedVerse = templates.verses[verseIndex];

  // Map each line of the verse to a specific beat time (4 beats per bar)
  // bar 0 = beat 0, bar 1 = beat 4, bar 2 = beat 8, bar 3 = beat 12
  return [
    {
      time: 0,
      text: `🎵 [Intro - Synth ${selectedVerse[0].split(" ")[0]}...]`,
    },
    { time: 2, text: selectedVerse[0] },
    { time: 6, text: selectedVerse[1] },
    { time: 10, text: selectedVerse[2] },
    { time: 14, text: selectedVerse[3] },
    { time: 16.5, text: "🎵 [Outro]" },
  ];
};

export const generateSongsPage = (
  globalSeed,
  page,
  locale,
  likesAverage,
  limit = 20,
) => {
  const songs = [];
  const startIdx = (page - 1) * limit;

  for (let i = 0; i < limit; i++) {
    const absoluteIndex = startIdx + i + 1;

    const metadataSeed = `${globalSeed}_${absoluteIndex}_${locale}`;
    const metaRng = seedrandom(metadataSeed);

    const fakerInstance = new Faker({
      locale: locale === "de" ? [de, en] : [en],
    });

    const numericSeed = Math.abs(metaRng.int32());

    fakerInstance.seed(numericSeed);

    const title = fakerInstance.music.songName();
    const artist = generateArtistName(fakerInstance, metaRng);

    const album = metaRng() < 0.3 ? "Single" : fakerInstance.music.album();
    const genre = fakerInstance.music.genre();

    const reviews = REVIEW_TEMPLATES[locale] || REVIEW_TEMPLATES.en;
    const reviewText = reviews[Math.floor(metaRng() * reviews.length)];

    const coverSvg = generateCoverSvg(title, artist, metaRng);

    const musicTrack = generateMusicTrack(metaRng);

    const lyrics = generateLyrics(locale, metaRng);

    const likesSeed = `${globalSeed}_${absoluteIndex}_likes`;
    const likesRng = seedrandom(likesSeed);
    const likes = calculateLikes(likesRng, likesAverage);

    songs.push({
      index: absoluteIndex,
      title,
      artist,
      album,
      genre,
      reviewText,
      coverSvg,
      musicTrack,
      lyrics,
      likes,
    });
  }

  return songs;
};
