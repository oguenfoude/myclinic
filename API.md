# API.md — MyClinic API Reference

This document contains detailed information about all data operations, components, and state management in MyClinic.

---

## Complete Supabase Operations

### Patients

```typescript
import { supabase } from '@/lib/supabase'
import { Patient } from '@/types'

// Fetch all patients for a clinic
const { data, error } = await supabase
  .from('patients')
  .select('*')
  .eq('clinic_id', clinicId)
  .eq('is_active', true)
  .order('created_at', { ascending: false })

// Fetch single patient
const { data, error } = await supabase
  .from('patients')
  .select('*')
  .eq('id', patientId)
  .single()

// Create patient
const { data, error } = await supabase
  .from('patients')
  .insert({
    clinic_id: authUser.clinic_id,
    full_name: form.full_name,
    phone: form.phone,
    email: form.email || null,
    gender: form.gender || null,
    date_of_birth: form.date_of_birth || null,
    blood_type: form.blood_type || null,
    address: form.address || null,
    city: form.city || null,
    emergency_phone: form.emergency_phone || null,
    notes: form.notes || null,
  })

// Update patient
const { data, error } = await supabase
  .from('patients')
  .update({
    full_name: form.full_name,
    phone: form.phone,
    // ...other fields
  })
  .eq('id', patientId)

// Soft delete (deactivate) patient
const { data, error } = await supabase
  .from('patients')
  .update({ is_active: false })
  .eq('id', patientId)
```

### Appointments

```typescript
import { Appointment } from '@/types'

// Fetch appointments with patient name join
const { data, error } = await supabase
  .from('appointments')
  .select('*, patients(full_name)')
  .eq('clinic_id', clinicId)
  .order('appointment_date', { ascending: true })
  .order('appointment_time', { ascending: true })

// Create appointment
const { data, error } = await supabase
  .from('appointments')
  .insert({
    clinic_id: authUser.clinic_id,
    patient_id: form.patient_id,
    appointment_date: form.appointment_date,
    appointment_time: form.appointment_time,
    reason: form.reason || null,
  })

// Update appointment status
const { data, error } = await supabase
  .from('appointments')
  .update({ status: 'completed' })
  .eq('id', appointmentId)

// Cancel appointment
const { data, error } = await supabase
  .from('appointments')
  .update({ status: 'cancelled' })
  .eq('id', appointmentId)
```

### Users (Authentication)

```typescript
// Login - find user by username and password
const { data, error } = await supabase
  .from('users')
  .select('id, clinic_id, full_name, role, password, is_active')
  .eq('username', username)
  .single()

// Update last login
await supabase
  .from('users')
  .update({ last_login: new Date().toISOString() })
  .eq('id', userId)

// Create secretary (doctor only)
const { data, error } = await supabase
  .from('users')
  .insert({
    clinic_id: authUser.clinic_id,
    full_name: form.full_name,
    username: form.username.toLowerCase(),
    email: form.email?.toLowerCase() || `sec_${Date.now()}@clinic.local`,
    phone: form.phone || null,
    password: form.password,
    role: 'secretary',
    is_active: true,
  })

// Deactivate user
await supabase
  .from('users')
  .update({ is_active: false })
  .eq('id', userId)
```

### Clinics

```typescript
// Fetch clinic
const { data, error } = await supabase
  .from('clinics')
  .select('*')
  .eq('id', clinicId)
  .single()

// Update clinic
const { data, error } = await supabase
  .from('clinics')
  .update({
    name: clinicForm.name,
    specialty: clinicForm.specialty,
    city: clinicForm.city || null,
    phone: clinicForm.phone || null,
    email: clinicForm.email || null,
    address: clinicForm.address || null,
  })
  .eq('id', clinicId)
```

---

## Component Props

### Sidebar.tsx

```typescript
interface SidebarProps {
  activeTab: 'patients' | 'appointments' | 'settings'
  onTabChange: (tab: 'patients' | 'appointments' | 'settings') => void
}
```

### PatientDialog.tsx

