import { supabase } from "../../config/supabase";

// Fetch all customers
export const fetchCustomers = async () => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

// Add a new customer
export const addCustomer = async (customer) => {
  const { data, error } = await supabase
    .from("customers")
    .insert([customer])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Update a customer
export const updateCustomer = async (id, updates) => {
  const { data, error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Delete a customer
export const deleteCustomer = async (id) => {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw new Error(error.message);
};
