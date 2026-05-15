# MyClinic — Clinic Management System

<div align="center">

**[English](#english) | [العربية](#العربية) | [Français](#français)**

</div>

---

# English

## Quick Start

```bash
# Clone and install
git clone <repo>
cd myclinic
npm install

# Create .env.local with Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJxxx...

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## What is MyClinic?

A full-stack clinic management system built with:
- **Next.js 16** — React framework (App Router)
- **Supabase** — PostgreSQL database with RLS
- **Tailwind CSS 4** — Utility-first styling
- **TypeScript 5** — Full type safety

### Features

| Feature | Description |
|---------|-------------|
| **Doctor Registration** | 3-step wizard to create doctor account + clinic |
| **Patient Management** | Add, edit, search, soft-delete patients |
| **Medical Exams** | Free-text exams/studies field per patient |
| **Dashboard** | Real-time patient statistics and overview |
| **Settings** | Manage clinic info, add/deactivate secretaries |
| **Multilingual** | Arabic (RTL), French, English — live switching |
| **Premium Auth UI** | Split-screen login/register with glassmorphism |

### User Roles

| Role | Access |
|------|--------|
| **Doctor** | Full access: patients, settings, manage secretaries |
| **Secretary** | Patients only: add, edit, search, deactivate |

### Tech Stack

| Technology | Version |
|------------|---------|
| Next.js | 16.2.4 |
| React | 19.2.4 |
| Supabase | @supabase/ssr 0.10.2 |
| Tailwind CSS | 4 |
| TypeScript | 5 |

## Project Structure

```
myclinic/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx             # Root layout (RTL, metadata)
│   ├── page.tsx               # Landing page (marketing)
│   ├── login/page.tsx         # Login — split-screen design
│   ├── register/page.tsx      # Registration wizard (3 steps)
│   └── dashboard/page.tsx     # Main app (patients + settings)
├── components/                 # Reusable React components
│   ├── Sidebar.tsx            # Navigation sidebar + mobile bottom nav
│   ├── PatientDialog.tsx      # Patient add/edit modal form
│   ├── LanguageSwitcher.tsx   # AR/FR/EN language toggle
│   ├── LoadingScreen.tsx      # Branded loading screen
│   └── Logo.tsx               # SVG logo component
├── lib/                       # Client utilities
│   ├── supabase.ts            # Supabase browser client
│   └── i18n.ts                # Translations (AR/FR/EN)
├── types/                     # TypeScript interfaces
│   └── index.ts               # Clinic, User, Patient, AuthUser
├── utils/                     # Server utilities
│   └── supabase/
│       ├── client.ts          # Browser client factory
│       ├── server.ts          # Server client factory
│       └── middleware.ts      # Session management
├── supabase/                  # Database migrations
│   └── add_medical_studies.sql
├── proxy.ts                   # Next.js 16 proxy (replaces middleware.ts)
├── DATABASE.md                # Complete database schema
├── AGENTS.md                  # Developer guidelines
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run lint` | Run ESLint |

## Database

The app uses 3 tables in Supabase:
- **clinics** — Clinic information (name, specialty, city, contact)
- **users** — Doctors and secretaries (role-based access)
- **patients** — Patient records (personal info, blood type, exams, notes)

See [DATABASE.md](./DATABASE.md) for complete schema and SQL.

## Authentication Flow

1. **Registration**: Doctor creates account via 3-step wizard → clinic + doctor user inserted → auto-login to dashboard.
2. **Login**: Username + password verified against `users` table → session stored in `localStorage` as `AuthUser`.
3. **Session**: `AuthUser { id, clinic_id, full_name, role }` determines access level.
4. **Roles**: Doctor sees Patients + Settings tabs; Secretary sees Patients only.

## Patient Data Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| full_name | TEXT | ✅ | Patient's full name |
| phone | TEXT | ✅ | Contact phone number |
| email | TEXT | | Email address |
| gender | TEXT | | male / female |
| date_of_birth | DATE | | Date of birth |
| blood_type | TEXT | | A+/A-/B+/B-/AB+/AB-/O+/O- |
| medical_studies | TEXT | | Free-text exams/studies |
| address | TEXT | | Street address |
| city | TEXT | | City |
| emergency_phone | TEXT | | Emergency contact |
| notes | TEXT | | General notes |

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | This file — project overview |
| `DATABASE.md` | Database schema, SQL, TypeScript types |
| `AGENTS.md` | Developer guidelines and conventions |

---

# العربية

## البدء السريع

```bash
npm install
# أنشئ .env.local بمعلومات Supabase
npm run dev
```

## ما هو MyClinic؟

نظام إدارة عيادات كامل بـ:
- Next.js 16 — إطار React
- Supabase — قاعدة بيانات PostgreSQL
- Tailwind CSS 4 — التصميم

## المميزات

1. تسجيل طبيب + عيادة (معالج من 3 خطوات)
2. إدارة المرضى (إضافة، تعديل، بحث، تعطيل)
3. حقل الفحوصات الحرة لكل مريض
4. لوحة إحصائيات
5. إعدادات العيادة وإدارة الموظفين
6. متعدد اللغات (العربية، الفرنسية، الإنجليزية)

## الأدوار

| الدور | الصلاحيات |
|-------|-----------|
| **طبيب** | كامل: المرضى، الإعدادات، إضافة موظفين |
| **سكرتير** | المرضى فقط: إضافة، تعديل، بحث |

---

# Français

## Démarrage Rapide

```bash
npm install
# Créer .env.local avec les identifiants Supabase
npm run dev
```

## Qu'est-ce que MyClinic?

Système de gestion de clinique complet avec:
- Next.js 16 — Framework React
- Supabase — Base de données PostgreSQL
- Tailwind CSS 4 — Stylisation

## Fonctionnalités

1. Inscription médecin + clinique (assistant en 3 étapes)
2. Gestion des patients (ajouter, modifier, rechercher, désactiver)
3. Champ texte libre pour les examens par patient
4. Tableau de bord avec statistiques
5. Paramètres de la clinique et gestion du personnel
6. Multilingue (arabe, français, anglais)

## Rôles

| Rôle | Accès |
|------|-------|
| **Médecin** | Complet : patients, paramètres, gestion personnel |
| **Secrétaire** | Patients uniquement : ajouter, modifier, rechercher |