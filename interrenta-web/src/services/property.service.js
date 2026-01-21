import { supabase } from "./supabase";

export const getAllProperties = () =>
  supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

export const createProperty = (data) =>
  supabase.from("properties").insert([data]);

export const updateProperty = (id, data) =>
  supabase.from("properties").update(data).eq("id", id);

export const deleteProperty = (id) =>
  supabase.from("properties").delete().eq("id", id);