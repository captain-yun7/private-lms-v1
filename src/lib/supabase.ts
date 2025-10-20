import { createClient } from '@supabase/supabase-js';

// Public client (브라우저에서 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (서버에서 사용 - 모든 권한)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Storage bucket 이름
export const COURSE_FILES_BUCKET = 'course-files';
export const COURSE_THUMBNAILS_BUCKET = 'course-thumbnails';
