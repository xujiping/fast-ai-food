ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cuisine_type VARCHAR(50);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes(cuisine_type);
