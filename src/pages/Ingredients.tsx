import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useRecipeStore } from '@/store/useRecipeStore';

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

  const filtered = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return pantry;
    return pantry.filter((i) => i.name.toLowerCase().includes(q));
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
      <header className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow text-orange-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">食材库</h1>
          <p className="text-xs text-gray-500 mt-1">
            管理常用食材，点击可加入本次食材
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

      <main className="max-w-md mx-auto space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <label className="text-sm font-medium text-gray-700">添加到食材库</label>
          <div className="flex gap-2">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              placeholder="例如：鸡蛋、西红柿、土豆（可用逗号/顿号分隔）"
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
                placeholder="搜索食材"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">
            {pantry.length === 0 ? '还没有食材，先添加一些吧' : '没有匹配的食材'}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => {
              const isEditing = editingId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3"
                >
                  <button
                    onClick={() => addIngredient(item.name)}
                    className="flex-1 text-left"
                  >
                    {isEditing ? (
                      <input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        autoFocus
                      />
                    ) : (
                      <div className="font-medium text-gray-900">{item.name}</div>
                    )}
                  </button>

                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        aria-label="保存"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                        aria-label="取消"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(item.id, item.name)}
                        className="p-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                        aria-label="编辑"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => removePantryItem(item.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        aria-label="删除"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center text-xs text-gray-500 py-4">
          共 {pantry.length} 个食材
        </div>
      </main>
    </div>
  );
}

