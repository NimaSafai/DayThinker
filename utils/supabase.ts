import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";

// Create a single supabase client for interacting with your database
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database functions
export const fetchDiaryEntries = async (userId: string) => {
  const { data, error } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

export const createDiaryEntry = async (entryData: any) => {
  const { data, error } = await supabase
    .from("diary_entries")
    .insert(entryData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateDiaryEntry = async (entryId: string, entryData: any) => {
  const { data, error } = await supabase
    .from("diary_entries")
    .update(entryData)
    .eq("id", entryId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteDiaryEntry = async (entryId: string) => {
  const { error } = await supabase
    .from("diary_entries")
    .delete()
    .eq("id", entryId);

  if (error) {
    throw error;
  }

  return true;
};

export const fetchUserSettings = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned" error
    throw error;
  }

  return data;
};

export const updateUserSettings = async (userId: string, settings: any) => {
  // First check if settings exist
  const { data: existingSettings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (existingSettings) {
    // Update existing settings
    const { data, error } = await supabase
      .from("user_settings")
      .update(settings)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } else {
    // Create new settings
    const { data, error } = await supabase
      .from("user_settings")
      .insert({ ...settings, user_id: userId })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
};
