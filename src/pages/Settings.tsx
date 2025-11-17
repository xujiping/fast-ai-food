import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, List, Switch } from 'antd-mobile';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="settings-page">
      <NavBar backArrow onBack={() => navigate(-1)}>
        设置
      </NavBar>
      
      <div className="settings-content">
        <List header='通用设置'>
          <List.Item
            extra={<Switch defaultChecked />}
          >
            推送通知
          </List.Item>
          <List.Item
            extra={<Switch />}
          >
            深色模式
          </List.Item>
          <List.Item
            extra={<Switch defaultChecked />}
          >
            自动保存
          </List.Item>
        </List>
        
        <List header='隐私设置'>
          <List.Item
            extra={<Switch defaultChecked />}
          >
            数据分析
          </List.Item>
          <List.Item
            extra={<Switch />}
          >
            个性化推荐
          </List.Item>
        </List>
        
        <List header='关于'>
          <List.Item onClick={() => navigate('/about')}>
            关于我们
          </List.Item>
          <List.Item onClick={() => navigate('/privacy')}>
            隐私政策
          </List.Item>
          <List.Item onClick={() => navigate('/terms')}>
            使用条款
          </List.Item>
          <List.Item>
            版本 1.0.0
          </List.Item>
        </List>
      </div>
    </div>
  );
};

export default Settings;