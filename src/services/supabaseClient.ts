import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dahsgteneyeeqfyxeobc.supabase.co' // Pega tu URL aquí
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaHNndGVuZXllZXFmeXhlb2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzAzNzEsImV4cCI6MjA2OTY0NjM3MX0.KBsZIpbVnpelQIda8AqQEtbwvGgA-Mm3cqsqcMhVGR0' // Pega tu llave anónima aquí

export const supabase = createClient(supabaseUrl, supabaseAnonKey);