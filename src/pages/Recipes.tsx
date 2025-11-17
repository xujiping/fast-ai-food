import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Card, SearchBar, Tag } from 'antd-mobile';
import { HeartOutlined, ClockCircleOutlined } from '@ant-design/icons';

const Recipes: React.FC = () => {
  const navigate = useNavigate();

  const recipes = [
    { id: 1, title: '宫保鸡丁', time: '30分钟', difficulty: '简单', likes: 128 },
    { id: 2, title: '红烧肉', time: '60分钟', difficulty: '中等', likes: 256 },
    { id: 3, title: '清蒸鲈鱼', time: '25分钟', difficulty: '简单', likes: 89 }
  ];

  return (
    <div className="recipes-page">
      <NavBar backArrow onBack={() => navigate(-1)}>
        菜谱大全
      </NavBar>
      
      <div className="recipes-content">
        <SearchBar placeholder='搜索菜谱' style={{ marginBottom: 16 }} />
        
        <div className="recipe-tags">
          <Tag color='primary' style={{ marginRight: 8 }}>家常菜</Tag>
          <Tag color='success' style={{ marginRight: 8 }}>快手菜</Tag>
          <Tag color='warning' style={{ marginRight: 8 }}>素食</Tag>
          <Tag color='danger'>甜品</Tag>
        </div>
        
        <div className="recipes-list">
          {recipes.map(recipe => (
            <Card
              key={recipe.id}
              onClick={() => navigate(`/recipe/${recipe.id}`)}
              style={{ marginBottom: 12 }}
            >
              <div className="recipe-card">
                <h3>{recipe.title}</h3>
                <div className="recipe-meta">
                  <span><ClockCircleOutlined /> {recipe.time}</span>
                  <span>难度: {recipe.difficulty}</span>
                  <span><HeartOutlined /> {recipe.likes}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recipes;