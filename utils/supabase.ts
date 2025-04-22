import "react-native-url-polyfill/auto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";

// Debug logs
console.log("Supabase initialization: URL defined =", Boolean(SUPABASE_URL));
console.log(
  "Supabase initialization: KEY defined =",
  Boolean(SUPABASE_ANON_KEY)
);

let supabase: SupabaseClient;

try {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase credentials");
  }
  // Create a single supabase client for interacting with your database
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("Supabase client initialized successfully");
} catch (error) {
  console.error("Error creating Supabase client:", error);
  // Provide a fallback client that won't actually work but won't crash the app
  supabase = {
    auth: {
      signUp: () => {
        console.error(
          "Attempted to use signUp with uninitialized Supabase client"
        );
        return Promise.resolve({
          error: new Error("Supabase client failed to initialize"),
        });
      },
      signInWithPassword: () =>
        Promise.resolve({
          error: new Error("Supabase client failed to initialize"),
        }),
      signOut: () =>
        Promise.resolve({
          error: new Error("Supabase client failed to initialize"),
        }),
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({ order: () => ({ data: [], error: null }) }),
      }),
      insert: () => ({
        select: () => ({ single: () => ({ data: null, error: null }) }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({ single: () => ({ data: null, error: null }) }),
        }),
      }),
      delete: () => ({ eq: () => ({ data: null, error: null }) }),
    }),
  } as unknown as SupabaseClient;
}

export { supabase };

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
  try {
    console.log(
      "Creating diary entry with data:",
      JSON.stringify(entryData, null, 2)
    );

    // Do a simple insert without trying to get the result back
    const { error: insertError } = await supabase
      .from("diary_entries")
      .insert(entryData);

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      throw insertError;
    }

    // Use a more specific query to get only the entry we just created
    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("user_id", entryData.user_id)
      .eq("created_at", entryData.created_at)
      .eq("title", entryData.title)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Supabase error selecting created entry:", error);
      // Don't throw here, just return a success indicator
      return { success: true };
    }

    console.log("Diary entry created successfully:", data[0]);
    return data[0];
  } catch (e) {
    console.error("Exception in createDiaryEntry:", e);
    if (e instanceof Error) {
      throw e;
    } else {
      console.error("Non-error exception:", typeof e, JSON.stringify(e));
      throw new Error("Unknown database error");
    }
  }
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

