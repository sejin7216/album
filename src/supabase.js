import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iackbsamzpuzmjtwtkkn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhY2tic2FtenB1em1qdHd0a2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDg3NTUsImV4cCI6MjA4MTA4NDc1NX0.LnDoVUlTKyl3OPo6hf9zePO-VfrMFmk7mJZeqPFvHzQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
