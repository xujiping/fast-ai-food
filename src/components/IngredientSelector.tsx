import { useState, useMemo } from 'react';
import { PRESET_INGREDIENTS, IngredientCategory } from '@/lib/ingredient-data';
import { PantryItem } from '@/store/useRecipeStore';
import { Check, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface IngredientSelectorProps {
  selectedIngredients: string[];
  onSelect: (ingredient: string) => void;
  pantryItems: PantryItem[];
}

export function IngredientSelector({
  selectedIngredients,
  onSelect,
  pantryItems,
}: IngredientSelectorProps) {
  // 构造分类列表，将 Pantry 作为第一个分类
  const categories = useMemo(() => {
    const list: IngredientCategory[] = [];

    // 添加 "我的常买" 分类
    if (pantryItems.length > 0) {
      list.push({
        id: 'pantry',
        name: '我的常买',
        icon: '🕒', 
        items: pantryItems.map(item => ({
          name: item.name,
          icon: '🥘' // 默认图标，后续逻辑会尝试覆盖它
        }))
      });
    }

    return [...list, ...PRESET_INGREDIENTS];
  }, [pantryItems]);

  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || 'vegetables');

  // 如果当前选中的分类不存在（比如清空了 pantry），重置为第一个
  if (!categories.find(c => c.id === activeCategory) && categories.length > 0) {
    setActiveCategory(categories[0].id);
  }
  
  // 获取当前分类的食材
  const currentItems = useMemo(() => {
    const category = categories.find(c => c.id === activeCategory);
    if (!category) return [];
    
    // 如果是 Pantry，我们尝试从预设库中匹配更准确的图标
    if (category.id === 'pantry') {
      return category.items.map(item => {
        const presetItem = PRESET_INGREDIENTS
          .flatMap(c => c.items)
          .find(pi => pi.name === item.name);
        return presetItem ? { ...item, icon: presetItem.icon } : item;
      });
    }
    
    return category.items;
  }, [activeCategory, categories]);

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
      {/* 分类 Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-orange-100 bg-orange-50/30">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={twMerge(
              "flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
              activeCategory === category.id
                ? "border-orange-500 text-orange-700 bg-orange-50"
                : "border-transparent text-gray-600 hover:text-orange-600 hover:bg-orange-50/50"
            )}
          >
            <span className="text-base">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* 食材网格 */}
      <div className="p-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {currentItems.map((item) => {
            const isSelected = selectedIngredients.includes(item.name);
            return (
              <button
                key={item.name}
                onClick={() => onSelect(item.name)}
                className={twMerge(
                  "relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200 aspect-square",
                  isSelected
                    ? "border-orange-500 bg-orange-50 text-orange-900 shadow-sm"
                    : "border-gray-100 bg-white text-gray-700 hover:border-orange-200 hover:shadow-sm"
                )}
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xs font-medium text-center truncate w-full">
                  {item.name}
                </div>
                {isSelected && (
                  <div className="absolute top-1 right-1 text-orange-500 bg-white rounded-full p-0.5 shadow-sm">
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {currentItems.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
                暂无食材
            </div>
        )}
      </div>
    </div>
  );
}
