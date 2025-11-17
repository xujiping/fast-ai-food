import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd-mobile';
import { useAppStore } from '@/stores/appStore';
import { supabase } from '@/utils/supabase';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Home from '@/pages/Home';
import Ingredients from '@/pages/Ingredients';
import Recipes from '@/pages/Recipes';
import RecipeDetail from '@/pages/RecipeDetail';
import MealRecord from '@/pages/MealRecord';
import AIChat from '@/pages/AIChat';
import Settings from '@/pages/Settings';
import './App.css';

const App: React.FC = () => {
  const { user, setUser, setLoading } = useAppStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        setLoading(true);
        if (!supabase || supabase === null) {
          setUser({ id: 'demo-user', username: '演示用户', email: 'demo@example.com', name: '演示用户', avatar_url: null, preferences: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
          setLoading(false);
          setInitializing(false);
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (profile) {
            setUser({ id: profile.id, username: profile.name, email: profile.email, name: profile.name, avatar_url: profile.avatar_url, preferences: profile.preferences || {}, created_at: profile.created_at, updated_at: profile.updated_at });
          }
        }
      } catch (error) {
        setUser({ id: 'demo-user', username: '演示用户', email: 'demo@example.com', name: '演示用户', avatar_url: null, preferences: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      } finally {
        setLoading(false);
        setInitializing(false);
      }
    };

    initApp();

    if (supabase && supabase !== null) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (profile) {
            setUser({ id: profile.id, username: profile.name, email: profile.email, name: profile.name, avatar_url: profile.avatar_url, preferences: profile.preferences || {}, created_at: profile.created_at, updated_at: profile.updated_at });
          }
        } else {
          setUser(null);
        }
      });
      return () => { authListener.subscription.unsubscribe(); };
    }
  }, [setUser, setLoading]);

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
