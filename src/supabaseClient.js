import { createClient } from '@supabase/supabase-js'

// Pakai URL yang tadi kamu copy sampai '.co' saja
const supabaseUrl = 'https://jrvyhbyzoymnyjegvonc.supabase.co'

// Masukkan Key yang diawali dengan 'sb_publishable_...' yang tadi kamu copy
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydnloYnl6b3ltbnlqZWd2b25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDk1NDYsImV4cCI6MjA5NTU4NTU0Nn0.V942BruxsrvSCllYcik7H0MOg6iBBnE-74kqyffS-kM'

export const supabase = createClient(supabaseUrl, supabaseKey)