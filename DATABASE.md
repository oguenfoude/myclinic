# DATABASE.md — MyClinic Database Schema

This document contains the complete database schema for MyClinic.

---

## SQL Schema (Ready to Copy)

Run this entire block in your Supabase SQL Editor:

```sql
-- ============================================================
-- MYCLINIC DATABASE SCHEMA
-- Run in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- CLINICS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  specialty TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------
-- USERS TABLE (Doctors and Secretaries)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,
  role TEXT CHECK (role IN ('doctor', 'secretary')) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------
-- PATIENTS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  date_of_birth DATE,
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  address TEXT,
  city TEXT,
  emergency_phone TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------
-- APPOINTMENTS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES users(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- --------------------------------------------------------
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view clinics" ON clinics FOR SELECT USING (true);
CREATE POLICY "Anyone can view users" ON users FOR SELECT USING (true);
CREATE POLICY "Anyone can view patients" ON patients FOR SELECT USING (true);
CREATE POLICY "Anyone can view appointments" ON appointments FOR SELECT USING (true);

-- Insert policies (all authenticated users)
CREATE POLICY "Authenticated can insert clinics" ON clinics FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can insert patients" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can insert appointments" ON appointments FOR INSERT WITH CHECK (true);

-- Update policies (own clinic)
CREATE POLICY "Own clinic can update clinics" ON clinics FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE users.clinic_id = clinics.id)
);
CREATE POLICY "Own clinic can update users" ON users FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users u2 WHERE u2.clinic_id = users.clinic_id)
);
CREATE POLICY "Own clinic can update patients" ON patients FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE users.clinic_id = patients.clinic_id)
);
CREATE POLICY "Own clinic can update appointments" ON appointments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE users.clinic_id = appointments.clinic_id)
);

-- --------------------------------------------------------
-- INDEXES
-- --------------------------------------------------------
CREATE INDEX idx_users_clinic_id ON users(clinic_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_appointments_clinic_date ON appointments(clinic_id, appointment_date);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
```

---

## Table Details

### Clinics Table

```sql
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
```

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary key, auto-generated |
| name | TEXT | Yes | Clinic name |
| specialty | TEXT | No | Medical specialty |
| city | TEXT | No | City location |
| phone | TEXT | No | Phone number |
| email | TEXT | No | Email address |
| address | TEXT | No | Full address |
| logo_url | TEXT | No | Logo URL |
| is_active | BOOLEAN | Yes | Soft delete (default: true) |
| created_at | TIMESTAMPTZ | Yes | Auto-set |
| updated_at | TIMESTAMPTZ | Yes | Auto-set |

---

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
```

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| clinic_id | UUID | Yes | FK to clinics |
| full_name | TEXT | Yes | User's full name |
| username | TEXT | Yes | Unique login name |
| email | TEXT | Yes | Unique email |
| phone | TEXT | No | Phone number |
| password | TEXT | Yes | Password |
| role | TEXT | Yes | 'doctor' or 'secretary' |
| is_active | BOOLEAN | Yes | Account status |
| last_login | TIMESTAMPTZ | No | Last login timestamp |
| created_at | TIMESTAMPTZ | Yes | Auto-set |
| updated_at | TIMESTAMPTZ | Yes | Auto-set |

---

### Patients Table

```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  date_of_birth DATE,
  blood_type TEXT CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  address TEXT,
  city TEXT,
  emergency_phone TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| clinic_id | UUID | Yes | FK to clinics |
| full_name | TEXT | Yes | Patient name |
| phone | TEXT | Yes | Contact phone |
| email | TEXT | No | Email |
| gender | TEXT | No | 'male' or 'female' |
| date_of_birth | DATE | No | DOB |
| blood_type | TEXT | No | A+/A-/B+/B-/AB+/AB-/O+/O- |
| address | TEXT | No | Address |
| city | TEXT | No | City |
| emergency_phone | TEXT | No | Emergency contact |
| notes | TEXT | No | Medical notes |
| is_active | BOOLEAN | Yes | Soft delete |
| created_by | UUID | No | FK to users |
| created_at | TIMESTAMPTZ | Yes | Auto-set |
| updated_at | TIMESTAMPTZ | Yes | Auto-set |

---

### Appointments Table

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES users(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT,
  status TEXT CHECK (status IN ('scheduled','completed','cancelled','no_show')) DEFAULT 'scheduled',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| clinic_id | UUID | Yes | FK to clinics |
| patient_id | UUID | Yes | FK to patients |
| doctor_id | UUID | No | FK to users (doctor) |
| appointment_date | DATE | Yes | Appointment date |
| appointment_time | TIME | Yes | Appointment time |
| reason | TEXT | No | Reason for visit |
| status | TEXT | Yes | scheduled/completed/cancelled/no_show |
| notes | TEXT | No | Additional notes |
| created_by | UUID | No | FK to users |
| created_at | TIMESTAMPTZ | Yes | Auto-set |
| updated_at | TIMESTAMPTZ | Yes | Auto-set |

---

## TypeScript Types

```typescript
// types/index.ts

export interface Clinic {
  id: string
  name: string
  specialty: string | null
  city: string | null
  phone: string | null
  email: string | null
  address: string | null
  logo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  clinic_id: string
  full_name: string
  username: string
  email: string
  phone: string | null
  password: string
  role: 'doctor' | 'secretary'
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  clinic_id: string
  full_name: string
  phone: string
  email: string | null
  gender: 'male' | 'female' | null
  date_of_birth: string | null
  blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null
  address: string | null
  city: string | null
  emergency_phone: string | null
  notes: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  clinic_id: string
  patient_id: string
  patient_name?: string
  doctor_name?: string | null
  appointment_date: string
  appointment_time: string
  reason: string | null
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  clinic_id: string
  full_name: string
  role: 'doctor' | 'secretary'
}
```