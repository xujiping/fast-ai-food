import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Card, Button, List, DatePicker } from 'antd-mobile';
import { PlusOutlined, CameraOutlined } from '@ant-design/icons';

const MealRecord: React.FC = () => {
  const navigate = useNavigate();

  const meals = [
    { id: 1, date: '2023-12-01', type: '早餐', foods: ['牛奶', '面包', '鸡蛋'] },
    { id: 2, date: '2023-12-01', type: '午餐', foods: ['米饭', '宫保鸡丁', '青菜'] },
    { id: 3, date: '2023-12-01', type: '晚餐', foods: ['面条', '西红柿炒蛋'] }
  ];

  return (
    <div className="meal-record-page">
      <NavBar backArrow onBack={() => navigate(-1)}>
        饮食记录
      </NavBar>
      
      <div className="meal-record-content">
        <div className="quick-actions">
          <Button 
            color='primary' 
            onClick={() => navigate('/meal-record/add')}
            style={{ marginRight: 12 }}
          >
            <PlusOutlined /> 记录饮食
          </Button>
          <Button 
            onClick={() => navigate('/meal-record/photo')}
          >
            <CameraOutlined /> 拍照记录
          </Button>
        </div>
        
        <DatePicker>
          {value => <Button>选择日期</Button>}
        </DatePicker>
        
        <Card title='今日饮食' style={{ marginTop: 16 }}>
          <List>
            {meals.map(meal => (
              <List.Item key={meal.id}>
                <div className="meal-item">
                  <h4>{meal.type}</h4>
                  <p>{meal.foods.join(', ')}</p>
                </div>
              </List.Item>
            ))}
          </List>
        </Card>
        
        <Card title='营养分析' style={{ marginTop: 16 }}>
          <div className="nutrition-summary">
            <div className="nutrition-item">
              <span>热量</span>
              <span>1850 kcal</span>
            </div>
            <div className="nutrition-item">
              <span>蛋白质</span>
              <span>65g</span>
            </div>
            <div className="nutrition-item">
              <span>碳水</span>
              <span>220g</span>
            </div>
            <div className="nutrition-item">
              <span>脂肪</span>
              <span>75g</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MealRecord;