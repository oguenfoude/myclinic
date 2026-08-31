<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — Codebase Guidelines for Agentic Coding

This file provides guidelines and commands for agents operating in this repository.

## 1. Build, Lint, and Test Commands

```bash
# Development server (Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

**Note:** `npm run lint` is broken (eslint not in PATH). Do not rely on it.

**No test framework is currently configured.** If you need to add tests:
- Use Vitest for unit tests
- Create test files with `.test.ts` or `.test.tsx` extension

## 2. Code Style Guidelines

### Imports
- Use path aliases: `@/*` resolves to project root
- Order: external libs → internal libs → components/types → utilities

### Formatting
- 2 spaces indentation, trailing commas, single quotes in JSX
- Lines max 100 characters where practical

### TypeScript
- Always type parameters and return values
- Avoid `any`

### Naming Conventions
- **Files**: PascalCase for components, camelCase for utilities
- **Interfaces**: PascalCase (`Patient`, `AuthUser`)
- **CSS Classes**: Tailwind utility classes preferred

### React/Next.js Patterns
- `'use client'` directive for client-side components
- Use `useCallback` for memoized functions
- Use `startTransition` for non-urgent state updates
- Use hydration mismatch prevention pattern:
  ```typescript
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])
  if (!isMounted) return <LoadingScreen />
  ```

### Tailwind CSS — Semantic Color System
**DO NOT use hardcoded Tailwind colors** (`blue-600`, `teal-600`, etc.). Use the semantic tokens defined in `tailwind.config.ts`:

| Token | Usage | Example |
|-------|-------|---------|
| `primary` | Buttons, links, active states | `bg-primary`, `text-primary`, `focus:ring-primary` |
| `primary-hover` | Hover state for primary elements | `hover:bg-primary-hover` |
| `accent` | Secondary highlights | `bg-accent`, `text-accent` |
| `surface` | Page backgrounds | `bg-surface` |
| `success` / `success-light` | Positive actions | `text-success`, `bg-success-light` |
| `danger` / `danger-light` | Destructive actions | `text-danger`, `bg-danger-light` |
| `danger-100`, `danger-200`, `danger-hover` | Danger variants | `border-danger-200` |
| `warning` / `warning-light` | Caution states | `bg-warning-light` |
| `shadow-primary`, `shadow-accent` | Colored shadows | `shadow-primary` |

**RTL support**: Always use `{isRTL ? 'flex-row-reverse' : ''}` pattern. `isRTL` comes from `useT()`.

## 3. Project Structure

```
myclinic/
├── app/
│   ├── layout.tsx          # Root (RTL, i18n, dir="rtl")
│   ├── page.tsx            # Landing page
│   ├── login/page.tsx      # Login form
│   ├── register/page.tsx   # 3-step registration
│   ├── dashboard/page.tsx  # Main app (patients + analytics + settings)
│   └── pricing/page.tsx    # Pricing page (3 tiers)
├── components/
│   ├── Sidebar.tsx         # Nav with patients/analytics/settings tabs
│   ├── PatientDialog.tsx   # Add/edit patient modal
│   ├── LanguageSwitcher.tsx # AR/FR/EN toggle
│   ├── LoadingScreen.tsx   # Full-screen loader
│   └── Logo.tsx            # SVG logo
├── lib/
│   ├── supabase.ts         # Browser Supabase client (canonical)
│   └── i18n.ts             # 3-language translations (AR/FR/EN)
├── types/index.ts          # AuthUser, Patient, Clinic, User
├── utils/supabase/         # Server client (utils/supabase/client.ts is duplicate — ignore)
├── tailwind.config.ts      # Semantic color tokens
├── proxy.ts                # Next.js 16 proxy (replaces middleware.ts)
└── AGENTS.md               # This file
```

## 4. Key Architecture Decisions

### Auth
- **NOT Supabase Auth** — custom localStorage-based auth
- `localStorage.getItem('clinic_user')` stores `AuthUser` (id, clinic_id, full_name, role)
- **Passwords are bcrypt-hashed** (pgcrypto) — never plaintext, never returned to client
- **The `users` table is fully locked** to anon/authenticated (no table grants). All user access goes through SECURITY DEFINER functions:
  - `app_login(p_username, p_password)` → validates bcrypt hash server-side, returns safe fields, updates `last_login`
  - `register_clinic(p_clinic_name, p_doctor_name, p_username, p_password, p_email)` → atomic clinic + doctor creation with hashed password
  - `list_secretaries(p_clinic_id)` → safe columns only
  - `add_secretary(p_clinic_id, p_full_name, p_username, p_password)` → hashed password
  - `deactivate_secretary(p_user_id)`
- Login: `app/login/page.tsx` → `supabase.rpc('app_login', ...)` → store AuthUser in localStorage

### Supabase Setup
- **Browser client**: `lib/supabase.ts` re-exports `createClient` from `@supabase/ssr`. Lazy singleton for backward-compatible `import { supabase }`.
- **Server client**: `utils/supabase/server.ts` — `createClient(cookieStore)`
- **Middleware client**: `utils/supabase/middleware.ts` — `createClient(request)`, wired into `proxy.ts`
- **Env vars** (in `.env.local`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (NOT `ANON_KEY`)
- Project ref: `okjbqksopixqneqbilpf` (Management API via personal access token)

### Database (Live Schema — see DATABASE.md)
- Tables: `clinics`, `users`, `patients`, `appointments`
- All have `id` (UUID, `gen_random_uuid()`), `created_at`, `updated_at`
- Soft delete: `is_active: boolean` flag (on clinics/users/patients)
- RLS enabled on all 4 tables; `users` has NO open policies (locked, functions only); `clinics`/`patients`/`appointments` have open select/insert/update/delete policies (publishable-key anon, scoped in-app by `clinic_id`)
- pgcrypto extension installed (`extensions` schema — `crypt`/`gen_salt` must be in `search_path` for SECURITY DEFINER functions)
- Appointments status: `scheduled | completed | cancelled | no_show`
- Demo data: 60 patients + 40 appointments seeded for demo clinic

### Seed / Demo Accounts
- Doctor: username `doctor`, password `doc123`
- Doctor: username `doctor2`, password `doc2123`
- Secretary: username `secretary`, password `sec123`
- Demo data: 60 patients + 40 appointments seeded for demo clinic (colorful populated dashboard)

### Next.js 16
- `proxy.ts` replaces `middleware.ts` — exported function must be named `proxy`
- Turbopack enabled in `next.config.ts`

### i18n
- Custom `useT()` hook from `lib/i18n.ts`
- Returns `{ t, lang, isRTL }`
- Arabic is default, RTL-first layout
- Add new keys to ALL THREE languages (ar, fr, en)

## 5. Common Operations

### Auth Check Pattern
```typescript
const [isMounted, setIsMounted] = useState(false)
useEffect(() => {
  startTransition(() => {
    setIsMounted(true)
    const stored = localStorage.getItem('clinic_user')
    if (stored) {
      const user = JSON.parse(stored) as AuthUser
      setAuthUser(user)
    } else {
      router.replace('/login')
    }
  })
}, [router])
if (!isMounted) return <LoadingScreen />
```

### Fetching Patients
```typescript
const { data } = await supabase
  .from('patients')
  .select('*')
  .eq('clinic_id', authUser.clinic_id)
  .eq('is_active', true)
  .order('created_at', { ascending: false })
```

### Dashboard Tabs
The dashboard (`app/dashboard/page.tsx`) has 3 tabs managed by `Sidebar`:
- **patients** — patient list, search, date filters, CRUD
- **analytics** — daily/weekly/monthly bar charts, gender split, recent activity
- **settings** — clinic info + secretary management (doctor only)

### Adding New i18n Keys
1. Add to `ar:` block in `lib/i18n.ts`
2. Add to `fr:` block
3. Add to `en:` block
4. Use via `t.yourKey` in components
