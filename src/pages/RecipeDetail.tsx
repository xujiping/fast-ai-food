import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, Flame, ChefHat, CheckCircle2, Circle } from 'lucide-react';

interface Recipe {
  id: string;
  name: string;
  description: string;
  cooking_time: number;
  difficulty: string;
  ingredients: any[];
  steps: any[];
  nutrition?: any;
  calories?: number;
  image_url?: string;
}

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [recipe, setRecipe] = useState<Recipe | null>(location.state?.recipe || null);
  const [loading, setLoading] = useState(!recipe);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recipe) return;

    // Fetch if no state (direct link)
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/recipes/${id}`);
        if (!res.ok) throw new Error('Recipe not found');
        const data = await res.json();
        setRecipe(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id && !id.startsWith('ai-')) {
      fetchRecipe();
    } else {
      setError('AI Recipe expired. Please generate again.');
      setLoading(false);
    }
  }, [id, recipe]);

  if (loading) return (
    <div className="min-h-screen bg-white p-4 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
    </div>
  );

  if (error || !recipe) return (
    <div className="min-h-screen bg-white p-4 flex flex-col items-center justify-center text-center">
      <p className="text-gray-500 mb-4">{error || 'Recipe not found'}</p>
      <button 
        onClick={() => navigate('/')}
        className="text-orange-600 font-medium hover:underline"
      >
        返回首页
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Hero Image */}
      <div className="h-64 sm:h-80 bg-gray-100 relative">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-300">
            <ChefHat size={64} />
          </div>
        )}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="px-5 -mt-6 relative z-10">
        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6">
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">{recipe.name}</h1>
            <p className="text-gray-500 text-sm leading-relaxed">{recipe.description}</p>
          </div>

          <div className="flex items-center justify-between py-4 border-y border-gray-100">
            <div className="flex flex-col items-center gap-1">
              <Clock size={18} className="text-orange-500" />
              <span className="text-xs font-medium text-gray-600">{recipe.cooking_time} 分钟</span>
            </div>
            <div className="w-px h-8 bg-gray-100"></div>
            <div className="flex flex-col items-center gap-1">
              <Flame size={18} className="text-red-500" />
              <span className="text-xs font-medium text-gray-600">{recipe.calories || 350} 千卡</span>
            </div>
            <div className="w-px h-8 bg-gray-100"></div>
            <div className="flex flex-col items-center gap-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                 recipe.difficulty === '简单' ? 'bg-green-100 text-green-700' :
                 recipe.difficulty === '中等' ? 'bg-yellow-100 text-yellow-700' :
                 'bg-red-100 text-red-700'
              }`}>
                {recipe.difficulty}
              </span>
              <span className="text-xs text-gray-400">难度</span>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
              食材清单
            </h2>
            <ul className="space-y-3">
              {Array.isArray(recipe.ingredients) && recipe.ingredients.map((ing: any, idx: number) => (
                <li key={idx} className="flex items-center justify-between text-sm group">
                  <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors">
                    {typeof ing === 'string' ? ing : ing.name}
                  </span>
                  <span className="text-gray-400">
                    {typeof ing === 'string' ? '' : `${ing.quantity} ${ing.unit || ''}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
              制作步骤
            </h2>
            <div className="space-y-6">
              {Array.isArray(recipe.steps) && recipe.steps.map((step: any, idx: number) => (
                <div key={idx} className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold mt-0.5">
                    {step.step_number || idx + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {typeof step === 'string' ? step : step.instruction}
                    </p>
                    {step.duration && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} /> {step.duration}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
