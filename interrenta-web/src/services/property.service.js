import { supabase } from "./supabase";

// Generar código único IR##### (5 dígitos)
const generatePropertyCode = async () => {
  // Obtener el último código generado
  const { data: lastProperty } = await supabase
    .from("properties")
    .select("code")
    .like("code", "IR%")
    .order("code", { ascending: false })
    .limit(1);

  let nextNumber = 1;

  if (lastProperty && lastProperty.length > 0 && lastProperty[0].code) {
    const lastCode = lastProperty[0].code;
    const lastNumber = parseInt(lastCode.replace("IR", ""), 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  // Formato: IR + 5 dígitos (ej: IR00001)
  return `IR${nextNumber.toString().padStart(5, "0")}`;
};

export const getAllProperties = () =>
  supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

export const getPropertyByCode = (code) =>
  supabase.from("properties").select("*").eq("code", code).single();

export const getPropertyById = (id) =>
  supabase.from("properties").select("*").eq("id", id).single();

export const createProperty = async (data) => {
  // Generar código automático si no se proporciona
  if (!data.code) {
    data.code = await generatePropertyCode();
  }
  return supabase.from("properties").insert([data]).select().single();
};

export const updateProperty = (id, data) =>
  supabase.from("properties").update(data).eq("id", id);

export const deleteProperty = (id) =>
  supabase.from("properties").delete().eq("id", id);
