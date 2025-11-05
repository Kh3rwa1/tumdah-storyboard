/*
  # Tumdah AI Studio Database Schema

  ## Overview
  This migration creates the core tables for Tumdah AI Studio to store user characters 
  and generated scenes with proper security policies.

  ## New Tables

  ### `saved_characters`
  Stores user-uploaded characters that can be reused across scenes
  - `id` (uuid, primary key) - Unique identifier for the character
  - `user_id` (uuid, foreign key) - Links to auth.users, identifies the owner
  - `name` (text) - User-defined name for the character
  - `image_url` (text) - URL to the stored character image
  - `created_at` (timestamptz) - When the character was saved
  - `updated_at` (timestamptz) - Last modification time

  ### `generated_scenes`
  Stores all AI-generated scenes with their configurations
  - `id` (uuid, primary key) - Unique identifier for the scene
  - `user_id` (uuid, foreign key) - Links to auth.users, identifies the owner
  - `image_url` (text) - URL to the generated scene image
  - `action_prompt` (text) - The action description used
  - `background_prompt` (text) - The background description used
  - `aspect_ratio` (text) - Aspect ratio used (e.g., "16:9 landscape")
  - `shot_type` (text) - Shot type metadata
  - `is_subject_removed` (boolean) - Whether subject was removed
  - `is_scene_locked` (boolean) - Whether scene was locked
  - `created_at` (timestamptz) - When the scene was generated

  ## Security
  - RLS enabled on both tables
  - Users can only access their own data
  - Authenticated users required for all operations
  - Policies for SELECT, INSERT, UPDATE, DELETE operations

  ## Important Notes
  - All timestamps use `timestamptz` for timezone awareness
  - Foreign keys enforce referential integrity with auth.users
  - Indexes on user_id for fast queries
  - Default values set for timestamps and booleans
*/

-- Create saved_characters table
CREATE TABLE IF NOT EXISTS saved_characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create index for fast user queries
CREATE INDEX IF NOT EXISTS idx_saved_characters_user_id ON saved_characters(user_id);

-- Enable RLS on saved_characters
ALTER TABLE saved_characters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_characters
CREATE POLICY "Users can view own characters"
  ON saved_characters FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own characters"
  ON saved_characters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own characters"
  ON saved_characters FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own characters"
  ON saved_characters FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create generated_scenes table
CREATE TABLE IF NOT EXISTS generated_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  action_prompt text DEFAULT '' NOT NULL,
  background_prompt text DEFAULT '',
  aspect_ratio text DEFAULT '16:9 landscape' NOT NULL,
  shot_type text DEFAULT '',
  is_subject_removed boolean DEFAULT false NOT NULL,
  is_scene_locked boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create index for fast user queries
CREATE INDEX IF NOT EXISTS idx_generated_scenes_user_id ON generated_scenes(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_scenes_created_at ON generated_scenes(created_at DESC);

-- Enable RLS on generated_scenes
ALTER TABLE generated_scenes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generated_scenes
CREATE POLICY "Users can view own scenes"
  ON generated_scenes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scenes"
  ON generated_scenes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scenes"
  ON generated_scenes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scenes"
  ON generated_scenes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on saved_characters
CREATE TRIGGER update_saved_characters_updated_at
  BEFORE UPDATE ON saved_characters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
