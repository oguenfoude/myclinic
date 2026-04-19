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
  patient_name?: string // joined
  doctor_name?: string | null
  appointment_date: string   // date YYYY-MM-DD
  appointment_time: string   // time HH:MM
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