```typescript
import { Patient, AuthUser } from '@/types'

interface PatientDialogProps {
  patient: Patient | null      // null = add mode, existing = edit mode
  authUser: AuthUser
  onClose: () => void
  onSave: () => void
}
```

### AppointmentDialog.tsx

```typescript
import { Appointment, Patient, AuthUser } from '@/types'

interface AppointmentDialogProps {
  appointment: Appointment | null  // null = add mode
  patients: Patient[]
  authUser: AuthUser
  onClose: () => void
  onSave: () => void
}
```

---

## State Management

### Complete State Tree

```typescript
// Dashboard page state
const [authUser, setAuthUser] = useState<AuthUser | null>(null)
const [activeTab, setActiveTab] = useState<'patients' | 'appointments' | 'settings'>('patients')

// Patients tab
const [patients, setPatients] = useState<Patient[]>([])
const [patientSearch, setPatientSearch] = useState('')
const [patientDialogOpen, setPatientDialogOpen] = useState(false)
const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

// Appointments tab
const [appointments, setAppointments] = useState<Appointment[]>([])
const [apptFilter, setApptFilter] = useState<'all' | 'today' | 'scheduled'>('all')
const [apptSearch, setApptSearch] = useState('')
const [apptDialogOpen, setApptDialogOpen] = useState(false)
const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)

// Settings tab (doctor only)
const [clinicForm, setClinicForm] = useState({ name: '', specialty: '', ... })
const [secretaries, setSecretaries] = useState<User[]>([])
const [secForm, setSecForm] = useState({ full_name: '', username: '', ... })
```

### Derived State

```typescript
// Filtered patients
const filteredPatients = patients.filter(p => 
  p.full_name.toLowerCase().includes(search.toLowerCase()) ||
  p.phone.includes(search)
)

// Filtered appointments
const filteredAppts = appointments.filter(a => {
  if (filter === 'today' && a.appointment_date !== today) return false
  if (filter === 'scheduled' && a.status !== 'scheduled') return false
  return true
})
```

---

## Form Validation

### Patient Form

```typescript
const validate = (): boolean => {
  if (!form.full_name.trim()) {
    setError(t.errorRequired)
    return false
  }
  if (!form.phone.trim()) {
    setError(t.errorRequired)
    return false
  }
  return true
}
```

### Login Form

```typescript
const validate = (): boolean => {
  if (!username.trim() || !password.trim()) {
    setError(t.errorRequired)
    return false
  }
  return true
}
```

### Registration

```typescript
// Step 1 validation
if (!doctor.full_name.trim()) errors.full_name = t.errorRequired
if (!doctor.username.trim()) errors.username = t.errorRequired
if (!doctor.email.trim()) errors.email = t.errorRequired
if (!doctor.password.trim()) errors.password = t.errorRequired

// Step 2 validation
if (!clinic.name.trim()) errors.clinic_name = t.errorRequired
if (!clinic.specialty.trim()) errors.clinic_specialty = t.errorRequired
```

---

## Hooks Used

| Hook | Component | Purpose |
|------|-----------|---------|
| `useState` | All | Local component state |
| `useEffect` | Dashboard | Load data on mount, auth check |
| `useCallback` | Dashboard | Memoized data loading |
| `useT` | All | Translations |
| `useRouter` | Multiple | Navigation |

---

## Authentication Flow

```typescript
// Check if logged in
useEffect(() => {
  const stored = localStorage.getItem('clinic_user')
  if (stored) {
    const user = JSON.parse(stored) as AuthUser
    setAuthUser(user)
    loadPatients()
    loadAppointments()
  } else {
    router.replace('/login')
  }
}, [])

// Login
const handleLogin = async () => {
  const { data } = await supabase
    .from('users')
    .select('id, clinic_id, full_name, role, password, is_active')
    .eq('username', username)
    .single()
  
  if (data && data.password === password && data.is_active) {
    localStorage.setItem('clinic_user', JSON.stringify({
      id: data.id,
      clinic_id: data.clinic_id,
      full_name: data.full_name,
      role: data.role,
    }))
    router.push('/dashboard')
  }
}

// Logout
const handleLogout = () => {
  localStorage.removeItem('clinic_user')
  router.push('/login')
}
```

