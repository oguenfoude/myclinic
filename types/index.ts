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
  gender: 'male' | 'female' | null
  medical_studies: string | null
  price: number
  is_active: boolean
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

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'

export interface Appointment {
  id: string
  clinic_id: string
  patient_id: string
  appointment_date: string
  appointment_time: string
  reason: string | null
  status: AppointmentStatus
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}
