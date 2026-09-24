# Hanzi100

A mobile-first Mandarin notebook: see a word, hear it, watch its strokes, write it, recall it, and review it when it is due. Includes 100 curated Simplified Chinese words with tone-marked Pinyin, English, and Indonesian meanings.

## Run immediately

Use Node.js 24 LTS (also pinned for production).

```bash
npm install
npm run dev
```

Open http://localhost:3000. No credentials or account are needed. Without Supabase environment variables, the app automatically uses **demo mode**, with real FSRS scheduling and persistent browser storage. The installation script prepares local stroke data, icons, and the SQL vocabulary seed; it does not contact a paid provider.

For a phone on the same Wi-Fi, open `http://YOUR_COMPUTER_LAN_IP:3000`. The dev server listens on all interfaces. Handwriting and progress work on this preview. **PWA installation and service workers require HTTPS** (or localhost), so use a Vercel deployment for installation on your phone.

## How to practice

- Press **Start Learning** on your first visit, then **Start Practice** on future visits.
- The first session introduces 我, 你, 他, 人, 是. Each introduction includes meanings, pronunciation, and replayable stroke order.
- Write each new character ten times: three traces with a fading guide, four copies, then three attempts from memory. Shorter review sets use the same trace → copy → memory progression. Each character starts its own cycle. Stroke order remains available as a hint.
- After recall, compare your original handwriting beside the reference Hanzi before rating it. The drawing is read-only during comparison and remains ephemeral; there is no recognition or automatic grading.
- Forgot / Hard / Good / Easy map to FSRS Again / Hard / Good / Easy. Recall No / Almost / Yes map to Again / Hard / Good.
- Due words go first. Sessions include up to 15 due reviews and up to five new words per local calendar day. When 15 or more reviews are due, the session focuses on reviews. Start another session for the remaining reviews.
- A word is **Learning** after its first rated recall. It is **Strong** when FSRS puts it in Review state with stability of at least seven days. Strong is a useful learning indicator, not a guarantee of permanent recall.
- Browse all words and tap **Practice writing** for manual practice, including words outside the daily plan. Manual practice ends in a rated recall and can introduce a word outside the normal five-word limit.
- Use the close button to pause. Completed reviews, repetitions, and your position in the session persist. In-progress drawings are intentionally ephemeral. Reset count starts that character’s repetition target again; completed attempts remain in statistics.

Guide stages and opacity live in `lib/practice/writing-guide.ts`. Writing targets and limits live in `lib/practice/session.ts`: new 10, learning 5, strong 3. Multi-character words are written character by character, then recalled as a whole word. A repetition means one completed canvas attempt; recall drawings count too.

## Production

- App: https://hanzi100.vercel.app
- Repository: https://github.com/jonassunandar/learn-mandarin
- Supabase project: `hanzi100-production` (`jehaacvimraulsrolaok`), Singapore.
- Sign in with username `admin` and the configured password. Public signup is disabled.
- Vercel production uses only the public project URL, public anon key, and admin email. The service-role key and database password remain in ignored local setup configuration.

To verify the production database with disposable accounts (without touching learner progress):

```bash
node --env-file=.env.local --import tsx scripts/verify-production.ts
```

## Supabase setup

