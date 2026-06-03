import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton client (safe for browser & SSR)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { params: { eventsPerSecond: 20 } },
})
