import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://awjsbophfkiqortnejoy.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3anNib3BoZmtpcW9ydG5lam95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzcwMjUsImV4cCI6MjA3NzUxMzAyNX0.4RwEKVvRQ7bUDkIZ_9M7QkE8Axs-Y9ovDGRJoc4cVWk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
