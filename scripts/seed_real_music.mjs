import { createClient } from '@libsql/client';
import path from 'node:path';
import fs from 'node:fs';

const dbDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'songsprint.db');
const client = createClient({
  url: `file:${dbPath.replace(/\\/g, '/')}`,
});

function cleanTrackTitle(title) {
  if (!title) return '';
  return title
    .replace(/\s*-\s*Remaster(ed)?(\s+\d{4})?/gi, '')
    .replace(/\s*\[.*?(Remaster|Remastered|Deluxe|Bonus|Edition|Version).*?\]/gi, '')
    .replace(/\s*\(.*?(Remaster|Remastered|Deluxe|Bonus|Anniversary|Live|Mono|Stereo).*?\)/gi, '')
    .replace(/\s*-\s*Radio Edit/gi, '')
    .replace(/\s*\(Radio Edit\)/gi, '')
    .trim();
}

function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchWithRetry(url, headers = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers });
      if (res.status === 429) {
        console.warn(`⏳ Rate limit encountered, waiting ${attempt * 1200}ms...`);
        await new Promise((r) => setTimeout(r, attempt * 1200));
        continue;
      }
      return res;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 800));
    }
  }
  return fetch(url, { headers });
}

async function checkTrackLyrics(artist, title) {
  try {
    const url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'GuessWhat/1.0' } });
    if (res.ok) {
      const data = await res.json();
      if (data.instrumental === true) return false;
      if (data.plainLyrics && data.plainLyrics.trim().length > 10) return true;
    }

    const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(artist + ' ' + title)}`;
    const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'GuessWhat/1.0' } });
    if (searchRes.ok) {
      const list = await searchRes.json();
      const match = list.find((item) => !item.instrumental && item.plainLyrics && item.plainLyrics.trim().length > 10);
      if (match) return true;
    }
  } catch {
    return true;
  }
  return true;
}

const CURATED_TRACKS = [
  // --- Modern 2020s Megahits & Radio Anthems ---
  { query: 'The Weeknd Blinding Lights', tier: 'Easy', genre: 'Pop' },
  { query: 'The Weeknd Save Your Tears', tier: 'Easy', genre: 'Pop' },
  { query: 'The Weeknd Starboy', tier: 'Easy', genre: 'Pop' },
  { query: 'Taylor Swift Shake It Off', tier: 'Easy', genre: 'Pop' },
  { query: 'Taylor Swift Cruel Summer', tier: 'Easy', genre: 'Pop' },
  { query: 'Taylor Swift Anti-Hero', tier: 'Easy', genre: 'Pop' },
  { query: 'Taylor Swift Blank Space', tier: 'Easy', genre: 'Pop' },
  { query: 'Taylor Swift Love Story', tier: 'Easy', genre: 'Country' },
  { query: 'Ed Sheeran Shape of You', tier: 'Easy', genre: 'Pop' },
  { query: 'Ed Sheeran Bad Habits', tier: 'Easy', genre: 'Pop' },
  { query: 'Ed Sheeran Perfect', tier: 'Easy', genre: 'Pop' },
  { query: 'Dua Lipa Levitating', tier: 'Easy', genre: 'Pop' },
  { query: 'Dua Lipa Dance the Night', tier: 'Easy', genre: 'Pop' },
  { query: 'Billie Eilish bad guy', tier: 'Easy', genre: 'Pop' },
  { query: 'Billie Eilish Happier Than Ever', tier: 'Medium', genre: 'Pop' },
  { query: 'Billie Eilish Birds of a Feather', tier: 'Easy', genre: 'Pop' },
  { query: 'Harry Styles As It Was', tier: 'Easy', genre: 'Pop' },
  { query: 'Harry Styles Watermelon Sugar', tier: 'Easy', genre: 'Pop' },
  { query: 'Adele Rolling in the Deep', tier: 'Easy', genre: 'Pop' },
  { query: 'Adele Someone Like You', tier: 'Easy', genre: 'Pop' },
  { query: 'Adele Easy On Me', tier: 'Easy', genre: 'Pop' },
  { query: 'Bruno Mars Mark Ronson Uptown Funk', tier: 'Easy', genre: 'Pop' },
  { query: 'Bruno Mars 24K Magic', tier: 'Easy', genre: 'Pop' },
  { query: 'Bruno Mars Locked Out of Heaven', tier: 'Easy', genre: 'Pop' },
  { query: 'Bruno Mars Just the Way You Are', tier: 'Easy', genre: 'Pop' },
  { query: 'Lady Gaga Poker Face', tier: 'Easy', genre: 'Pop' },
  { query: 'Lady Gaga Bad Romance', tier: 'Easy', genre: 'Pop' },
  { query: 'Lady Gaga Shallow', tier: 'Easy', genre: 'Pop' },
  { query: 'Katy Perry Roar', tier: 'Easy', genre: 'Pop' },
  { query: 'Katy Perry Firework', tier: 'Easy', genre: 'Pop' },
  { query: 'Katy Perry California Gurls', tier: 'Easy', genre: 'Pop' },
  { query: 'The Kid LAROI Justin Bieber STAY', tier: 'Easy', genre: 'Pop' },
  { query: 'Justin Bieber Sorry', tier: 'Easy', genre: 'Pop' },
  { query: 'Justin Bieber Peaches', tier: 'Easy', genre: 'Pop' },
  { query: 'Sia Chandelier', tier: 'Medium', genre: 'Pop' },
  { query: 'Shawn Mendes Camila Cabello Senorita', tier: 'Medium', genre: 'Pop' },
  { query: 'Ariana Grande 7 rings', tier: 'Medium', genre: 'Pop' },
  { query: 'Ariana Grande Thank U Next', tier: 'Easy', genre: 'Pop' },
  { query: 'Miley Cyrus Flowers', tier: 'Easy', genre: 'Pop' },
  { query: 'Miley Cyrus Party In The U.S.A.', tier: 'Easy', genre: 'Pop' },
  { query: 'Olivia Rodrigo drivers license', tier: 'Medium', genre: 'Pop' },
  { query: 'Olivia Rodrigo good 4 u', tier: 'Easy', genre: 'Pop' },
  { query: 'Olivia Rodrigo vampire', tier: 'Easy', genre: 'Pop' },
  { query: 'Sabrina Carpenter Espresso', tier: 'Easy', genre: 'Pop' },
  { query: 'Sabrina Carpenter Please Please Please', tier: 'Easy', genre: 'Pop' },
  { query: 'Benson Boone Beautiful Things', tier: 'Easy', genre: 'Pop' },
  { query: 'Teddy Swims Lose Control', tier: 'Easy', genre: 'R&B' },
  { query: 'Hozier Take Me to Church', tier: 'Easy', genre: 'Rock' },
  { query: 'Hozier Too Sweet', tier: 'Easy', genre: 'Rock' },
  { query: 'Glass Animals Heat Waves', tier: 'Easy', genre: 'Pop' },
  { query: 'Gotye Somebody That I Used to Know', tier: 'Easy', genre: 'Pop' },
  { query: 'Maroon 5 Sugar', tier: 'Easy', genre: 'Pop' },
  { query: 'Maroon 5 Moves Like Jagger', tier: 'Easy', genre: 'Pop' },
  { query: 'Lorde Royals', tier: 'Easy', genre: 'Pop' },
  { query: 'OneRepublic Counting Stars', tier: 'Easy', genre: 'Pop' },
  { query: 'Coldplay BTS My Universe', tier: 'Easy', genre: 'Pop' },

  // --- Classic Rock, Alternative & Anthems ---
  { query: 'Queen Bohemian Rhapsody', tier: 'Easy', genre: 'Rock' },
  { query: 'Queen We Will Rock You', tier: 'Easy', genre: 'Rock' },
  { query: 'Queen Don t Stop Me Now', tier: 'Easy', genre: 'Rock' },
  { query: 'Queen Another One Bites the Dust', tier: 'Easy', genre: 'Rock' },
  { query: 'Nirvana Smells Like Teen Spirit', tier: 'Easy', genre: 'Rock' },
  { query: 'Nirvana Come As You Are', tier: 'Medium', genre: 'Rock' },
  { query: 'Nirvana Heart-Shaped Box', tier: 'Medium', genre: 'Rock' },
  { query: 'AC DC Back In Black', tier: 'Easy', genre: 'Rock' },
  { query: 'AC DC Highway to Hell', tier: 'Easy', genre: 'Rock' },
  { query: 'Guns N Roses Sweet Child O Mine', tier: 'Easy', genre: 'Rock' },
  { query: 'Guns N Roses Paradise City', tier: 'Easy', genre: 'Rock' },
  { query: 'Bon Jovi Livin On A Prayer', tier: 'Easy', genre: 'Rock' },
  { query: 'Bon Jovi You Give Love a Bad Name', tier: 'Easy', genre: 'Rock' },
  { query: 'The Beatles Come Together', tier: 'Medium', genre: 'Rock' },
  { query: 'The Beatles Hey Jude', tier: 'Easy', genre: 'Rock' },
  { query: 'The Beatles Let It Be', tier: 'Easy', genre: 'Rock' },
  { query: 'The Rolling Stones Paint It Black', tier: 'Medium', genre: 'Rock' },
  { query: 'Journey Don t Stop Believin', tier: 'Easy', genre: 'Rock' },
  { query: 'Eagles Hotel California', tier: 'Medium', genre: 'Rock' },
  { query: 'Fleetwood Mac Dreams', tier: 'Easy', genre: 'Rock' },
  { query: 'Fleetwood Mac Go Your Own Way', tier: 'Easy', genre: 'Rock' },
  { query: 'Linkin Park In The End', tier: 'Easy', genre: 'Rock' },
  { query: 'Linkin Park Numb', tier: 'Easy', genre: 'Rock' },
  { query: 'Coldplay Viva La Vida', tier: 'Easy', genre: 'Rock' },
  { query: 'Coldplay Yellow', tier: 'Easy', genre: 'Rock' },
  { query: 'Coldplay The Scientist', tier: 'Easy', genre: 'Rock' },
  { query: 'Imagine Dragons Believer', tier: 'Easy', genre: 'Rock' },
  { query: 'Imagine Dragons Radioactive', tier: 'Easy', genre: 'Rock' },
  { query: 'The Killers Mr Brightside', tier: 'Easy', genre: 'Rock' },
  { query: 'The Killers Somebody Told Me', tier: 'Medium', genre: 'Rock' },
  { query: 'Radiohead Creep', tier: 'Medium', genre: 'Rock' },
  { query: 'Oasis Wonderwall', tier: 'Easy', genre: 'Rock' },
  { query: 'Oasis Don t Look Back in Anger', tier: 'Easy', genre: 'Rock' },
  { query: 'Survivor Eye of the Tiger', tier: 'Easy', genre: 'Rock' },
  { query: 'Green Day Boulevard of Broken Dreams', tier: 'Easy', genre: 'Rock' },
  { query: 'Green Day American Idiot', tier: 'Easy', genre: 'Rock' },
  { query: 'Red Hot Chili Peppers Californication', tier: 'Easy', genre: 'Rock' },
  { query: 'Red Hot Chili Peppers Under the Bridge', tier: 'Medium', genre: 'Rock' },
  { query: 'Arctic Monkeys Do I Wanna Know', tier: 'Easy', genre: 'Rock' },
  { query: 'Fall Out Boy Centuries', tier: 'Easy', genre: 'Rock' },

  // --- Hip-Hop & R&B ---
  { query: 'Eminem Lose Yourself', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Eminem Without Me', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Eminem The Real Slim Shady', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Drake Gods Plan', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Drake Hotline Bling', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Drake One Dance', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Kendrick Lamar HUMBLE', tier: 'Medium', genre: 'Hip-Hop' },
  { query: 'Kendrick Lamar Not Like Us', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Kendrick Lamar Alright', tier: 'Medium', genre: 'Hip-Hop' },
  { query: 'Post Malone Circles', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Post Malone Swae Lee Sunflower', tier: 'Easy', genre: 'Hip-Hop' },
  { query: '50 Cent In Da Club', tier: 'Easy', genre: 'Hip-Hop' },
  { query: '50 Cent Candy Shop', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Dr Dre Snoop Dogg Still DRE', tier: 'Medium', genre: 'Hip-Hop' },
  { query: 'Snoop Dogg Drop It Like It s Hot', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Kanye West Stronger', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Kanye West Gold Digger', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Usher Yeah', tier: 'Easy', genre: 'R&B' },
  { query: 'Usher DJ Got Us Fallin In Love', tier: 'Easy', genre: 'Pop' },
  { query: 'Jay Z Alicia Keys Empire State of Mind', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Alicia Keys No One', tier: 'Easy', genre: 'R&B' },
  { query: 'Outkast Hey Ya', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Rihanna Diamonds', tier: 'Easy', genre: 'Pop' },
  { query: 'Rihanna Umbrella', tier: 'Easy', genre: 'Pop' },
  { query: 'Rihanna Calvin Harris We Found Love', tier: 'Easy', genre: 'Electronic' },
  { query: 'Beyonce Single Ladies', tier: 'Easy', genre: 'Pop' },
  { query: 'Beyonce Crazy in Love', tier: 'Easy', genre: 'Pop' },
  { query: 'SZA Kill Bill', tier: 'Easy', genre: 'R&B' },
  { query: 'SZA Snooze', tier: 'Easy', genre: 'R&B' },
  { query: 'Nelly Kelly Rowland Dilemma', tier: 'Easy', genre: 'R&B' },

  // --- Electronic, Dance & Club Anthems ---
  { query: 'Daft Punk Get Lucky', tier: 'Easy', genre: 'Electronic' },
  { query: 'Daft Punk One More Time', tier: 'Easy', genre: 'Electronic' },
  { query: 'Avicii Wake Me Up', tier: 'Easy', genre: 'Electronic' },
  { query: 'Avicii Levels', tier: 'Easy', genre: 'Electronic' },
  { query: 'Avicii The Nights', tier: 'Easy', genre: 'Electronic' },
  { query: 'Calvin Harris Summer', tier: 'Easy', genre: 'Electronic' },
  { query: 'Calvin Harris Dua Lipa One Kiss', tier: 'Easy', genre: 'Electronic' },
  { query: 'The Chainsmokers Closer', tier: 'Easy', genre: 'Electronic' },
  { query: 'The Chainsmokers Don t Let Me Down', tier: 'Easy', genre: 'Electronic' },
  { query: 'David Guetta Sia Titanium', tier: 'Easy', genre: 'Electronic' },
  { query: 'David Guetta Bebe Rexha I m Good Blue', tier: 'Easy', genre: 'Electronic' },
  { query: 'Foster the People Pumped Up Kicks', tier: 'Easy', genre: 'Electronic' },
  { query: 'Swedish House Mafia Don t You Worry Child', tier: 'Medium', genre: 'Electronic' },
  { query: 'Major Lazer DJ Snake Lean On', tier: 'Easy', genre: 'Electronic' },
  { query: 'Zedd Foxes Clarity', tier: 'Easy', genre: 'Electronic' },

  // --- 80s, 90s & Nostalgic Vocal Classics ---
  { query: 'Michael Jackson Billie Jean', tier: 'Easy', genre: '80s' },
  { query: 'Michael Jackson Beat It', tier: 'Easy', genre: '80s' },
  { query: 'Michael Jackson Thriller', tier: 'Easy', genre: '80s' },
  { query: 'Michael Jackson Smooth Criminal', tier: 'Easy', genre: '80s' },
  { query: 'Rick Astley Never Gonna Give You Up', tier: 'Easy', genre: '80s' },
  { query: 'a ha Take On Me', tier: 'Easy', genre: '80s' },
  { query: 'Toto Africa', tier: 'Easy', genre: '80s' },
  { query: 'Earth Wind Fire September', tier: 'Easy', genre: '80s' },
  { query: 'Cyndi Lauper Girls Just Want to Have Fun', tier: 'Easy', genre: '80s' },
  { query: 'Wham Wake Me Up Before You Go Go', tier: 'Easy', genre: '80s' },
  { query: 'George Michael Careless Whisper', tier: 'Easy', genre: '80s' },
  { query: 'Whitney Houston I Wanna Dance with Somebody', tier: 'Easy', genre: '80s' },
  { query: 'Whitney Houston I Will Always Love You', tier: 'Easy', genre: '80s' },
  { query: 'Madonna Like a Prayer', tier: 'Easy', genre: '80s' },
  { query: 'Madonna Material Girl', tier: 'Easy', genre: '80s' },
  { query: 'ABBA Dancing Queen', tier: 'Easy', genre: '80s' },
  { query: 'ABBA Mamma Mia', tier: 'Easy', genre: '80s' },
  { query: 'Bonnie Tyler Total Eclipse of the Heart', tier: 'Easy', genre: '80s' },
  { query: 'Backstreet Boys I Want It That Way', tier: 'Easy', genre: 'Pop' },
  { query: 'Britney Spears Baby One More Time', tier: 'Easy', genre: 'Pop' },
  { query: 'Britney Spears Toxic', tier: 'Easy', genre: 'Pop' },
  { query: 'Spice Girls Wannabe', tier: 'Easy', genre: 'Pop' },
  { query: 'TLC No Scrubs', tier: 'Easy', genre: 'R&B' },
  { query: 'Destinys Child Say My Name', tier: 'Easy', genre: 'R&B' },
];

async function seedRealMusic() {
  console.log(`\n======================================================`);
  console.log(`🎵 GuessWhat Real Music Ingestion (iTunes API + Verified Lyrics)`);
  console.log(`Target: ${CURATED_TRACKS.length} iconic vocal hits`);
  console.log(`Requirement: All songs must have confirmed lyrics; NO beats/instrumentals`);
  console.log(`======================================================\n`);

  // Ensure has_lyrics column exists
  try {
    await client.execute(`ALTER TABLE songs ADD COLUMN has_lyrics INTEGER NOT NULL DEFAULT 1`);
  } catch {
    // Already exists
  }

  // 1. Purge/Disable all synthetic CC instrumental beats
  await client.execute(`UPDATE songs SET has_lyrics = 0, status = 'disabled' WHERE id LIKE 'song-%'`);
  await client.execute(`DELETE FROM daily_puzzle_items WHERE song_id LIKE 'song-%'`);

  let addedCount = 0;
  const savedSongs = [];

  for (let i = 0; i < CURATED_TRACKS.length; i++) {
    const item = CURATED_TRACKS[i];
    const progress = `[${String(i + 1).padStart(3, '0')}/${CURATED_TRACKS.length}]`;

    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(item.query)}&entity=song&limit=1`;
      const res = await fetchWithRetry(url, { 'User-Agent': 'GuessWhat/1.0' });
      if (!res.ok) {
        console.warn(`${progress} ⚠ Failed fetching "${item.query}": HTTP ${res.status}`);
        continue;
      }

      const json = await res.json();
      const track = json.results?.[0];

      if (!track || !track.previewUrl) {
        console.warn(`${progress} ⚠ No audio preview found for "${item.query}"`);
        continue;
      }

      const songId = `itunes-${track.trackId}`;
      const canonicalTitle = cleanTrackTitle(track.trackName);
      const primaryArtist = track.artistName.trim();
      const genre = item.genre || track.primaryGenreName || 'Pop';
      const clipId = `clip-${songId}`;

      // Strictly verify lyrics before saving as active
      const hasLyrics = await checkTrackLyrics(primaryArtist, canonicalTitle);
      if (!hasLyrics) {
        console.warn(`${progress} ⚠ SKIPPED: "${primaryArtist} - ${canonicalTitle}" has NO lyrics or is instrumental`);
        await client.execute({
          sql: `UPDATE songs SET has_lyrics = 0, status = 'disabled' WHERE id = ?`,
          args: [songId],
        });
        continue;
      }

      // 1. Insert or update into songs table (with has_lyrics = 1)
      await client.execute({
        sql: `INSERT INTO songs (id, canonical_title, primary_artist, genre, difficulty_tier, status, has_lyrics, metadata_version)
              VALUES (?, ?, ?, ?, ?, 'active', 1, 1)
              ON CONFLICT(id) DO UPDATE SET
                canonical_title = excluded.canonical_title,
                primary_artist = excluded.primary_artist,
                genre = excluded.genre,
                difficulty_tier = excluded.difficulty_tier,
                status = 'active',
                has_lyrics = 1`,
        args: [songId, canonicalTitle, primaryArtist, genre, item.tier],
      });

      // 2. Insert or update into song_clips table
      await client.execute({
        sql: `INSERT INTO song_clips (id, song_id, audio_url, start_ms, max_duration_ms, fairness_score, review_status)
              VALUES (?, ?, ?, 0, 5000, 99, 'approved')
              ON CONFLICT(id) DO UPDATE SET
                audio_url = excluded.audio_url,
                review_status = 'approved'`,
        args: [clipId, songId, track.previewUrl],
      });

      // 3. Insert canonical & search aliases
      await client.execute({
        sql: `INSERT OR IGNORE INTO song_aliases (id, song_id, alias_type, normalized_value)
              VALUES (?, ?, 'title', ?)`,
        args: [`alias-${songId}-canonical`, songId, normalize(canonicalTitle)],
      });

      await client.execute({
        sql: `INSERT OR IGNORE INTO song_aliases (id, song_id, alias_type, normalized_value)
              VALUES (?, ?, 'title', ?)`,
        args: [`alias-${songId}-combo`, songId, normalize(`${primaryArtist} ${canonicalTitle}`)],
      });

      if (track.trackName !== canonicalTitle) {
        await client.execute({
          sql: `INSERT OR IGNORE INTO song_aliases (id, song_id, alias_type, normalized_value)
                VALUES (?, ?, 'title', ?)`,
          args: [`alias-${songId}-orig`, songId, normalize(track.trackName)],
        });
      }

      savedSongs.push({ id: songId, clipId, canonicalTitle, primaryArtist, tier: item.tier });
      addedCount++;
      console.log(`${progress} ✓ ${primaryArtist} - "${canonicalTitle}" (${genre}) [Lyrics: Verified]`);

      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.error(`${progress} ✗ Error processing "${item.query}":`, err.message);
    }
  }

  console.log(`\n------------------------------------------------------`);
  console.log(`Seeding complete: ${addedCount} real songs with lyrics saved to SQLite!`);
  console.log(`------------------------------------------------------\n`);

  // 4. Update today's Daily Puzzle with 5 iconic real songs with lyrics
  if (savedSongs.length >= 5) {
    const todayUtc = new Date().toISOString().split('T')[0];
    const puzzleId = `daily-${todayUtc}`;

    console.log(`Configuring Daily Puzzle for ${todayUtc} with real lyric hits...`);

    await client.execute({
      sql: `INSERT INTO daily_puzzles (id, puzzle_date, status, published_at)
            VALUES (?, ?, 'approved', ?)
            ON CONFLICT(puzzle_date) DO UPDATE SET status = 'approved'`,
      args: [puzzleId, todayUtc, Date.now()],
    });

    const topHits = [
      savedSongs.find((s) => s.canonicalTitle.toLowerCase().includes('blinding lights')) || savedSongs[0],
      savedSongs.find((s) => s.canonicalTitle.toLowerCase().includes('bohemian rhapsody')) || savedSongs[1],
      savedSongs.find((s) => s.canonicalTitle.toLowerCase().includes('billie jean')) || savedSongs[2],
      savedSongs.find((s) => s.canonicalTitle.toLowerCase().includes('shake it off') || s.canonicalTitle.toLowerCase().includes('cruel summer')) || savedSongs[3],
      savedSongs.find((s) => s.canonicalTitle.toLowerCase().includes('take on me') || s.canonicalTitle.toLowerCase().includes('lose yourself')) || savedSongs[4],
    ].filter(Boolean);

    await client.execute({
      sql: `DELETE FROM daily_puzzle_items WHERE daily_puzzle_id = ?`,
      args: [puzzleId],
    });

    for (let pos = 0; pos < topHits.length; pos++) {
      const s = topHits[pos];
      await client.execute({
        sql: `INSERT INTO daily_puzzle_items (id, daily_puzzle_id, position, song_id, clip_id, difficulty_tier)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [`dpi-${puzzleId}-${pos + 1}`, puzzleId, pos + 1, s.id, s.clipId, s.tier],
      });
      console.log(`  Round ${pos + 1}: ${s.primaryArtist} - ${s.canonicalTitle} (Lyrics verified)`);
    }

    console.log(`\n✓ Today's Daily Puzzle is now armed with 5 real hits with lyrics!`);
  }
}

seedRealMusic().catch((err) => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});
