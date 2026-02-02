import { createClient } from '@supabase/supabase-js';

// Credentials provided by user
const SUPABASE_URL = 'https://ceofktexcmwypzgxgert.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Yq3ChsaaSvmLigbsmarOeA_vuqdHAYd';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);