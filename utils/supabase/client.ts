// Canonical browser-side Supabase client.
// Import this in any 'use client' component or client-side utility.
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const createClient = () => createBrowserClient(supabaseUrl, supabaseKey)
