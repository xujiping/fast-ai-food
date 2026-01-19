export interface IngredientItem {
  name: string;
  icon: string;
}

export interface IngredientCategory {
  id: string;
  name: string;
  icon: string;
  items: IngredientItem[];
}

export const PRESET_INGREDIENTS: IngredientCategory[] = [
  {
    id: 'vegetables',
    name: '蔬菜',
    icon: '🥬',
    items: [
      { name: '土豆', icon: '🥔' },
      { name: '西红柿', icon: '🍅' },
      { name: '白菜', icon: '🥬' },
      { name: '胡萝卜', icon: '🥕' },
      { name: '黄瓜', icon: '🥒' },
      { name: '茄子', icon: '🍆' },
      { name: '西兰花', icon: '🥦' },
      { name: '洋葱', icon: '🧅' },
      { name: '大蒜', icon: '🧄' },
      { name: '生姜', icon: '🥔' },
      { name: '辣椒', icon: '🌶️' },
      { name: '玉米', icon: '🌽' },
      { name: '蘑菇', icon: '🍄' },
      { name: '菠菜', icon: '🥬' },
      { name: '青菜', icon: '🥬' },
    ]
  },
  {
    id: 'meat',
    name: '肉禽',
    icon: '🥩',
    items: [
      { name: '猪肉', icon: '🐖' },
      { name: '牛肉', icon: '🐄' },
      { name: '鸡肉', icon: '🐔' },
      { name: '鸡翅', icon: '🍗' },
      { name: '排骨', icon: '🍖' },
      { name: '羊肉', icon: '🐑' },
      { name: '培根', icon: '🥓' },
      { name: '香肠', icon: '🌭' },
      { name: '鸭肉', icon: '🦆' },
    ]
  },
  {
    id: 'seafood',
    name: '海鲜',
    icon: '🦐',
    items: [
      { name: '虾', icon: '🦐' },
      { name: '鱼', icon: '🐟' },
      { name: '螃蟹', icon: '🦀' },
      { name: '鱿鱼', icon: '🦑' },
      { name: '蛤蜊', icon: '🐚' },
      { name: '龙虾', icon: '🦞' },
    ]
  },
  {
    id: 'staples',
    name: '主食',
    icon: '🍚',
    items: [
      { name: '米饭', icon: '🍚' },
      { name: '面条', icon: '🍜' },
      { name: '馒头', icon: '🥯' },
      { name: '面包', icon: '🍞' },
      { name: '饺子', icon: '🥟' },
      { name: '意大利面', icon: '🍝' },
    ]
  },
  {
    id: 'dairy_eggs',
    name: '蛋奶豆腐',
    icon: '🥚',
    items: [
      { name: '鸡蛋', icon: '🥚' },
      { name: '牛奶', icon: '🥛' },
      { name: '奶酪', icon: '🧀' },
      { name: '黄油', icon: '🧈' },
      { name: '豆腐', icon: '🧊' },
    ]
  },
];
