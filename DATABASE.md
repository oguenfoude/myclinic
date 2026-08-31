# DATABASE.md — MyClinic Database Schema

This document contains the complete database schema for MyClinic.

> **Status**: Cleanly reinstalled (all data wiped) on 2026-08-31. Schema below is the
> current live definition in Supabase project `okjbqksopixqneqbilpf`.

---

## Connection & Credentials

| Key | Value |
|-----|-------|
| Host | `https://okjbqksopixqneqbilpf.supabase.co` |
| Publishable key | `sb_publishable_MikK_F-Eke7M1jVacFYqgA_Ub5of7Ld` |
| Env (browser) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Management PAT | (personal access token) via `api.supabase.com` |

---

## SQL Schema (Ready to Copy)

Run this entire block in your Supabase SQL Editor **or** via the Management API
`POST /v1/projects/{ref}/database/query` to reset the whole database.

```sql
-- ============================================================
-- MYCLINIC DATABASE SCHEMA (clean reinstall)
-- ============================================================

-- Drop existing tables (reverse dependency order)
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS clinics CASCADE;

-- CLINICS
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USERS (Doctors + Secretaries)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,
  role TEXT CHECK (role IN ('doctor', 'secretary')) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATIENTS
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  date_of_birth DATE,
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  medical_studies TEXT,
  price NUMERIC DEFAULT 0 NOT NULL,
  address TEXT,
  city TEXT,
  emergency_phone TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPOINTMENTS
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Clinics
CREATE POLICY "Clinics select" ON clinics FOR SELECT USING (true);
CREATE POLICY "Clinics insert" ON clinics FOR INSERT WITH CHECK (true);
CREATE POLICY "Clinics update" ON clinics FOR UPDATE USING (true);
CREATE POLICY "Clinics delete" ON clinics FOR DELETE USING (true);

-- Users: NO open policies and NO table grants.
-- The users table is FULLY LOCKED to anon/authenticated. All access goes through
-- SECURITY DEFINER functions (app_login, register_clinic, list_secretaries,
-- add_secretary, deactivate_secretary) defined below.
-- REVOKE ALL ON users FROM anon, authenticated;

-- Patients
CREATE POLICY "Patients select" ON patients FOR SELECT USING (true);
CREATE POLICY "Patients insert" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Patients update" ON patients FOR UPDATE USING (true);
CREATE POLICY "Patients delete" ON patients FOR DELETE USING (true);

-- Appointments
CREATE POLICY "Appointments select" ON appointments FOR SELECT USING (true);
CREATE POLICY "Appointments insert" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Appointments update" ON appointments FOR UPDATE USING (true);
CREATE POLICY "Appointments delete" ON appointments FOR DELETE USING (true);

-- INDEXES
CREATE INDEX idx_users_clinic_id ON users(clinic_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- ============================================================
-- SECURITY DEFINER FUNCTIONS (pgcrypto password hashing)
-- Requires: CREATE EXTENSION IF NOT EXISTS pgcrypto; (funcs live in `extensions` schema)
-- Each function SET search_path = public, extensions so crypt()/gen_salt() resolve.
-- ============================================================

-- LOGIN: validates bcrypt hash server-side, updates last_login, returns safe fields only
CREATE OR REPLACE FUNCTION public.app_login(p_username text, p_password text)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $func$
DECLARE u users%ROWTYPE;
BEGIN
  SELECT * INTO u FROM users
  WHERE lower(username) = lower(p_username) AND is_active = true LIMIT 1;
  IF NOT FOUND THEN RETURN json_build_object('ok', false, 'message', 'invalid_credentials'); END IF;
  IF u.password IS DISTINCT FROM crypt(p_password, u.password) THEN
    RETURN json_build_object('ok', false, 'message', 'invalid_credentials');
  END IF;
  UPDATE users SET last_login = now(), updated_at = now() WHERE id = u.id;
  RETURN json_build_object('ok', true, 'id', u.id, 'clinic_id', u.clinic_id,
    'full_name', u.full_name, 'role', u.role);
END $func$;

-- REGISTER: atomic clinic + doctor creation with hashed password
CREATE OR REPLACE FUNCTION public.register_clinic(
  p_clinic_name text, p_doctor_name text, p_username text, p_password text, p_email text DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $func$
DECLARE v_clinic_id uuid; v_user users%ROWTYPE;
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE lower(username) = lower(p_username)) THEN
    RETURN json_build_object('ok', false, 'message', 'username_taken'); END IF;
  INSERT INTO clinics (name, is_active) VALUES (p_clinic_name, true) RETURNING id INTO v_clinic_id;
  INSERT INTO users (clinic_id, full_name, username, email, password, role, is_active)
  VALUES (v_clinic_id, p_doctor_name, lower(p_username),
    COALESCE(NULLIF(p_email, ''), 'doctor_' || lower(p_username) || '@clinic.local'),
    crypt(p_password, gen_salt('bf')), 'doctor', true)
  RETURNING * INTO v_user;
  RETURN json_build_object('ok', true, 'id', v_user.id, 'clinic_id', v_user.clinic_id,
    'full_name', v_user.full_name, 'role', v_user.role);
END $func$;

-- LIST SECRETARIES: safe columns only
CREATE OR REPLACE FUNCTION public.list_secretaries(p_clinic_id uuid)
RETURNS TABLE(id uuid, full_name text, username text, role text, is_active boolean, created_at timestamptz)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $fn$
  SELECT id, full_name, username, role, is_active, created_at
  FROM users WHERE clinic_id = p_clinic_id AND role = 'secretary'
  ORDER BY created_at DESC;
$fn$;

-- ADD SECRETARY: hashed password
CREATE OR REPLACE FUNCTION public.add_secretary(
  p_clinic_id uuid, p_full_name text, p_username text, p_password text)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $func$
DECLARE v_user users%ROWTYPE;
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE lower(username) = lower(p_username)) THEN
    RETURN json_build_object('ok', false, 'message', 'username_taken'); END IF;
  INSERT INTO users (clinic_id, full_name, username, email, password, role, is_active)
  VALUES (p_clinic_id, p_full_name, lower(p_username),
    'sec_' || lower(p_username) || '@clinic.local', crypt(p_password, gen_salt('bf')),
    'secretary', true)
  RETURNING * INTO v_user;
  RETURN json_build_object('ok', true, 'id', v_user.id, 'full_name', v_user.full_name,
    'username', v_user.username, 'role', v_user.role);
END $func$;

-- DEACTIVATE SECRETARY (soft delete)
CREATE OR REPLACE FUNCTION public.deactivate_secretary(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $func$
BEGIN
  UPDATE users SET is_active = false, updated_at = now() WHERE id = p_user_id AND role = 'secretary';
  RETURN json_build_object('ok', true);
END $func$;

-- Grant EXECUTE to the app roles (functions NOT EXECUTE-able by public by default)
REVOKE ALL ON FUNCTION public.app_login(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.app_login(text, text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.register_clinic(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_clinic(text, text, text, text, text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.list_secretaries(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_secretaries(uuid) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.add_secretary(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_secretary(uuid, text, text, text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.deactivate_secretary(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.deactivate_secretary(uuid) TO anon, authenticated;
```

