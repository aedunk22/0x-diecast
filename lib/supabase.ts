import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lkockqprytnkkqpjgobb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_9A-hk_OLCnS-niNCbhq6NA_S3Wkm';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);