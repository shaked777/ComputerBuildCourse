# Assembly Quest 🧠⚡

A Brilliant.org-style interactive study app for **מבנה מחשבים ושפת סף (Afeka 10145)**.
Built around the 250-question bank in `computer_organization_brilliant_bank.json`.

Fully **RTL (Hebrew)**, with a winding learning path, bite-sized quiz sessions, hearts,
immediate explanations, XP and a "Practice Weaknesses" review mode.

## Headline features
- **Profile** — editable username (defaults to `שחקן 1`), persisted. (`Header.tsx`)
- **Crown · דילוג שלבים** — premium modal to jump to / unlock any chapter. (`CrownModal.tsx`)
- **Global leaderboard** — 4 mock AI players + you, ranked live by XP. (`Leaderboard.tsx`, `data/leaderboard.ts`)
- **Two clearly-themed modes** — Path (3 hearts, banner `מצב מסלול`) and Survival
  (`מצב הישרדות`: **2-minute timer, no hearts**, +3s per correct, timer pauses on a wrong
  answer while the explanation shows, streak tracker, all-time high score).
- **Per-chapter ambient themes** — blueprint / binary-rain / circuit / terminal /
  datapath / pipeline backgrounds. (`ChapterBackground.tsx`, `theme` in `data/modules.ts`)
- **Adaptive question renderers** — a parser (`lib/classify.ts`) turns questions into
  multiple-choice, **fill-in-the-blank** (auto-detected value answers), **tap-to-arrange**,
  or **matching pairs**. (`components/renderers/*`)
- **Polish** — glassmorphism HUD/modals, Web-Audio cues (`lib/sound.ts`, mute toggle),
  tuned Framer Motion, mobile-first responsive. Everything persists to `localStorage`.
- **Exam simulation (מבחן מתכונת)** — 15 questions stratified across all chapters, 20-minute
  countdown, question navigator, no feedback until submit; graded with per-chapter breakdown
  and a wrong-answer review that feeds the weakness bucket. (`ExamSession.tsx`, `buildExam`)
- **Learning engine ("backend")** — Leitner **spaced repetition** per question (`lib/srs.ts`)
  drives session ordering; per-day activity log + **study streaks** (`lib/stats.ts`);
  **XP → levels** (`lib/level.ts`); rule-based **achievements engine** with unlock toasts
  (`data/achievements.ts`, `AchievementToast.tsx`). Storage schema v4 with automatic
  migration from v3 saves.
- **Stats dashboard** — streak, level, accuracy, weekly activity chart, chapter mastery,
  achievements gallery, and settings (sound / reset). (`StatsView.tsx`)
- **Refined bank** — near-duplicate "(גרסה N)" questions de-duplicated at load and question
  text cleaned (`lib/questions.ts`); six more arrange/matching interactive items.

## Stack
- **React 18 + Vite 4** (TypeScript)
- **Tailwind CSS 3** — custom Brilliant palette in `tailwind.config.js`
- **Framer Motion 10** — progress bar, shake, card pops, path bounce
- **lucide-react** — icons

> Pinned to versions that run cleanly on **Node 16** (your current version).
> Node 18+ works too.

## Run it

```bash
npm install
npm run dev      # open http://localhost:5173
```

Other scripts: `npm run build` (production bundle), `npm run typecheck`, `npm run preview`.

## Deploy for free

The app is a fully static site (relative asset paths via `base: './'`), so it works on any
free static host with **zero configuration**:

**Netlify Drop (easiest, ~2 minutes, no git needed):**
1. `npm run build` — creates the `dist/` folder.
2. Open <https://app.netlify.com/drop> and sign up free.
3. Drag the `dist` folder onto the page → you get a live `https://<name>.netlify.app` URL.
4. To update: rebuild and drag `dist` again (Deploys → drag & drop).

**Vercel (CLI):** `npx vercel` in the project root → accept defaults (auto-detects Vite) →
`npx vercel --prod` for the production URL.

**GitHub Pages:** push the repo to GitHub → Settings → Pages → deploy from a branch (or an
action that publishes `dist`). Works out of the box thanks to the relative base path.

> Progress is stored in each browser's `localStorage` — every visitor gets their own
> profile/XP automatically; nothing is shared between devices.

## How the 250 questions become a course

The path mirrors the **course chapters** of 10145. Each chapter node maps to one or
more `topic` strings in the bank (see `src/data/modules.ts`). The bank's 10 topics
group into the chapters like so:

