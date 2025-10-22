import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://lmjsnvqjntyyorvmxyib.supabase.co"
const supabaseKey = "sb_publishable_aeWD6oACdSDgfqi4csNVwA_FwYORzpU"

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})