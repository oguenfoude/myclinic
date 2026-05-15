-- Add medical_studies (exams) column to patients table
-- This is an optional free-text field for exam results, lab work, etc.
ALTER TABLE patients ADD COLUMN IF NOT EXISTS medical_studies TEXT;
