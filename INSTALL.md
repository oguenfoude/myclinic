# INSTALL.md — MyClinic Installation Guide

This document provides detailed instructions for setting up MyClinic.

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18+ | Required |
| npm | 8+ | Comes with Node.js |
| Supabase account | Free tier works | Database |

Check versions:
```bash
node --version    # Should be v18+
npm --version    # Should be 8+
```

---

## Step 1: Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/your-repo/myclinic.git

# Navigate to project
cd myclinic
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This installs:
- next (16.2.4)
- react (19.2.4)
- @supabase/ssr (0.10.2)
- @supabase/supabase-js (2.103.3)
- tailwindcss (4)
- typescript (5)
- eslint (9)

---

## Step 3: Supabase Setup

### 3.1: Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Enter details:
   - **Name**: myclinic
   - **Database Password**: (strong password)
   - **Region**: (closest to you)
4. Wait for setup (~2 minutes)

### 3.2: Get API Keys

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** → Your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → Your `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### 3.3: Create Database

1. Go to **SQL Editor**
2. Copy and run the SQL from [DATABASE.md](./DATABASE.md)
3. Click **Run**

---

## Step 4: Environment Variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Example:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFibcDEyMyIsInJvbGUiOiJwYW5lbCIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.abc123...
```

---

## Step 5: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 6: Test the App

### Test 1: Registration

1. Open app (should show landing page)
2. Click **"Get Started"** or **"ابدأ مجاناً"**
3. Fill doctor info:
   - Name: Dr. Test
   - Username: testdoctor
   - Email: test@clinic.com
   - Password: test123
4. Click **Next**
5. Fill clinic info:
   - Name: Test Clinic
   - Specialty: General Medicine
6. Click **Next**, then **Submit**
7. Should redirect to dashboard

### Test 2: Add Patient

1. Click **"+ Add Patient"**
2. Fill form:
   - Name: John Doe
   - Phone: +213600000000
3. Click **Save**
4. Patient should appear in table

### Test 3: Create Appointment

1. Click **Appointments** tab
2. Click **"+ New Appointment"**
3. Select patient, date, time
4. Click **Save**
5. Appointment should appear

### Test 4: Language Switch

1. Click language dropdown
2. Select **Français** or **English**
3. UI should switch language

---

## Deployment

### Option 1: Vercel (Recommended)

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/you/myclinic.git
git push -u origin main
```

2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
3. Click **"New Project"**
4. Import your repo
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
6. Click **Deploy**

### Option 2: Netlify

1. Push to GitHub
2. Go to [app.netlify.com](https://app.netlify.com)
3. Click **"Add new site"** → **Import an existing project**
4. Select GitHub repo
5. Add environment variables in **Settings** → **Environment**
6. Deploy

### Option 3: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t myclinic .
docker run -p 3000:3000 myclinic
```

---

## Troubleshooting

### Error: "Failed to fetch"

**Cause**: Wrong Supabase URL or key

**Fix**: Check `.env.local`:
```bash
cat .env.local
```

### Error: "Module not found"

**Cause**: Missing dependencies

**Fix**:
```bash
rm -rf node_modules
npm install
```

### Error: "Permission denied"

**Cause**: RLS policy issue

**Fix**: Check RLS policies in Supabase SQL Editor

### Error: Build failed

**Fix**:
```bash
rm -rf .next
npm run build
```

---

## Updating

```bash
# Pull latest changes
git pull

# Update dependencies
npm install

# Rebuild
npm run build
```

---

## Directory Structure

```
myclinic/
├── app/                   # Next.js pages
│   ├── page.tsx          # Landing
│   ├── login/            # Login
│   ├── register/         # Register
│   └── dashboard/       # Main app
├── components/           # Reusable UI
├── lib/                 # Utilities
├── types/               # TypeScript types
├── .env.local           # Environment (your secrets)
├── package.json         # Dependencies
├── README.md           # Overview
├── DATABASE.md         # Schema
├── INSTALL.md         # This file
├── API.md            # API operations
└── AGENTS.md         # Developer guidelines
```