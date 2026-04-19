-- =====================
-- 4. APPOINTMENTS
-- =====================
create table appointments (
  id                uuid default gen_random_uuid() primary key,
  clinic_id         uuid references clinics(id) on delete cascade not null,
  patient_id        uuid references patients(id) on delete cascade not null,
  appointment_date  date not null,
  appointment_time  time not null,
  reason            text,
  status            text check (status in ('scheduled','completed','cancelled','no_show')) default 'scheduled',
  notes             text,
  created_by        uuid references users(id),
  created_at        timestamp default now(),
  updated_at        timestamp default now()
);

-- Disable RLS (MVP)
alter table appointments disable row level security;

-- Auto-update updated_at
create trigger appointments_updated_at
  before update on appointments
  for each row execute function update_updated_at();

-- Index for fast clinic lookups
create index appointments_clinic_date_idx on appointments(clinic_id, appointment_date);
