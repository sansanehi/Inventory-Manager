import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dwukxszngzhfoldnodrx.supabase.co"; // <-- Replace with your Supabase project URL
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3dWt4c3puZ3poZm9sZG5vZHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NDAzMDAsImV4cCI6MjA2NzExNjMwMH0.3IGzmi-WWAaL23OamXVu2GGuSGU-hPuv5kFeGT_KjGE"; // <-- Replace with your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
