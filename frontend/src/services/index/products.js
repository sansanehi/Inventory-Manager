import { supabase } from "../../config/supabase";

export const fetchProducts = async (userId) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

export const addProduct = async (userId, product) => {
  const { data, error } = await supabase
    .from("products")
    .insert([{ ...product, user_id: userId }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateProduct = async (productId, updates) => {
  const { data, error } = await supabase
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", productId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteProduct = async (productId) => {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) throw new Error(error.message);
};

export const subscribeToProducts = (userId, onChange) => {
  return supabase
    .channel("products-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "products",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onChange(payload.new);
      }
    )
    .subscribe();
};

export async function fetchCategories() {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) throw error;
  return data;
}
