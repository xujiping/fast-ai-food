import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipeStore } from '@/store/useRecipeStore';
import { BookOpen, Plus, X, ChefHat, Sparkles } from 'lucide-react';

const splitNames = (raw: string) =>
  raw
    .split(/[,\n、，]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();
  const { ingredients, pantry, addIngredients, addManyToPantry, addIngredient, removeIngredient } =
    useRecipeStore();

  const handleAdd = () => {
    const names = splitNames(inputValue);
    if (names.length === 0) return;
    addIngredients(names);
    addManyToPantry(names);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };
  
  const handleRecommend = () => {
    if (ingredients.length > 0) {
      navigate('/recipes');
    }
  };

  const handleAICreative = () => {
    if (ingredients.length > 0) {
      navigate('/recipes?mode=creative');
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 p-4 flex flex-col items-center">
      <header className="w-full max-w-md py-8 text-center relative">
        <button
          onClick={() => navigate('/ingredients')}
          className="absolute right-0 top-8 px-3 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-orange-600 text-sm font-medium flex items-center gap-2"
        >
          <BookOpen size={18} />
          管理
        </button>
        <h1 className="text-3xl font-bold text-orange-600 flex items-center justify-center gap-2">
          <ChefHat size={32} />
          AI 智能食谱
        </h1>
        <p className="text-orange-800 mt-2">冰箱里还有什么食材？</p>
      </header>

      <main className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">添加食材</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="例如：鸡蛋、西红柿、土豆"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={handleAdd}
              className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        {ingredients.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing) => (
              <span
                key={ing}
                className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 animate-in fade-in zoom-in duration-200"
              >
                {ing}
                <button
                  onClick={() => removeIngredient(ing)}
                  className="hover:text-orange-600 focus:outline-none"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400 text-sm">
            请添加至少一种食材开始
          </div>
        )}

        {/* 快捷选择区域 (原 IngredientSelector 移除，改回简单列表但带图标) */}
        {pantry.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">快速选择</div>
              <button
                onClick={() => navigate('/ingredients')}
                className="text-xs text-orange-600 hover:underline"
              >
                全部
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {pantry.slice(0, 12).map((item) => {
                const selected = ingredients.includes(item.name);
                return (
                  <button
                    key={item.id}
                    onClick={() => addIngredient(item.name)}
                    disabled={selected}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-1.5 ${
                      selected
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:text-orange-700'
                    }`}
                  >
                    <span>{item.icon || '🥘'}</span>
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-4 space-y-3">
          <button
            onClick={handleRecommend}
            disabled={ingredients.length === 0}
            className="w-full py-3 bg-orange-600 text-white rounded-xl font-semibold shadow-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <ChefHat size={20} />
            查找推荐菜谱
          </button>
          
          <button
            onClick={handleAICreative}
            disabled={ingredients.length === 0}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={20} />
            AI 创意主厨 (给我惊喜)
          </button>
        </div>
      </main>
      
      <footer className="mt-8 text-xs text-gray-500">
        Powered by React, Supabase & Vercel AI
      </footer>
    </div>
  );
}
