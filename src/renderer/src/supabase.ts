import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pvhxvmlguevrnpztfkhp.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aHh2bWxndWV2cm5wenRma2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTczNjksImV4cCI6MjA3MzY5MzM2OX0.DwdZm7NlrjzzTrFECKBq6oBUK8wFWO4UaY5xzNAHE - M'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
