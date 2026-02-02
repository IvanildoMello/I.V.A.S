import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env for the client-side code
      // This maps the Vercel Environment Variables to the process.env.VARIABLE syntax used in your code
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.REACT_APP_SUPABASE_URL': JSON.stringify(env.REACT_APP_SUPABASE_URL),
      'process.env.REACT_APP_SUPABASE_ANON_KEY': JSON.stringify(env.REACT_APP_SUPABASE_ANON_KEY),
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    },
  };
});