-- Fix search_path security warning for current_user_id function
-- Run this in Supabase SQL Editor if you want to silence the warning

ALTER FUNCTION public.current_user_id() SET search_path = public, pg_temp;