| Chapter | Title | Topics → | Qs |
|---|---|---|---|
| פרק א | הפשטה של מחשבים | Performance + Amdahl (x2 variants) | 59 |
| פרק ב | ייצוג מידע במחשב | Conversions + Floating Point | 44 |
| פרק ג | אלגברה בוליאנית ומעגלים לוגיים | Boolean Algebra | 2 |
| פרק ד | פקודות שפת המכונה | MIPS Assembly | 54 |
| פרק ז | מעבד חד-מחזורי | Single-Cycle (diagram Qs) | 12 |
| פרק ח | מעבד רב-מחזורי | Multi-Cycle (diagram Qs) | 12 |
| פרק ט | שיפור ביצועים בצנרת | Datapath/Pipeline + Cache | 91 |

> **Data notes:**
> - The bank's "מסלול נתונים וצנרת" topic is entirely *pipeline* content
>   (hazards/forwarding/stalls), so it lives under פרק ט.
> - Chapters **ז and ח** are not in the generated bank. They're filled by curated,
>   **diagram-based** questions in `src/data/extraQuestions.ts` (merged in `questions.ts`),
>   built from the course practice sheets + summaries (Patterson & Hennessy figures).
>   The diagrams live in `public/diagrams/`.
> - A chapter with an empty `topics` array renders as a locked "בקרוב" node and is
>   skipped in the unlock chain — add a topic and it lights up automatically.
>
> The chapter→topic mapping is the only place coupled to the exact Hebrew topic strings.
> If you regenerate the bank, update `topics` in `src/data/modules.ts`.

## Diagram (image) questions

A question may carry an optional `image` field (a filename in `public/diagrams/`). When
present, `QuizSession` renders it above the options via `QuestionImage`, which supports a
**tap-to-zoom fullscreen lightbox** — important for the detailed datapath/FSM figures on
mobile. The five diagrams: single-cycle datapath (×2), the control-signals table (Fig 4.18),
the multi-cycle datapath, and the multi-cycle FSM.

## Feature → code map

| Requested feature | Where |
|---|---|
| **App layout + navigation** | `src/App.tsx` |
| **State management** (XP, progress, mistakes) + localStorage | `src/state/progress.tsx` |
| **Learning Path / Map** (winding SVG spine, chapter nodes, locked/soon/done) | `src/components/LearningPath.tsx`, `PathNode.tsx` |
| **Quiz engine** (Path + Survival modes, hearts, fail/pass) | `src/components/QuizSession.tsx` |
| **Endless Survival mode** (entry card + high score) | `LearningPath.tsx` card, `QuizSession.tsx` (`mode="survival"`) |
| **Diagram questions + lightbox** | `QuestionImage.tsx`, `src/data/extraQuestions.ts` |
| **God Mode** (unlock all chapters + infinite hearts) | `Header.tsx` crown toggle, `progress.tsx`, `QuizSession.tsx` (`godMode`) |
| **Animated progress bar** | `src/components/ProgressBar.tsx` |
| **Hearts (3 per session)** | `src/components/Hearts.tsx` |
| **Card-based options** | `src/components/OptionCard.tsx` |
| **Sticky bottom action bar** (Check → Correct/Incorrect → Continue, shake) | `src/components/BottomActionBar.tsx` |
| **Immediate explanation** (renders the JSON `explanation`) | `src/components/ExplanationPanel.tsx` |
| **Results / fail screen** | `src/components/SessionComplete.tsx` |
| **Brilliant colors / fonts / animations** | `tailwind.config.js`, `src/index.css` |
| **Session building + option shuffling** | `src/lib/session.ts` |

## Gameplay rules
- **Path session** = 6 questions (unmastered prioritized). `SESSION_SIZE` in `src/data/modules.ts`.
- **Endless Survival** (תרגול ללא הגבלה): random questions from the whole bank, no end.
  3 hearts; losing all 3 ends the run. Score = correct answers; the best run is saved as
  `survivalBest` and shown on the dashboard card + the in-run HUD.
- **3 hearts** per session; a wrong answer costs one. Zero hearts → session fails.
- **XP**: +10 per correct, +10 for clearing a path session, +25 perfect bonus.
- A wrong answer goes to the **Review bucket**; answering it correctly later removes it.
- A module **unlocks** the next once you clear one session; it turns **gold** at 100% mastery
  (every question in it answered correctly at least once).
- **God Mode** (crown icon in the header): unlocks every chapter (skip to any) and gives
  **infinite hearts** — wrong answers never cost a life and the run can't fail. Persisted.
- Progress is saved to `localStorage` (`assembly-quest:progress:v2`). The ↺ button resets it.

## RTL / bidi notes
`<html dir="rtl">` drives the whole layout. Mixed content (MIPS like `slt $t0, $s1, $s2`,
hex like `0xE4`) is detected by `src/lib/text.ts` and rendered LTR in a monospace box so it
stays readable inside the Hebrew UI.
