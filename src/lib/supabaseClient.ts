import { createClient } from '@supabase/supabase-js'

// Utilisation des variables d'environnement Netlify
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables Supabase manquantes dans .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)