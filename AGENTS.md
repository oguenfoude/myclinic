<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — Codebase Guidelines for Agentic Coding

This file provides guidelines and commands for agents operating in this repository.

## 1. Build, Lint, and Test Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint (ESLint)
npm run lint
```

**No test framework is currently configured.** If you need to add tests:
- Use Vitest for unit tests (npm create vitest)
- Create test files with `.test.ts` or `.test.tsx` extension
- Run a single test file: `npx vitest run src/path/to/file.test.ts`

## 2. Code Style Guidelines

### Imports
- Use path aliases: `@/*` resolves to project root
- Order: external libs → internal libs → components/types → utilities
- Example:
  ```typescript
  import { useState, useEffect } from 'react'
  import { useRouter } from 'next/navigation'
  import { supabase } from '@/lib/supabase'
  import { useT } from '@/lib/i18n'
  import { AuthUser, Patient } from '@/types'
  import PatientDialog from '@/components/PatientDialog'
  ```

### Formatting
- Use 2 spaces for indentation (not tabs)
- Lines max 100 characters where practical
- Trailing commas in objects/arrays
- Use single quotes for strings in JSX, double quotes in HTML attributes

### TypeScript
- Always type function parameters and return values
- Use explicit types for props interfaces
- Avoid `any` — use `unknown` if type is truly unknown
- Example props interface:
  ```typescript
  interface PatientDialogProps {
    patient: Patient | null
    authUser: AuthUser
    onClose: () => void
    onSave: () => void
  }
  ```

### Naming Conventions
- **Files**: PascalCase for components (`PatientDialog.tsx`), camelCase for utilities (`i18n.ts`)
- **Components**: Capitalized (`export default function PatientDialog()`)
- **Interfaces**: PascalCase with descriptive names (`interface Patient`)
- **Variables**: camelCase (`patientSearch`, `apptFilter`)
- **Constants**: SCREAMING_SNAKE_CASE for config values
- **CSS Classes**: Tailwind utility classes preferred; use.kebab-case for custom CSS if needed

### Error Handling
- Always wrap async operations in try/catch
- Use user-facing error messages from i18n (`t.errorGeneric`, `t.errorRequired`)
- Display errors inline near the relevant form field
- Log technical errors to console for debugging

### React/Next.js Patterns
- Use `'use client'` directive for client-side components
- Use `useCallback` for functions passed as props to prevent re-renders
- Use `startTransition` when updating state that doesn't need immediate sync (from `react`)
- Use `suppressHydrationWarning` on root HTML element if needed for hydration mismatch
- Pattern for preventing hydration mismatch:
  ```typescript
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])
  if (!isMounted) return <LoadingScreen />
  ```

### Database (Supabase)
- Tables: `clinics`, `users`, `patients`, `appointments`
- All tables have `id` (UUID), `created_at`, `updated_at`
- Soft delete pattern: use `is_active: boolean` flag
- RLS policies should be configured in Supabase dashboard

### Tailwind CSS
- Use responsive prefixes: `sm:`, `md:`, `lg:`
- RTL support: use `{isRTL ? 'flex-row-reverse' : ''}` pattern
- Colors: primary blue (`blue-600`), accent teal (`teal-600`)
- Status colors: scheduled=blue, completed=green, cancelled=gray, no_show=red

## 3. Project Structure

```
myclinic/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout (RTL, i18n)
│   ├── page.tsx           # Landing page
│   ├── login/             # Login page
│   ├── register/         # Registration page
│   └── dashboard/        # Main dashboard
├── components/           # React components
│   ├── Sidebar.tsx       # Navigation sidebar
│   ├── PatientDialog.tsx # Patient form modal
│   ├── AppointmentDialog.tsx
│   ├── LanguageSwitcher.tsx
│   ├── LoadingScreen.tsx
│   └── Logo.tsx
├── lib/                   # Utilities
│   ├── supabase.ts       # Supabase client
│   └── i18n.ts          # Translations
├── types/                # TypeScript interfaces
│   └── index.ts
├── utils/                 # Server utilities
│   └── supabase/
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

## 4. Key Files & Their Purpose

| File | Purpose | Key Functions |
|------|--------|--------------|
| `app/layout.tsx` | Root HTML, metadata | Metadata, fonts, dir="rtl" |
| `app/page.tsx` | Landing/marketing | Hero, features, CTA |
| `app/login/page.tsx` | Login form | Authenticate users |
| `app/register/page.tsx` | 3-step registration | Create clinic + doctor |
| `app/dashboard/page.tsx` | Main app | All CRUD operations |
| `components/Sidebar.tsx` | Navigation | Role-based tabs |
| `components/PatientDialog.tsx` | Patient form | Add/edit patients |
| `components/AppointmentDialog.tsx` | Appointment form | Schedule appointments |
| `components/LanguageSwitcher.tsx` | i18n toggle | Switch AR/FR/EN |
| `lib/supabase.ts` | DB client | Supabase connection |
| `lib/i18n.ts` | Translations | AR/FR/EN strings |
| `types/index.ts` | TypeScript types | Clinic, User, Patient, Appointment |

## 5. Common Operations

### Fetching Patients
```typescript
const { data } = await supabase
  .from('patients')
  .select('*')
  .eq('clinic_id', authUser.clinic_id)
  .eq('is_active', true)
```

### Creating Patient
```typescript
await supabase
  .from('patients')
  .insert({ clinic_id, full_name, phone, ... })
```

### Updating Appointment Status
```typescript
await supabase
  .from('appointments')
  .update({ status: 'completed' })
  .eq('id', appointmentId)
```

### Auth Check
```typescript
const stored = localStorage.getItem('clinic_user')
if (stored) {
  const user = JSON.parse(stored) as AuthUser
  // redirect to dashboard
}
```

## 6. State Management

- Use `useState` for local component state
- Use `useCallback` for memoized data loading functions
- Use `startTransition` for auth checks in useEffect
- Use derived state for filtered/searched lists

## 7. Error Handling Pattern

```typescript
try {
  const { data, error } = await supabase.from('table').select('*')
  if (error) throw error
} catch (error) {
  console.error('Error:', error)
  setError(t.errorGeneric)
}
```