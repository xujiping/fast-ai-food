import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useRecipeStore, PantryItem } from '@/store/useRecipeStore';
import { twMerge } from 'tailwind-merge';

const splitNames = (raw: string) =>
  raw
    .split(/[,\n、，]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

export default function Ingredients() {
  const navigate = useNavigate();
  const {
    pantry,
    addManyToPantry,
    updatePantryItem,
    removePantryItem,
    clearPantry,
    addIngredient,
  } = useRecipeStore();

  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // 对过滤后的食材进行分类聚合
  const groupedPantry = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    let filtered = pantry;
    if (q) {
      filtered = pantry.filter((i) => i.name.toLowerCase().includes(q));
    }

    const groups: Record<string, PantryItem[]> = {};
    const order: string[] = [];

    // 优先展示有内容的分类
    filtered.forEach(item => {
        const cat = item.category || '其他';
        if (!groups[cat]) {
            groups[cat] = [];
            order.push(cat);
        }
        groups[cat].push(item);
    });
    
    // 排序分类（可选，可以按固定顺序，这里简单按出现顺序）
    return { groups, order };
  }, [pantry, searchValue]);

  const handleAdd = () => {
    const names = splitNames(inputValue);
    if (names.length === 0) return;
    addManyToPantry(names);
    setInputValue('');
  };

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingValue(name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    updatePantryItem(editingId, editingValue);
    handleCancelEdit();
  };

  const handleClear = () => {
    if (pantry.length === 0) return;
    if (!window.confirm('确定要清空食材库吗？此操作不可撤销。')) return;
    clearPantry();
  };

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <header className="mb-6 flex items-center gap-4 sticky top-0 bg-orange-50/95 backdrop-blur-sm z-10 py-2">
        <button
          onClick={() => navigate('/')}
          className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow text-orange-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">食材库</h1>
          <p className="text-xs text-gray-500 mt-1">
            管理常用食材
          </p>
        </div>
        <button
          onClick={handleClear}
          disabled={pantry.length === 0}
          className="px-3 py-2 bg-white rounded-xl text-sm font-medium text-gray-700 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
        >
          清空
        </button>
      </header>

      <main className="max-w-md mx-auto space-y-4 pb-20">
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <label className="text-sm font-medium text-gray-700">添加到食材库</label>
          <div className="flex gap-2">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              placeholder="例如：鸡蛋、西红柿"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={handleAdd}
              className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="搜索我的食材"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
              />
            </div>
          </div>
        </div>

        {groupedPantry.order.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">
            {pantry.length === 0 ? '还没有食材，先添加一些吧' : '没有匹配的食材'}
          </div>
        ) : (
          <div className="space-y-6">
            {groupedPantry.order.map((category) => (
                <div key={category} className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-500 px-2 flex items-center gap-2">
                        {category}
                        <span className="text-xs font-normal bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                            {groupedPantry.groups[category].length}
                        </span>
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        {groupedPantry.groups[category].map((item) => {
                            const isEditing = editingId === item.id;
                            return (
                                <div
                                key={item.id}
                                className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3 border border-transparent hover:border-orange-100 transition-colors"
                                >
                                    <div className="text-2xl shrink-0 select-none w-8 text-center">
                                        {item.icon || '🥘'}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        {isEditing ? (
                                        <input
                                            value={editingValue}
                                            onChange={(e) => setEditingValue(e.target.value)}
                                            onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveEdit();
                                            if (e.key === 'Escape') handleCancelEdit();
                                            }}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            autoFocus
                                        />
                                        ) : (
                                        <div 
                                            className="font-medium text-gray-900 truncate cursor-pointer hover:text-orange-600"
                                            onClick={() => addIngredient(item.name)}
                                            title="点击加入今日清单"
                                        >
                                            {item.name}
                                        </div>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="flex items-center gap-1">
                                        <button
                                            onClick={handleSaveEdit}
                                            className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="p-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleStartEdit(item.id, item.name)}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => removePantryItem(item.id)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
