import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import seedrandom from "seedrandom";
import { Faker, en, de } from "@faker-js/faker";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadLocaleDataset = (locale) => {
  try {
    const filePath = path.join(__dirname, `../locales/${locale}.json`);
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, "utf8");
      return JSON.parse(rawData);
    }
  } catch (error) {
    console.error(`Failed to load locale file for ${locale}:`, error);
  }

  const fallbackPath = path.join(__dirname, "../locales/en.json");
  const rawData = fs.readFileSync(fallbackPath, "utf8");
  return JSON.parse(rawData);
};

// Musical Scales
const SCALES = {
  major: [60, 62, 64, 65, 67, 69, 71, 72],
  minor: [57, 59, 60, 62, 64, 65, 67, 69],
};

// Chord Triads
const CHORDS = {
  major: [
    [60, 64, 67],
    [65, 69, 72],
    [67, 71, 74],
    [57, 60, 64],
  ],
  minor: [
    [57, 60, 64],
    [62, 65, 69],
    [64, 67, 71],
    [60, 64, 67],
  ],
};

const calculateLikes = (rng, averageLikes) => {
  const integerPart = Math.floor(averageLikes);
  const fractionalPart = averageLikes - integerPart;
  const extraLike = rng() < fractionalPart ? 1 : 0;
  return integerPart + extraLike;
};

const resolveTemplate = (template, dataset, fakerInstance) => {
  let result = template;
  const maxIterations = 5;
  let iterations = 0;
  while (
    result.includes("{") &&
    result.includes("}") &&
    iterations < maxIterations
  ) {
    iterations++;
    result = result.replace(/\{([a-zA-Z]+)\}/g, (match, key) => {
      const list = dataset[key];
      if (list && list.length > 0) {
        return fakerInstance.helpers.arrayElement(list);
      }
      return match;
    });
  }
  return result;
};

const generateArtistName = (dataset, fakerInstance, rng) => {
  const isBand = rng() < 0.4;
  const template = isBand
    ? fakerInstance.helpers.arrayElement(dataset.bandArtistTemplates)
    : fakerInstance.helpers.arrayElement(dataset.personalArtistTemplates);
  return resolveTemplate(template, dataset, fakerInstance);
};

const generateCoverSvg = (title, artist, photoId, rng) => {
  const imageUrl = `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=300&h=300&q=80`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#0f172a" />
      <image href="${imageUrl}" x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
      <rect x="0" y="0" width="300" height="300" fill="black" opacity="0.45" />
      <rect x="15" y="15" width="270" height="270" fill="none" stroke="white" stroke-width="1" opacity="0.25" />
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" opacity="0.95">
        ${title}
      </text>
      <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" fill="#cbd5e1" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="medium" opacity="0.85">
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

  const tempo = 90 + Math.floor(rng() * 40);
  const synthTypes = ["sine", "triangle", "sawtooth"];
  const synthType = synthTypes[Math.floor(rng() * synthTypes.length)];

  const melody = [];
  const beatsPerBar = 4;
  const totalBars = 4;

  for (let bar = 0; bar < totalBars; bar++) {
    const barStartBeat = bar * beatsPerBar;
    const barChord = chordSet[bar % chordSet.length];

    for (let step = 0; step < 8; step++) {
      const timeInBeat = barStartBeat + step * 0.5;

      if (rng() < 0.6) {
        const chooseChordTone = rng() < 0.8;
        const noteMidi = chooseChordTone
          ? barChord[Math.floor(rng() * barChord.length)]
          : scale[Math.floor(rng() * scale.length)];

        melody.push({
          midi: noteMidi + (rng() < 0.3 ? 12 : 0),
          time: timeInBeat,
          duration: 0.4,
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

const generateLyrics = (dataset, fakerInstance) => {
  const selectedVerse = fakerInstance.helpers.arrayElement(dataset.lyrics);

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

  const dataset = loadLocaleDataset(locale);

  for (let i = 0; i < limit; i++) {
    const absoluteIndex = startIdx + i + 1;

    const metadataSeed = `${globalSeed}_${absoluteIndex}_${locale}`;
    const metaRng = seedrandom(metadataSeed);

    const fakerInstance = new Faker({
      locale: locale === "de" ? [de, en] : [en],
    });

    const numericSeed = Math.abs(metaRng.int32());
    fakerInstance.seed(numericSeed);

    const titleTemplate = fakerInstance.helpers.arrayElement(
      dataset.songTemplates,
    );
    const title = resolveTemplate(titleTemplate, dataset, fakerInstance);

    const artist = generateArtistName(dataset, fakerInstance, metaRng);

    const album =
      metaRng() < 0.3
        ? "Single"
        : resolveTemplate(
            fakerInstance.helpers.arrayElement(dataset.albumTemplates),
            dataset,
            fakerInstance,
          );

    const genre = fakerInstance.helpers.arrayElement(dataset.genres);

    const reviewText = fakerInstance.helpers.arrayElement(dataset.reviews);

    const photoId = fakerInstance.helpers.arrayElement(dataset.unsplashPhotoIds);
    const coverSvg = generateCoverSvg(title, artist, photoId, metaRng);
    const musicTrack = generateMusicTrack(metaRng);

    const lyrics = generateLyrics(dataset, fakerInstance);

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