export const testSupabaseConnection = async () => {
  try {
    // Check if we can get a simple query to work
    const { data, error } = await supabase
      .from("diary_entries")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Supabase connection test failed:", error);
      return {
        success: false,
        error: error.message,
        details: error,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (e) {
    console.error("Exception during Supabase connection test:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
      exception: e,
    };
  }
};

export const createDiaryEntrySimple = async (entryData: any) => {
  try {
    console.log("Using simplified diary entry creation");

    // Use the most basic insert approach possible
    const { error } = await supabase.from("diary_entries").insert(entryData);

    if (error) {
      console.error("Simple insert error:", error);
      throw error;
    }

    return { success: true };
  } catch (e) {
    console.error("Exception in createDiaryEntrySimple:", e);
    throw e;
  }
};

export const createTablesIfNotExist = async () => {
  try {
    console.log("Checking if tables exist and creating if needed...");

    // First, let's try to query the diary_entries table to see if it exists
    const { error: checkError } = await supabase
      .from("diary_entries")
      .select("id")
      .limit(1);

    if (checkError && checkError.code === "42P01") {
      console.log("diary_entries table doesn't exist, creating it...");

      // Create the diary_entries table
      // Note: This requires that your service role key has permission to execute SQL
      const { error: createError } = await supabase.rpc("create_diary_tables");

      if (createError) {
        console.error("Error creating tables:", createError);
        return {
          success: false,
          error: createError.message,
        };
      }

      console.log("Tables created successfully");
      return { success: true };
    } else if (checkError) {
      console.error("Error checking if table exists:", checkError);
      return {
        success: false,
        error: checkError.message,
      };
    }

    console.log("Tables already exist");
    return { success: true };
  } catch (e) {
    console.error("Exception in createTablesIfNotExist:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
};

// Function to find tables that may have been created with a different name
export const findAlternativeTables = async () => {
  try {
    console.log("Looking for alternative table names...");

    // List of possible alternative table names
    const possibleTableNames = [
      "diary_entry",
      "entries",
      "diaries",
      "diary",
      "user_diary_entries",
    ];

    let foundTable = null;

    // Check each possible table name
    for (const tableName of possibleTableNames) {
      console.log(`Checking if table '${tableName}' exists...`);
      const { error } = await supabase.from(tableName).select("id").limit(1);

      if (!error || error.code !== "42P01") {
        // Table exists or some other error occurred
        console.log(`Found potential table: ${tableName}`);
        foundTable = tableName;
        break;
      }
    }

    return {
      success: !!foundTable,
      tableName: foundTable,
    };
  } catch (e) {
    console.error("Error finding alternative tables:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
};

// Create a diary entry using an alternative table name
export const createDiaryEntryAlternative = async (
  entryData: any,
  tableName: string
) => {
  try {
    console.log(`Creating diary entry in alternative table: ${tableName}`);

    const { error } = await supabase.from(tableName).insert(entryData);

    if (error) {
      console.error(`Error inserting into ${tableName}:`, error);
      throw error;
    }

    return { success: true, tableName };
  } catch (e) {
    console.error(`Error in createDiaryEntryAlternative:`, e);
    throw e;
  }
};

// Add this function to create the storage bucket
export const createStorageBucket = async () => {
  try {
    console.log("Checking if 'diary_images' bucket exists...");

    // First try to list all buckets to see if ours exists
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error("Error listing buckets:", listError);
      return {
        success: false,
        error: listError.message,
      };
    }

    const bucketExists = buckets.some(
      (bucket) => bucket.name === "diary_images"
    );

    if (!bucketExists) {
      console.log("Bucket 'diary_images' not found, creating it...");

      // Create the bucket
      const { error: createError } = await supabase.storage.createBucket(
        "diary_images",
        {
          public: true, // Make it public so we can access files without signed URLs
          fileSizeLimit: 10485760, // 10MB
        }
      );

      if (createError) {
        console.error("Error creating bucket:", createError);
        // Don't return error - continue with alternate approach
        console.log("Using alternative approach for image storage...");
        return {
          success: false,
          error: createError.message,
          shouldUseBase64: true,
        };
      }

      console.log("Bucket 'diary_images' created successfully");
      return { success: true };
    }

    console.log("Bucket 'diary_images' already exists");
    return { success: true };
  } catch (e) {
    console.error("Exception in createStorageBucket:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
      shouldUseBase64: true,
    };
  }
};

// Function to convert image to base64
export const imageToBase64 = async (uri: string): Promise<string | null> => {
  console.log("Starting imageToBase64 conversion for:", uri);

  if (!uri) {
    console.error("Invalid URI provided to imageToBase64");
    return null;
  }

  try {
    // Special handling for file:// URIs on iOS
    if (uri.startsWith("file://")) {
      try {
        console.log("Reading local file URI:", uri);
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        console.log("Successfully read local file as base64");
        return `data:image/jpeg;base64,${base64}`;
      } catch (fileError) {
        console.error("Failed to read local file:", fileError);
        // Fall back to fetch method
      }
    }

    // Standard approach for remote or Android URIs
    console.log("Fetching image using fetch API");
    const response = await fetch(uri);

    if (!response.ok) {
      console.error(
        "Fetch response not OK:",
        response.status,
        response.statusText
      );
      return null;
    }

    const blob = await response.blob();

    if (!blob || blob.size === 0) {
      console.error("Image blob is empty or invalid");
      return null;
    }

    console.log("Image blob received, size:", blob.size, "bytes");

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        console.log("FileReader loaded successfully");
        resolve(reader.result as string);
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(error);
      };

      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error in imageToBase64:", error);
    return null;
  }
};

// Function to migrate base64 images to storage bucket
export const migrateImagesToStorage = async (userId: string) => {
  try {
    console.log("Checking for entries with base64 images to migrate...");

    // Try to create the bucket first
    const bucketResult = await createStorageBucket();
    if (!bucketResult.success) {
      console.error("Failed to create storage bucket, can't migrate images");
      return { success: false, error: "Storage bucket not available" };
    }

    // Get all entries with base64 images
    const { data: entries, error: fetchError } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("user_id", userId)
      .not("photo_base64", "is", null);

    if (fetchError) {
      console.error("Error fetching entries with base64 images:", fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!entries || entries.length === 0) {
      console.log("No entries with base64 images found");
      return { success: true, migrated: 0 };
    }

    console.log(
      `Found ${entries.length} entries with base64 images to migrate`
    );
    let migratedCount = 0;

    // Process each entry
    for (const entry of entries) {
      try {
        if (!entry.photo_base64) continue;

        // Convert base64 to blob
        const base64Response = await fetch(entry.photo_base64);
        const blob = await base64Response.blob();

        // Upload to storage
        const fileName = `migrated_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 15)}.jpg`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("diary_images")
          .upload(filePath, blob);

        if (uploadError) {
          console.error(
            `Error uploading image for entry ${entry.id}:`,
            uploadError
          );
          continue;
        }

        // Get the URL
        const { data: urlData } = supabase.storage
          .from("diary_images")
          .getPublicUrl(filePath);

        if (!urlData || !urlData.publicUrl) {
          console.error(`Failed to get public URL for entry ${entry.id}`);
          continue;
        }

        // Update the entry
        const { error: updateError } = await supabase
          .from("diary_entries")
          .update({
            photo_url: urlData.publicUrl,
            photo_base64: null,
          })
          .eq("id", entry.id);

        if (updateError) {
          console.error(`Error updating entry ${entry.id}:`, updateError);
          continue;
        }

        migratedCount++;
        console.log(`Successfully migrated image for entry ${entry.id}`);
      } catch (entryError) {
        console.error(`Error processing entry ${entry.id}:`, entryError);
      }
    }

    console.log(
      `Migration complete. Migrated ${migratedCount} of ${entries.length} images`
    );
    return { success: true, migrated: migratedCount, total: entries.length };
  } catch (e) {
    console.error("Error in image migration:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
};
