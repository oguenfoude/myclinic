// Browser-side Supabase client — re-exports the canonical client helper.
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseKey)

// Lazy singleton for backward-compatible `import { supabase }` usage.
let _instance: ReturnType<typeof createBrowserClient> | null = null

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_, prop) {
    if (!_instance) _instance = createClient()
    return (_instance as Record<string | symbol, unknown>)[prop]
  },
})