1. Create a Supabase project.
2. In the SQL editor, execute `supabase/migrations/202609190001_initial.sql`.
3. Execute `supabase/seed.sql` to insert all 100 words. The canonical source is `lib/vocabulary/data.ts`; `npm run assets` regenerates the seed and character assets.
4. Copy `.env.example` to `.env.local` and set:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
   NEXT_PUBLIC_ADMIN_EMAIL=admin@hanzi100.local
   ```

5. Create an email/password user in Supabase Authentication → Users with email `admin@hanzi100.local`, password `adminadminadmin`, and email confirmation enabled. The app maps the simple username **admin** to that email. Alternatively, set the server-only `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` and run once:

   ```bash
   node --env-file=.env.local --import tsx scripts/create-admin.ts
   ```

6. Restart the dev server. Open `/auth` (or **Sign in to sync** in the footer), and use **admin / adminadminadmin**.

The shared development password is the requested initial credential. Change it in Supabase before exposing a private account publicly. Never include the service role key in a `NEXT_PUBLIC_` variable or in deployed client code; the browser uses only the publishable/anon key and the authenticated user’s JWT.

No email delivery, signup workflow, or paid service is needed. Supabase handles password verification and sessions; there is no client-side password bypass.

### Persistence and access controls

- `profiles`: an auth-trigger-created user profile.
- `vocabulary`: globally readable vocabulary; clients cannot modify it.
- `user_vocabulary`: the full serialized ts-fsrs card, introduction time, due time, and update time.
- `review_history`: immutable review events and the FSRS review log.
- `handwriting_sessions`: vocabulary, character/word, repetition count, and timestamp. Canvas images are never stored or uploaded.

RLS restricts all private tables to the authenticated user. The `sync_learning` RPC is a single transaction, runs as the caller, and derives the user ID from `auth.uid()`. It never trusts a client-provided user ID. Stable UUIDs make review/writing inserts idempotent. Word cards use the most recent update time to avoid old offline snapshots overwriting newer ones. History reads paginate beyond Supabase’s 1,000-row default.

Progress is saved locally before network work. A cloud sync is attempted on login, review, every 30 seconds while open, when connectivity returns, and when leaving practice with the pause button. Pending work survives closing the browser; reopening retries it. The footer shows pending/synced state. There is no background sync requirement.

Demo data and each signed-in user have separate local namespaces. Signing in starts/resumes that account’s data; it does not silently upload demo activity. Demo mode is available when Supabase environment variables are absent. Configured deployments require sign-in; signing out returns to the sign-in screen. Sync merges concurrent events, but simultaneous offline reviews of the _same word_ on two devices use the latest card snapshot rather than replaying both histories. Avoid studying the same word simultaneously on separate devices. Local browser data should not be cleared before pending work has synced.

## Install and use offline

```bash
npm run build
npm start
```

The production compiler hook generates a versioned service worker cache before Vercel packages public files. The app registers it only in production, avoiding stale development bundles. On an initial online visit it caches the public page shell, all Foundation 1 detail pages, JavaScript/CSS, icons, and all 115 distinct character stroke files. Keep the first online visit open briefly to complete caching. It never caches Supabase requests or authentication responses.

- **Samsung / Android:** open the HTTPS deployment in Chrome or Samsung Internet and choose **Install app** / **Add to Home screen**.
- **iPhone / iPad:** open in Safari → Share → **Add to Home Screen**.
- Reopen from the icon for standalone display.
- Core vocabulary, drawing, reviews, and local statistics work offline after initial caching. Cloud changes wait locally until connectivity returns.
- Pronunciation uses the device’s Mandarin SpeechSynthesis voice. Install a Mandarin voice in system settings if needed; offline speech depends on the device’s installed voices. Speech is not required for the rest of the app.

Canvas input uses Pointer Events, pointer capture, pressure-sensitive pen width, coalesced events, a high-DPI backing canvas, normalized stroke coordinates, and quadratic smoothing. Touch/mouse input gets a constant fallback width. `touch-action: none` is limited to the drawing surface. Interruptions preserve completed and partial strokes; resizing redraws them. Undo removes a stroke; clear removes the current drawing. No drawing is transmitted.

## Deploy to Vercel

1. Push this repository to your Git host and import it into Vercel.
2. Select the Next.js preset. Use `npm install` and `npm run build`, and Node 24.
3. Add the three `NEXT_PUBLIC_` Supabase variables above if cloud sync is desired. Without them, the deployed app works in demo mode.
4. Deploy. Vercel supplies HTTPS, which enables PWA installation.
5. If changing public environment variables, redeploy because Next.js embeds them at build time.

No Vercel-specific database or server is required. Other Node hosts can use `npm run build` followed by `npm start` behind HTTPS.

## Development and validation

```bash
npm run typecheck
npm run lint
npm test
npm run build
# For demo browser tests, start a server with cloud configuration disabled:
# NEXT_PUBLIC_SUPABASE_URL= NEXT_PUBLIC_SUPABASE_ANON_KEY= npm run dev
npx playwright install chromium
npx playwright test
# Offline test against a production server on port 3001:
TEST_OFFLINE=1 TEST_BASE_URL=http://localhost:3001 npx playwright test tests/offline.spec.ts
# Live production UI and offline-to-cloud tests (uses disposable accounts):
TEST_PRODUCTION=1 TEST_BASE_URL=https://hanzi100.vercel.app node --env-file=.env.local node_modules/@playwright/test/cli.js test tests/production.spec.ts
```

Unit tests cover exact vocabulary count, unique entries, tone-marked data, local strokes, daily limits, review priority, FSRS due dates, storage isolation, and merge idempotency. Browser tests cover the learning flow, writing controls, interruption, session resumption, local persistence, multi-character practice, dark mode, and layout overflow at mobile/tablet/desktop sizes. Offline tests verify service-worker control, cached stroke assets, and practice after disconnecting.

Physical S Pen hardware and real Supabase service connectivity require your device and configured project; browser pointer tests do not substitute for that final hardware check. The app’s bundled Mandarin uses lexical Pinyin tones (e.g. 一 yī, 不 bù); natural pronunciation can change in context through tone sandhi. Neutral syllables intentionally have no tone mark. Examples are included where useful, rather than fabricated for every particle.

## Project map

- `app/`: App Router pages, manifest, mobile layout, and theme.
- `components/hanzi/`: canvas, pronunciation control, and Hanzi Writer.
- `components/practice/`: resumable practice state machine.
- `components/LearningProvider.tsx`: shared progress, auth state, and sync lifecycle.
- `lib/fsrs/`: typed FSRS serialization and rating adapter.
- `lib/persistence.ts`: local/cloud storage and merge logic.
- `lib/vocabulary/`: all vocabulary and cumulative milestone definitions.
- `supabase/`: RLS schema migration and generated seed.
- `scripts/`: offline asset preparation and admin provisioning.

Foundation 2 (250 total), 3 (500 total), and 4 (1,000 total) are visible future milestones. Only Foundation 1 is available in this V1.

Hanzi Writer stroke data is bundled from `hanzi-writer-data` and derived from Make Me a Hanzi / Arphic fonts. Its redistribution license is included at `public/hanzi/ARPHICPL.TXT`. Libraries: [Hanzi Writer documentation](https://hanziwriter.org/docs.html), [TS-FSRS documentation](https://open-spaced-repetition.github.io/ts-fsrs/), [Supabase](https://supabase.com/docs), [Next.js](https://nextjs.org/docs).

## Bopomofo (Zhuyin) course

Open **Learn Bopomofo** from Home or Words, or go to `/bopomofo`. Twenty lessons cover all 37 symbols, four tones and neutral tone, syllable blending, Pinyin spelling differences, sound contrasts, connected-speech tone changes, and short independent readings. Intermediate refers to reading the phonetic system, not a general Mandarin proficiency qualification.

Each lesson includes explanations, examples with English and Indonesian meanings, and three checks with feedback. Symbol lessons have official recorded audio, a step-by-step stroke display, and a three-attempt trace/copy/recall notebook with handwriting comparison. Completions save after all three checks are answered correctly. Symbol drawings stay ephemeral and are separate from vocabulary writing statistics.

- Course content: `lib/bopomofo/course.ts`; symbol reference: `lib/bopomofo/symbols.ts`.
- Progress: additive migration `202609240001_bopomofo_progress.sql`, per-user RLS and the `sync_bopomofo` RPC. Apply with `supabase db push` before deploying this version. Existing vocabulary and FSRS data are unchanged. Old local notebooks migrate on read.
- Offline: all course routes, symbol recordings, and stroke shapes are bundled in the PWA cache. Offline completions merge on reconnect. Word/sentence speech still depends on an available device voice.
- Sources and attribution appear in the course and `public/bopomofo/CREDITS.md`. The 37 WAV recordings and stroke paths come from the Taiwan Ministry of Education's CC BY 4.0 materials package; recordings are unchanged, stroke paths are converted to JSON.
- Checks: `npm test`; `TEST_BASE_URL=http://localhost:3002 npx playwright test tests/bopomofo.spec.ts` against a demo-mode server. Production verification uses temporary accounts in `scripts/verify-production.ts` and `tests/production.spec.ts`, including offline course completion and fresh-device sync.
