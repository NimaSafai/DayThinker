# DayThinker - Mobile Journaling App

A clean, minimal, and user-friendly mobile journaling app built with React Native and Supabase.

## Features

- 🔐 **Secure Authentication**: Sign up, log in, and log out with user accounts
- 📘 **Diary View**: View all diary entries in a clean grid layout
- 📖 **Entry Reading**: Comfortably read your past entries
- ✍️ **Create & Edit Entries**: Write and edit diary entries with titles, dates, and photos
- ⚙️ **Settings**: Customize app behavior including reminders and prompts
- 🎨 **Beautiful UI**: Clean and minimal design with "Afacad" font

## Technology Stack

- **Frontend**: React Native with TypeScript
- **Backend**: Supabase for authentication and database
- **Storage**: Supabase Storage for images
- **Navigation**: React Navigation
- **Styling**: React Native StyleSheet
- **Icons**: Lucide React Native

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/day-think.git
   cd day-think
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file at the root of the project and add your Supabase credentials:

   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Setup your Supabase project:

   - Create tables for: `users`, `diary_entries`, and `user_settings`
   - Enable storage and create a bucket named `diary_images`

5. Start the development server:

   ```
   npm start
   ```

6. Run on iOS or Android:
   ```
   npm run ios
   # or
   npm run android
   ```

## Database Schema

### Users

- Handled by Supabase Auth

### diary_entries

- `id`: uuid (primary key)
- `user_id`: uuid (references auth.users.id)
- `title`: text
- `content`: text
- `created_at`: timestamp with time zone
- `photo_url`: text (nullable)
- `photo_url64`: text

### user_settings

- `id`: uuid (primary key)
- `user_id`: uuid (references auth.users.id)
- `daily_reminders`: boolean
- `reminder_time`: timestamp with time zone
- `alarm_sound`: boolean
- `entry_prompts`: boolean
- `on_this_day`: boolean

## License

This project is licensed under the MIT License.
# DayThinker
