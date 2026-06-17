import seedrandom from "seedrandom";
import { Faker, en, de } from "@faker-js/faker";

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

    const likesSeed = `${globalSeed}_${absoluteIndex}_likes`;
    const likesRng = seedrandom(likesSeed);
    const likes = calculateLikes(likesRng, likesAverage);

    songs.push({
      index: absoluteIndex,
      title,
      artist,
      album,
      genre,
      likes,
    });
  }

  return songs;
};
