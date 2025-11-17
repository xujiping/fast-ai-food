import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, List, Switch, Input, Button, Toast, Dialog } from 'antd-mobile';
import { useAppStore } from '@/stores/appStore';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  
  // AI配置状态
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [openaiBaseUrl, setOpenaiBaseUrl] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gpt-3.5-turbo');
  const [openaiVisionModel, setOpenaiVisionModel] = useState('gpt-4o-mini');
  const [isDemoMode, setIsDemoMode] = useState(true);
  
  // 通用设置状态
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [personalized, setPersonalized] = useState(false);

  useEffect(() => {
    // 从localStorage加载设置
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedApiKey = localStorage.getItem('openai_api_key') || '';
      const savedBaseUrl = localStorage.getItem('openai_base_url') || '';
      const savedModel = localStorage.getItem('openai_model') || 'gpt-3.5-turbo';
      const savedVisionModel = localStorage.getItem('openai_vision_model') || 'gpt-4o-mini';
      const savedDemoMode = localStorage.getItem('ai_demo_mode') !== 'false'; // 默认为演示模式
      
      const savedNotifications = localStorage.getItem('settings_notifications') !== 'false';
      const savedDarkMode = localStorage.getItem('settings_dark_mode') === 'true';
      const savedAutoSave = localStorage.getItem('settings_auto_save') !== 'false';
      const savedAnalytics = localStorage.getItem('settings_analytics') !== 'false';
      const savedPersonalized = localStorage.getItem('settings_personalized') === 'true';
      
      setOpenaiApiKey(savedApiKey);
      setOpenaiBaseUrl(savedBaseUrl);
      setOpenaiModel(savedModel);
      setOpenaiVisionModel(savedVisionModel);
      setIsDemoMode(savedDemoMode);
      
      setNotifications(savedNotifications);
      setDarkMode(savedDarkMode);
      setAutoSave(savedAutoSave);
      setAnalytics(savedAnalytics);
      setPersonalized(savedPersonalized);
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('openai_api_key', openaiApiKey);
      localStorage.setItem('openai_base_url', openaiBaseUrl);
      localStorage.setItem('openai_model', openaiModel);
      localStorage.setItem('openai_vision_model', openaiVisionModel);
      localStorage.setItem('ai_demo_mode', isDemoMode.toString());
      
      localStorage.setItem('settings_notifications', notifications.toString());
      localStorage.setItem('settings_dark_mode', darkMode.toString());
      localStorage.setItem('settings_auto_save', autoSave.toString());
      localStorage.setItem('settings_analytics', analytics.toString());
      localStorage.setItem('settings_personalized', personalized.toString());
      
      Toast.show({ content: '设置已保存', icon: 'success' });
    } catch (error) {
      Toast.show({ content: '保存设置失败', icon: 'fail' });
    }
  };

  const testAiConnection = async () => {
    if (!openaiApiKey.trim()) {
      Toast.show({ content: '请先输入API密钥', icon: 'fail' });
      return;
    }
    
    try {
      Toast.show({ content: '正在测试连接...', icon: 'loading', duration: 0 });
      
      // 保存当前设置到localStorage
      localStorage.setItem('openai_api_key', openaiApiKey);
      localStorage.setItem('openai_base_url', openaiBaseUrl);
      localStorage.setItem('openai_model', openaiModel);
      localStorage.setItem('openai_vision_model', openaiVisionModel);
      localStorage.setItem('ai_demo_mode', 'false');
      
      // 重新初始化aiService
      const aiService = (await import('@/services/aiService')).default;
      aiService.reinitialize();
      
      // 测试连接
      const result = await aiService.testConnection();
      
      Toast.clear();
      
      if (result.success) {
        Toast.show({ content: '连接测试成功', icon: 'success' });
      } else {
        Toast.show({ content: `连接测试失败: ${result.error}`, icon: 'fail' });
      }
    } catch (error) {
      Toast.clear();
      Toast.show({ content: `连接测试失败: ${(error as Error).message}`, icon: 'fail' });
    }
  };

  const resetSettings = () => {
    Dialog.confirm({
      content: '确定要重置所有设置吗？此操作不可恢复。',
      confirmText: '确定',
      cancelText: '取消',
      onConfirm: () => {
        localStorage.clear();
        loadSettings();
        Toast.show({ content: '设置已重置', icon: 'success' });
      }
    });
  };

  return (
    <div className="settings-page">
      <NavBar backArrow onBack={() => navigate(-1)}>
        设置
      </NavBar>
      
      <div className="settings-content">
        <List header='AI 配置'>
          <List.Item
            extra={
              <Switch
                checked={!isDemoMode}
                onChange={(checked) => setIsDemoMode(!checked)}
              />
            }
          >
            启用AI助手
          </List.Item>
          
          {!isDemoMode && (
            <>
              <List.Item title="OpenAI API 密钥">
                <Input
                  placeholder="sk-..."
                  value={openaiApiKey}
                  onChange={setOpenaiApiKey}
                  type="password"
                  clearable
                />
              </List.Item>
              
              <List.Item title="API 基础URL (可选)">
                <Input
                  placeholder="https://api.openai.com"
                  value={openaiBaseUrl}
                  onChange={setOpenaiBaseUrl}
                  clearable
                />
              </List.Item>
              
              <List.Item title="文本模型">
                <Input
                  placeholder="gpt-3.5-turbo"
                  value={openaiModel}
                  onChange={setOpenaiModel}
                  clearable
                />
              </List.Item>
              
              <List.Item title="视觉模型">
                <Input
                  placeholder="gpt-4o-mini"
                  value={openaiVisionModel}
                  onChange={setOpenaiVisionModel}
                  clearable
                />
              </List.Item>
              
              <List.Item>
                <Button color="primary" onClick={testAiConnection} block>
                  测试连接
                </Button>
              </List.Item>
            </>
          )}
        </List>
        
        <List header='通用设置'>
          <List.Item
            extra={<Switch checked={notifications} onChange={setNotifications} />}
          >
            推送通知
          </List.Item>
          <List.Item
            extra={<Switch checked={darkMode} onChange={setDarkMode} />}
          >
            深色模式
          </List.Item>
          <List.Item
            extra={<Switch checked={autoSave} onChange={setAutoSave} />}
          >
            自动保存
          </List.Item>
        </List>
        
        <List header='隐私设置'>
          <List.Item
            extra={<Switch checked={analytics} onChange={setAnalytics} />}
          >
            数据分析
          </List.Item>
          <List.Item
            extra={<Switch checked={personalized} onChange={setPersonalized} />}
          >
            个性化推荐
          </List.Item>
        </List>
        
        <List header='操作'>
          <List.Item onClick={saveSettings}>
            <Button color="primary" block>
              保存设置
            </Button>
          </List.Item>
          <List.Item onClick={resetSettings}>
            <Button color="danger" block>
              重置所有设置
            </Button>
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