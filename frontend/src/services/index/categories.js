import { supabase } from "../../config/supabase";

// Fetch all categories
export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

// Add a new category
export const addCategory = async (category, slug) => {
  const { data, error } = await supabase
    .from("categories")
    .insert([{ category, slug }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Update a category
export const updateCategory = async (id, updates) => {
  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Delete a category
export const deleteCategory = async (id) => {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
};
