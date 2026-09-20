import { db, initDb } from './index';
import { songs, songAliases, songClips, dailyPuzzles, dailyPuzzleItems, users, players, gameSessions } from './schema';
import manifest from '../../public/audio/LICENSE_MANIFEST.json';
import { normalizeText } from '../lib/game/normalizer';

export async function seedDatabase() {
  await initDb();

  // 1. Seed Songs, Clips, and Aliases (Synthetic / CC tracks disabled in favor of verified lyrical hits)
  for (const track of manifest.tracks) {
    // Insert or ignore song with status disabled and hasLyrics 0
    await db
      .insert(songs)
      .values({
        id: track.id,
        canonicalTitle: track.canonical_title,
        primaryArtist: track.primary_artist,
        genre: track.genre,
        subgenre: track.subgenre,
        difficultyTier: track.difficulty_tier,
        status: 'disabled',
        hasLyrics: 0,
        metadataVersion: 1,
      })
      .onConflictDoNothing();

    // Insert or ignore clip
    await db
      .insert(songClips)
      .values({
        id: `clip-${track.id}`,
        songId: track.id,
        audioUrl: track.audio_file,
        startMs: track.editorial_clip.start_ms,
        maxDurationMs: track.editorial_clip.max_duration_ms,
        fairnessScore: Math.round(track.editorial_clip.fairness_rating * 100),
        reviewStatus: 'approved',
      })
      .onConflictDoNothing();

    // Insert canonical aliases
    await db
      .insert(songAliases)
      .values({
        id: `alias-${track.id}-canonical`,
        songId: track.id,
        aliasType: 'title',
        normalizedValue: normalizeText(track.canonical_title),
      })
      .onConflictDoNothing();

    for (let i = 0; i < track.aliases.length; i++) {
      const alias = track.aliases[i];
      await db
        .insert(songAliases)
        .values({
          id: `alias-${track.id}-${i}`,
          songId: track.id,
          aliasType: 'title',
          normalizedValue: normalizeText(alias),
        })
        .onConflictDoNothing();
    }
  }

  // 2. Ensure Daily Puzzle table exists (daily items are dynamically generated from active lyrical hits)
  const todayUtc = new Date().toISOString().split('T')[0];
  const puzzleId = `daily-${todayUtc}`;

  await db
    .insert(dailyPuzzles)
    .values({
      id: puzzleId,
      puzzleDate: todayUtc,
      status: 'approved',
      publishedAt: Date.now(),
    })
    .onConflictDoNothing();

  // 3. Seed some opted-in leaderboard users & sessions for realism
  const sampleUsers = [
    { id: 'user-01', name: 'SoundWavv', score: 98, skips: 0 },
    { id: 'user-02', name: 'AcousticRacer', score: 92, skips: 0 },
    { id: 'user-03', name: 'BeatDrop99', score: 85, skips: 1 },
    { id: 'user-04', name: 'VinylHunter', score: 76, skips: 1 },
    { id: 'user-05', name: 'NeonPulse', score: 68, skips: 2 },
  ];

  for (const u of sampleUsers) {
    const playerId = `player-${u.id}`;
    await db
      .insert(players)
      .values({
        id: playerId,
        kind: 'account',
        userId: u.id,
        createdAt: Date.now() - 3600000,
      })
      .onConflictDoNothing();

    await db
      .insert(users)
      .values({
        id: u.id,
        displayName: u.name,
        leaderboardOptIn: 1,
        createdAt: Date.now() - 3600000,
      })
      .onConflictDoNothing();

    await db
      .insert(gameSessions)
      .values({
        id: `sess-seed-${u.id}-${todayUtc}`,
        playerId,
        mode: 'daily',
        dailyPuzzleId: puzzleId,
        difficultyTier: 'Hard',
        status: 'completed',
        score: u.score,
        skipsCount: u.skips,
        startedAt: Date.now() - 3600000,
        completedAt: Date.now() - 3000000,
      })
      .onConflictDoNothing();
  }

  console.log('✓ Database seeded with songs, clips, aliases, and Daily puzzle!');
}
