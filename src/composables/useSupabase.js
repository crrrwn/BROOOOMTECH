import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jcxctogtvqtqnevkgzjw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjeGN0b2d0dnF0cW5ldmtnemp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNzk5ODUsImV4cCI6MjA2NDg1NTk4NX0.qM851z_mQYYXfvLfWqNNIQVNEH9N12LVkm1CNPmDuAk'

export const supabase = createClient(supabaseUrl, supabaseKey)

export const useSupabase = () => {
  return {
    supabase
  }
}
