# Calisthenics PWA V4

V4 adds Supabase login + cloud sync.

## Setup

1. Create a Supabase project.
2. In Supabase > SQL Editor, run `supabase-schema.sql`.
3. In Supabase > Project Settings > API, copy:
   - Project URL
   - anon public key
4. Paste them into `supabase-config.js`.
5. Upload the files to GitHub Pages / Netlify / your subdomain.

## Important

The app still saves locally first, then syncs to Supabase when logged in.
If Supabase is not configured, the app still works locally.
