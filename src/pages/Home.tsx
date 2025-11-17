import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Grid } from 'antd-mobile';
import { 
  AppstoreOutlined, 
  BookOutlined, 
  CameraOutlined, 
  MessageOutlined, 
  SettingOutlined,
  FireOutlined 
} from '@ant-design/icons';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 1,
      title: '食材管理',
      description: '管理您的食材库存，避免浪费',
      icon: <AppstoreOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
      path: '/ingredients'
    },
    {
      id: 2,
      title: '菜谱大全',
      description: '探索各种美食菜谱，学习烹饪技巧',
      icon: <BookOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      path: '/recipes'
    },
    {
      id: 3,
      title: '饮食记录',
      description: '记录每日饮食，追踪营养摄入',
      icon: <CameraOutlined style={{ fontSize: 32, color: '#faad14' }} />,
      path: '/meal-record'
    },
    {
      id: 4,
      title: 'AI 助手',
      description: '智能 AI 助手，解答您的美食问题',
      icon: <MessageOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      path: '/ai-chat'
    },
    {
      id: 5,
      title: '今日推荐',
      description: '根据您的口味推荐今日美食',
      icon: <FireOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />,
      path: '/recipes'
    },
    {
      id: 6,
      title: '设置',
      description: '个性化设置，管理您的账户',
      icon: <SettingOutlined style={{ fontSize: 32, color: '#8c8c8c' }} />,
      path: '/settings'
    }
  ];

  const todayRecipes = [
    { id: 1, name: '宫保鸡丁', time: '30分钟', difficulty: '简单' },
    { id: 2, name: '红烧肉', time: '60分钟', difficulty: '中等' },
    { id: 3, name: '清蒸鲈鱼', time: '25分钟', difficulty: '简单' }
  ];

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Fast AI Food</h1>
        <p>智能美食助手，让烹饪更简单</p>
      </div>
      
      <div className="home-content">
        <Card title="功能导航" style={{ marginBottom: 16 }}>
          <Grid columns={3} gap={12}>
            {features.map(feature => (
              <Grid.Item key={feature.id}>
                <div 
                  className="feature-item"
                  onClick={() => navigate(feature.path)}
                >
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                  <div className="feature-title">{feature.title}</div>
                </div>
              </Grid.Item>
            ))}
          </Grid>
        </Card>
        
        <Card title="今日推荐" style={{ marginBottom: 16 }}>
          <div className="recipe-list">
            {todayRecipes.map(recipe => (
              <div 
                key={recipe.id} 
                className="recipe-item"
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              >
                <div className="recipe-info">
                  <h4>{recipe.name}</h4>
                  <div className="recipe-meta">
                    <span>{recipe.time}</span>
                    <span>难度: {recipe.difficulty}</span>
                  </div>
                </div>
                <Button size="small" color="primary">查看</Button>
              </div>
            ))}
          </div>
        </Card>
        
        <Card title="营养小贴士">
          <div className="nutrition-tip">
            <p>今日营养建议：多摄入富含维生素C的食物，如橙子、柠檬等，有助于增强免疫力。</p>
            <Button size="small" color="primary" onClick={() => navigate('/ai-chat')}>
              了解更多
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;