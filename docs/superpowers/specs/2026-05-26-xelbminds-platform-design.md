# XelbMinds Platform — Design Spec

**Date:** 2026-05-26
**Status:** Approved by user, in implementation

## Goal

Transform the single-file React-via-CDN `index.html` (legacy at `legacy/index.legacy.html`) into a secure, well-structured, Firebase-ready demo platform for a Portuguese tutoring center (centro de explicações).

## Stack

- Vite 5, React 18, TypeScript strict
- Tailwind CSS + Plus Jakarta Sans + Inter
- React Router 6 (HashRouter for GH Pages compatibility)
- Zustand for auth state
- Zod for input validation
- Lucide React icons
- Recharts for charts
- jsPDF for PDF exports
- date-fns for date handling

## Folder Structure

```
xelbminds/
├── public/logo.png
├── src/
│   ├── main.tsx, App.tsx, index.css
│   ├── lib/         theme, utils, formatters
│   ├── types/       Student, Payment, Lesson, Expense, User, Role, Lead…
│   ├── data/seed.ts mock seed data
│   ├── services/    storage, auth, students, payments, lessons, expenses, leads, comms, notifications
│   ├── store/       authStore (zustand)
│   ├── hooks/       useAuth, useStudents, usePayments, useNotifications…
│   ├── components/  ui/ (primitives), layout/, domain/, auth/
│   ├── pages/       Login, Dashboard, Schedule, Students, Financial, Expenses,
│   │                Teacher, StudentArea, Settings, Leads, Communications,
│   │                Reports, Library, Goals, Pomodoro, Notifications…
│   └── routes/      routes.tsx with RoleGuard
├── .github/workflows/deploy.yml  GH Actions → GH Pages
├── tailwind.config.ts, vite.config.ts, tsconfig.json
└── package.json
```

## Brand Tokens (from logo `images.png`)

```ts
sage:      #9CB956   // Xelb green - primary
sageDark:  #7DA13E
sageLight: #C2D88F
sageBg:    #F4F8E8

teal:      #5A8B9D   // Minds blue - secondary
tealDark:  #3E7088   // synapses
tealLight: #A4C0CC
tealBg:    #EAF1F4
```

## Auth (mock, Firebase-ready)

3 demo accounts in `services/authService.ts`:

| Email | Password | Role | Pages |
|---|---|---|---|
| `admin@xelbminds.pt` | `demo1234` | admin | all |
| `prof@xelbminds.pt` | `demo1234` | teacher | dashboard (lite), schedule, teacher, library, communications (read) |
| `aluno@xelbminds.pt` | `demo1234` | student | student-area, goals, pomodoro, notifications |

`AuthProvider` exposes `useAuth() → { user, role, login, logout }`. `<RoleGuard roles={['admin']}>` wraps routes.

## Data Layer (Firebase-ready)

`services/storage.ts` wraps localStorage with `get<T>/set<T>/remove/reset`. Each domain service exposes `list/get/create/update/remove` returning Promises so swapping for Firestore is a drop-in replacement. First load seeds from `data/seed.ts` if empty. Settings page has "Reset demo" + "Export backup" + "Import backup".

## Security Posture (demo-appropriate)

- TypeScript strict mode
- Zod validation on all forms
- Role-based route guards
- Input sanitization (trim, length limits)
- No `dangerouslySetInnerHTML`, no `eval`, no inline scripts
- `.env` git-ignored, `.env.example` declares `VITE_FIREBASE_*` placeholders
- Demo passwords flagged with TODO comments

## Feature Scope

### Core (8 pages, parity with legacy)
Dashboard, Schedule, Students CRUD, Financial, Expenses, Teacher area, Student area, Settings.

### Gestor pack
- **Leads CRM**: pipeline Interessado → Aula experimental → Inscrito → Desistiu
- **Communications Center**: bulk WhatsApp/email templates per audience
- **Reports**: PDF monthly export (jsPDF)
- **Backup/Restore**: JSON export+import of all data

### Professor pack
- Personal agenda (filtered by teacher assignment)
- Quick attendance (one-tap presence/absence per student per day)
- Materials library (upload/catalog by subject+grade)
- Student progress chart over time

### Encarregado pack
- Multi-child switcher
- Notifications (bell + dropdown + page)
- Payments center (history, downloadable receipts, annual total)
- Request extra class (mock flow)

### Aluno pack
- Gamification (XP, badges, streak)
- Goals (target grade + progress)
- TPC submission (file upload mock)
- Exam calendar (countdown)
- Pomodoro timer (25/5 cycles)

### V2 (UI mocks, no real backend)
- Online payments UI (MB WAY/Stripe checkout flow mock)
- Invoice generation UI (NIF, AT compliance fields visible)
- AI assistant UI (chat interface, mock responses)
- Capacity planner (rooms × time slots)

## Deployment

GitHub Actions workflow on every push to `main`:
1. `npm ci`
2. `npm run build`
3. Deploy `dist/` to `gh-pages` branch
4. Live at `https://manuelmarrao0887.github.io/xelbminds/`

Vite `base: '/xelbminds/'` for correct asset paths. HashRouter so deep-links work on GH Pages.

## Out of Scope (Demo)

- Real payments
- Real Firebase Auth/Firestore (placeholders only)
- Server-side anything
- Real email/SMS/WhatsApp sending (links to wa.me only)
