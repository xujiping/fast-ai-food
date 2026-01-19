import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useRecipeStore, Recipe } from '@/store/useRecipeStore';
import { ArrowLeft, Clock, ChefHat, Sparkles, AlertCircle } from 'lucide-react';

export default function Recipes() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const { ingredients, recipes, setRecipes, lastFetchMode } = useRecipeStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(() => {
    const currentMode = mode === 'creative' ? 'creative' : 'recommend';
    return !(recipes.length > 0 && lastFetchMode === currentMode);
  });
  const [error, setError] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  useEffect(() => {
    if (ingredients.length === 0) {
      navigate('/');
      return;
    }

    const currentMode = mode === 'creative' ? 'creative' : 'recommend';

    // Use cached recipes if available and matching the current mode
    if (recipes.length > 0 && lastFetchMode === currentMode) {
      setLoading(false);
      return;
    }

    const fetchRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = mode === 'creative' ? '/api/recipes/ai-creative' : '/api/recipes/recommend';
        const body = mode === 'creative' 
          ? { ingredients, creativity_level: 'high' }
          : { ingredients, ai_creative: true };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error('Failed to fetch recipes');

        const data = (await res.json()) as {
          local_recipes?: Recipe[];
          ai_recipes?: Recipe[];
          creativity_explanation?: string;
        };
        
        let newRecipes: Recipe[] = [];
        if (mode === 'creative') {
          newRecipes = data.ai_recipes || [];
          setAiExplanation(data.creativity_explanation || null);
        } else {
          // Combine local and AI recipes
          newRecipes = [
            ...(data.local_recipes || []).map((r) => ({ ...r, recipe_source: 'local' as const })),
            ...(data.ai_recipes || []).map((r) => ({ ...r, recipe_source: 'ai' as const }))
          ];
        }
        setRecipes(newRecipes, currentMode);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [ingredients, mode, navigate, recipes.length, lastFetchMode, setRecipes]);

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <header className="mb-6 flex items-center gap-4">
        <button 
          onClick={() => navigate('/')}
          className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow text-orange-600"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {mode === 'creative' ? 'AI 创意主厨' : '为您推荐'}
        </h1>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 mb-6 border border-red-100">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-4 rounded-2xl shadow-sm h-32 animate-pulse flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-xl"></div>
              <div className="flex-1 space-y-2 py-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mt-4"></div>
              </div>
            </div>
          ))}
          <div className="text-center text-orange-600 font-medium animate-pulse mt-8">
            {mode === 'creative' ? 'AI 正在构思新菜谱...' : '正在为您寻找完美搭配...'}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {aiExplanation && (
            <div className="bg-indigo-50 p-4 rounded-xl text-indigo-800 text-sm border border-indigo-100 flex gap-3">
              <Sparkles className="shrink-0 mt-0.5" size={18} />
              <p>{aiExplanation}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.length > 0 ? recipes.map((recipe, idx) => (
              <div 
                key={recipe.id || idx}
                onClick={() => navigate(`/recipe/${recipe.id || 'ai-' + idx}`, { state: { recipe } })}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group border border-transparent hover:border-orange-100"
              >
                <div className="h-40 bg-gray-100 relative overflow-hidden">
                   {recipe.image_url ? (
                     <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-300">
                       <ChefHat size={48} />
                     </div>
                   )}
                   {recipe.recipe_source === 'ai' && (
                     <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                       <Sparkles size={10} /> AI 生成
                     </div>
                   )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{recipe.name}</h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{recipe.description}</p>
                  
                  <div className="flex items-center gap-4 mt-4 text-xs text-gray-400 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {recipe.cooking_time} 分钟
                    </div>
                    <div className={`px-2 py-0.5 rounded-full ${
                      recipe.difficulty === '简单' ? 'bg-green-100 text-green-700' :
                      recipe.difficulty === '中等' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {recipe.difficulty}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12 text-gray-400">
                未找到相关菜谱。试着添加不同的食材，或者使用 AI 创意模式！
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
