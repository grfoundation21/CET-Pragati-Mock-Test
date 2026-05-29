import { createClient } from '@supabase/supabase-js'

const url = 'https://anflmoivqsjcrrxrwtta.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuZmxtb2l2cXNqY3JyeHJ3dHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDYwMTEsImV4cCI6MjA5NTEyMjAxMX0.sPwB4de4cXnrGqK6oXbuMHIn3VpNaEN1gAU7bGoVFXs'

export const supabase = createClient(url, key)
