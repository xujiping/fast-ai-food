import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd-mobile';
import { useAppStore } from './stores/appStore';
import { supabase } from './utils/supabase';
import LoadingSpinner from './components/common/LoadingSpinner';
import Home from './pages/Home';
import Ingredients from './pages/Ingredients';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import MealRecord from './pages/MealRecord';
import AIChat from './pages/AIChat';
import Settings from './pages/Settings';
import './App.css';

const App: React.FC = () => {
  const { user, setUser } = useAppStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        if (!supabase || supabase === null) {
          setUser({ 
            id: 'demo-user', 
            email: 'demo@example.com', 
            name: '演示用户',
            created_at: new Date().toISOString()
          });
          setInitializing(false);
          return;
        }
        
        const { data } = await supabase.auth.getCurrentUser();
        if (data?.user) {
          setUser({ 
            id: data.user.id, 
            email: data.user.email || 'demo@example.com', 
            name: data.user.name || '演示用户',
            created_at: new Date().toISOString()
          });
        }
      } catch (error) {
        setUser({ 
          id: 'demo-user', 
          email: 'demo@example.com', 
          name: '演示用户',
          created_at: new Date().toISOString()
        });
      } finally {
        setInitializing(false);
      }
    };

    initApp();
  }, [setUser]);

  if (initializing) {
    return (
      <div className="app-loading">
        <LoadingSpinner size="large" />
        <p>正在初始化应用...</p>
      </div>
    );
  }

  return (
    <ConfigProvider>
      <div className="app">
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/ingredients" element={<Ingredients />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/meal-record" element={<MealRecord />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Router>
      </div>
    </ConfigProvider>
  );
};

export default App;
