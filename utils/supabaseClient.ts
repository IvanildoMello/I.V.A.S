import { createClient } from '@supabase/supabase-js';

// Prioritize environment variables for Vercel/Production deployment.
// Fallback to hardcoded values for local development or quickstart.
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ceofktexcmwypzgxgert.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Yq3ChsaaSvmLigbsmarOeA_vuqdHAYd';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);