---

## Seed Accounts (current live demo data)

| Role | Username | Password | Full name |
|------|----------|----------|-----------|
| Doctor | `doctor` | `doc123` | د. أحمد بن يوسف |
| Doctor | `doctor2` | `doc2123` | د. ليلى مرابط |
| Secretary | `secretary` | `sec123` | سارة بوعلام |

Clinic: **عيادة النور** (An-Nour Clinic) — Specialty: الطب العام / General Medicine, City: الجزائر / Algiers

### Data State
**Demo data reseeded** — 60 patients (30 male / 30 female, spread over the last ~90 days for analytics)
and 40 appointments (scheduled/completed/no_show/cancelled, past + future). The dashboard and
analytics are populated and colorful immediately when logging in as the demo doctor.

---

## TypeScript Types

See `types/index.ts`. Includes `Clinic`, `User`, `Patient`, `AuthUser`, and
`Appointment` (+ `AppointmentStatus`).

---

## Table Details

### Clinics

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | `gen_random_uuid()` |
| name | TEXT NOT NULL | Clinic name |
| specialty | TEXT | Medical specialty |
| city | TEXT | City |
| phone | TEXT | Phone |
| email | TEXT | Email |
| address | TEXT | Full address |
| logo_url | TEXT | Logo URL |
| is_active | BOOLEAN | Soft delete (default true) |
| created_at | TIMESTAMPTZ | `NOW()` |
| updated_at | TIMESTAMPTZ | `NOW()` |

### Users

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| clinic_id | UUID FK → clinics | CASCADE |
| full_name | TEXT NOT NULL | |
| username | TEXT UNIQUE NOT NULL | Login name |
| email | TEXT UNIQUE NOT NULL | |
| phone | TEXT | |
| password | TEXT NOT NULL | **bcrypt hash** (`crypt(pw, gen_salt('bf'))`) — never plaintext |
| role | TEXT | `doctor` \| `secretary` |
| is_active | BOOLEAN | Soft delete |
| last_login | TIMESTAMPTZ | |
| created_at / updated_at | TIMESTAMPTZ | |

### Patients

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| clinic_id | UUID FK → clinics | CASCADE |
| full_name | TEXT NOT NULL | |
| phone | TEXT NOT NULL | |
| email | TEXT | |
| gender | TEXT | `male` \| `female` |
| date_of_birth | DATE | |
| blood_type | TEXT | A+ A- B+ B- AB+ AB- O+ O- |
| medical_studies | TEXT | Free text exams |
| address | TEXT | |
| city | TEXT | |
| emergency_phone | TEXT | |
| notes | TEXT | |
| is_active | BOOLEAN | Soft delete |
| created_by | UUID FK → users | |
| created_at / updated_at | TIMESTAMPTZ | |

### Appointments

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| clinic_id | UUID FK → clinics | CASCADE |
| patient_id | UUID FK → patients | CASCADE |
| appointment_date | DATE NOT NULL | |
| appointment_time | TIME NOT NULL | |
| reason | TEXT | |
| status | TEXT | `scheduled` \| `completed` \| `cancelled` \| `no_show` (default scheduled) |
| notes | TEXT | |
| created_by | UUID FK → users | |
| created_at / updated_at | TIMESTAMPTZ | |