---

## Data Loading Functions

```typescript
const loadPatients = useCallback(async () => {
  const { data } = await supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', authUser.clinic_id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  if (data) setPatients(data as Patient[])
}, [authUser])

const loadAppointments = useCallback(async () => {
  const { data } = await supabase
    .from('appointments')
    .select('*, patients(full_name)')
    .eq('clinic_id', authUser.clinic_id)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })
  
  if (data) {
    setAppointments(data.map(a => ({
      ...a,
      patient_name: a.patients?.full_name || '—',
    })) as Appointment[])
  }
}, [authUser])

const loadClinic = useCallback(async () => {
  const { data } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', authUser.clinic_id)
    .single()
  
  if (data) {
    setClinicForm({
      name: data.name || '',
      specialty: data.specialty || '',
      // ...
    })
  }
}, [authUser])

const loadSecretaries = useCallback(async () => {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('clinic_id', authUser.clinic_id)
    .eq('role', 'secretary')
    .order('created_at', { ascending: false })
  
  if (data) setSecretaries(data as User[])
}, [authUser])
```

---

## Error Handling

```typescript
try {
  const { data, error } = await supabase.from('table').select('*')
  if (error) throw error
} catch (error) {
  console.error('Error:', error)
  setError(t.errorGeneric)
}
```

### Error Messages (from i18n)

| Key | English | French | Arabic |
|-----|---------|--------|--------|
| errorRequired | This field is required | Ce champ est requis | هذا الحقل مطلوب |
| errorUserExists | Username or email already in use | Identifiant déjà utilisé | مستخدم بالفعل |
| errorWrongCredentials | Incorrect credentials | Identifiants incorrects | غير صحيحة |
| errorGeneric | An error occurred | Une erreur est survenue | خطأ |

---

## Internationalization Keys

Key translation system in `lib/i18n.ts`:

```typescript
const translations = {
  ar: { appName: 'عيادتي', ... },
  fr: { appName: 'MaClinic', ... },
  en: { appName: 'MyClinic', ... },
} as const
```

### Common Keys

- `appName` - App name
- `patients` - Patients tab
- `appointments` - Appointments tab
- `settings` - Settings tab
- `logout` - Logout button
- `addPatient` - Add patient button
- `addAppointment` - Add appointment button
- `save` - Save button
- `cancel` - Cancel button
- `edit` - Edit button
- `deactivate` - Deactivate button
- `fullName` - Full name label
- `phone` - Phone label
- `searchPlaceholder` - Search input placeholder
- `statusScheduled` - Scheduled status
- `statusCompleted` - Completed status
- `statusCancelled` - Cancelled status
- `statusNoShow` - No show status

---

## Status Colors

| Status | Tailwind Class | Use |
|--------|--------------|-----|
| scheduled | `bg-blue-100 text-blue-700` | Blue pill |
| completed | `bg-green-100 text-green-700` | Green pill |
| cancelled | `bg-gray-100 text-gray-500` | Gray pill |
| no_show | `bg-red-100 text-red-600` | Red pill |

---

## Role-Based Access

```typescript
// Only show Settings tab for doctors
const navItems = [
  { id: 'patients', label: t.patients, icon: <PatientsIcon /> },
  { id: 'appointments', label: t.appointments, icon: <CalendarIcon /> },
  ...(authUser?.role === 'doctor' 
    ? [{ id: 'settings', label: t.settings, icon: <SettingsIcon /> }]
    : []),
]
```

---

## Responsive Design

| Breakpoint | Class | Width |
|-----------|-------|-------|
| Default | - | < 640px |
| sm: | sm: | 640px+ |
| md: | md: | 768px+ |
| lg: | lg: | 1024px+ |
| xl: | xl: | 1280px+ |

### Mobile Patterns

```typescript
// Hide on mobile, show on desktop
<div className="hidden md:block">Desktop only</div>

// Show on mobile, hide on desktop
<div className="md:hidden">Mobile only</div>

// RTL support
<div className={isRTL ? 'flex-row-reverse' : ''}>Content</div>
```