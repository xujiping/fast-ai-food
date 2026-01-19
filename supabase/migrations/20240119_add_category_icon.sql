-- 给 ingredients 表添加 category 和 icon 字段
ALTER TABLE ingredients 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '其他',
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '🥘';

-- 可选：为 category 添加索引以加速查询
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients(category);

-- 注释
COMMENT ON COLUMN ingredients.category IS '食材分类，如：蔬菜、肉禽、海鲜等';
COMMENT ON COLUMN ingredients.icon IS '食材图标（Emoji）';
