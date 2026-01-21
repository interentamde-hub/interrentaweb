import { supabase } from "./supabase";

export const login = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const logout = () => supabase.auth.signOut();

export const getUser = () => supabase.auth.getUser();
