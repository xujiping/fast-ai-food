import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar, Card, Button, Image, Steps } from 'antd-mobile';
import { ArrowLeftOutlined, HeartOutlined, ShareAltOutlined } from '@ant-design/icons';

const RecipeDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <div className="recipe-detail-page">
      <NavBar 
        backArrow 
        onBack={() => navigate(-1)}
        right={
          <div style={{ display: 'flex', gap: 12 }}>
            <HeartOutlined />
            <ShareAltOutlined />
          </div>
        }
      >
        菜谱详情
      </NavBar>
      
      <div className="recipe-detail-content">
        <Card>
          <Image
            src='https://picsum.photos/seed/recipe/400/300.jpg'
            style={{ width: '100%', borderRadius: 8 }}
            fit='cover'
          />
          <h1>宫保鸡丁</h1>
          <div className="recipe-info">
            <span>⏱️ 30分钟</span>
            <span>👥 2人份</span>
            <span>🌶️ 中辣</span>
          </div>
        </Card>
        
        <Card title='食材准备' style={{ marginTop: 16 }}>
          <ul>
            <li>鸡胸肉 300g</li>
            <li>花生米 50g</li>
            <li>干辣椒 10个</li>
            <li>葱 2根</li>
            <li>姜 1小块</li>
            <li>蒜 3瓣</li>
          </ul>
        </Card>
        
        <Card title='制作步骤' style={{ marginTop: 16 }}>
          <Steps direction='vertical'>
            <Steps.Step title='准备食材' description='将鸡胸肉切丁，用料酒、生抽腌制15分钟' />
            <Steps.Step title='调制酱汁' description='将生抽、老抽、糖、醋、淀粉调成酱汁备用' />
            <Steps.Step title='炒制' description='热锅下油，先炒鸡丁至变色，再加入花生米和调料' />
            <Steps.Step title='完成' description='最后加入调好的酱汁，快速翻炒均匀即可' />
          </Steps>
        </Card>
      </div>
    </div>
  );
};

export default RecipeDetail;