import { supabase } from "../../config/supabase";

export const fetchSettings = async (userId) => {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return data;
};

export const upsertSettings = async (userId, settings) => {
  const { data, error } = await supabase
    .from("settings")
    .upsert([{ user_id: userId, ...settings }], { onConflict: ["user_id"] });
  if (error) throw new Error(error.message);
  return data;
};

export const subscribeToSettings = (userId, onChange) => {
  return supabase
    .channel("settings-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "settings",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onChange(payload.new);
      }
    )
    .subscribe();
};
