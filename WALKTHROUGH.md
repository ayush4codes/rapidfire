# Rapid Fire Quiz — Walkthrough

## What Was Built

A full-stack rapid-fire quiz web application with 40 tech MCQ questions, 15-second timer per question, and single-attempt enforcement.

### Architecture

```
Login Page --> Auth API --> MongoDB: Users
Login Page --> Session --> Quiz Page
Quiz Page --> Fetch Questions --> MongoDB: Questions
Quiz Page --> 15s Timer + MCQs --> Quiz Page
Quiz Page --> Submit Answers --> Submit API
Submit API --> Grade Server-Side --> MongoDB: Results
Submit API --> Redirect --> Results Page
Admin Leaderboard --> Secret Auth --> MongoDB: Results
```

---

## Files Created

### Database Layer
| File | Purpose |
|------|---------|
| lib/mongodb.js | Mongoose connection singleton with caching for serverless |
| lib/models/User.js | User model: fullName, githubUsername, hasAttempted |
| lib/models/Question.js | Question model: question, 4 options, correctAnswer index |
| lib/models/Result.js | Result model: score, per-question answers with timing |
| data/questions.json | 40 tech MCQ seed questions |

### API Routes
| Route | Method | Purpose |
|-------|--------|---------|
| /api/auth | POST | Login (create/find user, single-attempt check) |
| /api/questions | GET | Fetch 40 random questions (no correct answers sent) |
| /api/submit | POST | Grade answers server-side, save result, mark attempted |
| /api/seed | POST | Seed DB with questions (protected by SEED_SECRET) |
| /api/leaderboard | GET | Admin-only leaderboard (protected by ADMIN_SECRET) |

### Pages
| Page | File |
|------|------|
| Login | app/page.js |
| Quiz | app/quiz/page.js |
| Results | app/results/page.js |
| Leaderboard | app/leaderboard/page.js |

### Styles
| File | Purpose |
|------|---------|
| app/globals.css | Full design system: dark theme, glassmorphism, animations |

---

## Key Features

1. **Authentication**: Full name + GitHub username → stored in MongoDB
2. **Single Attempt**: `hasAttempted` flag prevents retakes (enforced server-side)
3. **15-Second Timer**: Circular SVG ring with color transitions (green → yellow → red)
4. **Anti-Cheat**: Correct answers never sent to the client; graded server-side
5. **Results**: Animated score ring, stats grid, collapsible per-question review
6. **Admin Leaderboard**: Secret-protected, ranked table at `/leaderboard`
7. **Responsive**: Works on mobile and desktop

---

## Deployment to Vercel

### Step 1: Set up MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and whitelist `0.0.0.0/0` for Vercel access
3. Copy your connection string

### Step 2: Deploy to Vercel
```bash
cd "rapid-fire"
npx vercel
```

### Step 3: Set Environment Variables in Vercel Dashboard
| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/rapidfire` |
| `SEED_SECRET` | Any secret string for seeding questions |
| `ADMIN_SECRET` | Any secret string for admin leaderboard access |

### Step 4: Seed Questions
After deploying, seed the database:
```bash
curl -X POST https://your-app.vercel.app/api/seed \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-seed-secret"}'
```

### Step 5: Access Leaderboard
Visit `https://your-app.vercel.app/leaderboard` and enter your `ADMIN_SECRET`.

---

## Build Verification

✅ `npm run build` — passes successfully with all routes compiled
