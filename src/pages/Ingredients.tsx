import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Button, Card, Grid } from 'antd-mobile';
import { PlusOutlined, SearchOutlined, CameraOutlined } from '@ant-design/icons';

const Ingredients: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="ingredients-page">
      <NavBar backArrow onBack={() => navigate(-1)}>
        食材管理
      </NavBar>
      
      <div className="ingredients-content">
        <div className="quick-actions">
          <Grid columns={3} gap={12}>
            <Grid.Item>
              <Card onClick={() => navigate('/ingredients/add')}>
                <PlusOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                <div>添加食材</div>
              </Card>
            </Grid.Item>
            <Grid.Item>
              <Card onClick={() => navigate('/ingredients/scan')}>
                <CameraOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                <div>扫描识别</div>
              </Card>
            </Grid.Item>
            <Grid.Item>
              <Card onClick={() => navigate('/ingredients/search')}>
                <SearchOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                <div>搜索食材</div>
              </Card>
            </Grid.Item>
          </Grid>
        </div>
        
        <div className="ingredients-list">
          <h3>我的食材</h3>
          <p>暂无食材，点击上方按钮添加</p>
        </div>
      </div>
    </div>
  );
};

export default Ingredients;