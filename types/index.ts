// User type
export interface User {
  id: string;
  email: string;
  created_at: string;
}

// Diary Entry type
export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  photo_url?: string;
}

// Settings type
export interface UserSettings {
  daily_reminders: boolean;
  reminder_time: string;
  alarm_sound: boolean;
  entry_prompts: boolean;
  on_this_day: boolean;
  user_id: string;
}

// Auth Context type
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}
