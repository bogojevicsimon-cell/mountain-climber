/*
  # Add last_relapse_at column to profiles

  1. Changes
    - Add `last_relapse_at` column (timestamptz, nullable) to `profiles` table
      This tracks the exact timestamp of the user's most recent relapse,
      enabling a live countdown timer showing time clean since last relapse.

  2. Security
    - No RLS changes needed; existing policies already govern access to profiles
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_relapse_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN last_relapse_at timestamptz;
  END IF;
END $$;
