// Browser-side Supabase client using @supabase/ssr.
// The sb_publishable_... key format requires createBrowserClient — not the
// legacy createClient from @supabase/supabase-js.
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseKey)
