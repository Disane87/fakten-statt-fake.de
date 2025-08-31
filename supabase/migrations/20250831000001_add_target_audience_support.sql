-- Migration: add_target_audience_and_mentioned_persons_support
-- This migration adds support for target audience detection and mentioned persons extraction in fact checking

-- Create enum for common target audiences
CREATE TYPE target_audience_enum AS ENUM (
  'general_public',
  'professionals',
  'experts',
  'children',
  'young_adults',
  'elderly',
  'parents',
  'voters',
  'consumers',
  'students',
  'specific_group'
);

-- Add comment to document the target audience feature
COMMENT ON TYPE target_audience_enum IS 'Enum for defining target audiences in fact checking results';

-- Add comment to document the mentioned persons feature
-- Note: mentionedPersons will be stored as string array in JSONB format
-- Examples: ["Angela Merkel", "Dr. Anthony Fauci", "Elon Musk", "Prof. Dr. Christian Drosten"]

-- Note: The claims table already stores results as JSONB, so no structural changes needed
-- Both targetAudience and mentionedPersons fields will be automatically supported in the JSON structure
