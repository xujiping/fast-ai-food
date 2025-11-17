import { ChatMessage, ChatSession, ApiResponse } from '../types';
import { supabase } from '@/utils/supabase';
import OpenAI from 'openai';

export interface AIChatRequest {
  message: string;
  image_url?: string;
  context_type?: 'recipe' | 'ingredient' | 'meal_planning' | 'cooking_help';
  context_id?: string;
  session_id?: string;
}

export interface AIChatResponse {
  message: string;
  suggestions?: string[];
  related_recipes?: string[];
  related_ingredients?: string[];
}

class AIService {
  private openai: OpenAI | null = null;

  constructor() {
    this.initializeOpenAI();
  }

  private initializeOpenAI() {
    try {
      const isDemoMode = localStorage.getItem('ai_demo_mode') !== 'false'; // 默认为演示模式
      
      if (!isDemoMode) {
        const apiKey = localStorage.getItem('openai_api_key');
        const baseURL = localStorage.getItem('openai_base_url') || undefined;
        
        if (apiKey && apiKey.trim() !== '') {
          this.openai = new OpenAI({ 
            apiKey, 
            baseURL, 
            dangerouslyAllowBrowser: true 
          });
          console.log('OpenAI 已初始化');
        } else {
          console.warn('未找到有效的 OpenAI API 密钥，将使用演示模式');
        }
      } else {
        console.log('当前处于演示模式');
      }
    } catch (error) {
      console.error('初始化 OpenAI 失败:', error);
    }
  }

  // 重新初始化 OpenAI（用于设置更改后）
  reinitialize() {
    this.openai = null;
    this.initializeOpenAI();
  }

  async createChatSession(userId: string, title: string, contextType?: string, contextId?: string): Promise<ApiResponse<ChatSession>> {
    try {
      // 模拟创建聊天会话
      const newSession: ChatSession = {
        id: `session-${Date.now()}`,
        user_id: userId,
        title,
        context_type: contextType as any,
        context_id: contextId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return { success: true, data: newSession };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getChatMessages(sessionId: string): Promise<ApiResponse<ChatMessage[]>> {
    try {
      // 模拟获取聊天消息
      const messages: ChatMessage[] = [];
      return { success: true, data: messages };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async sendAIChat(request: AIChatRequest): Promise<ApiResponse<AIChatResponse>> {
    try {
      let aiResponse: string;
      let suggestions: string[] = [];
      let relatedRecipes: string[] = [];
      let relatedIngredients: string[] = [];

      if (this.openai) {
        const systemPrompt = '你是一个智能烹饪助手，善于根据食材与口味给出建议';
        const messages = [
          { role: 'system' as const, content: systemPrompt },
          { role: 'user' as const, content: request.message }
        ];

        if (request.image_url) {
          const visionModel = localStorage.getItem('openai_vision_model') || 'gpt-4o-mini';
          const response = await this.openai.chat.completions.create({
            model: visionModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: [ { type: 'text', text: request.message }, { type: 'image_url', image_url: { url: request.image_url } } ] }
            ],
            max_tokens: 500
          });
          aiResponse = response.choices[0]?.message?.content || '抱歉，我无法处理这张图片。';
        } else {
          const textModel = localStorage.getItem('openai_model') || 'gpt-3.5-turbo';
          const response = await this.openai.chat.completions.create({ 
            model: textModel, 
            messages, 
            max_tokens: 500, 
            temperature: 0.7 
          });
          aiResponse = response.choices[0]?.message?.content || '抱歉，我无法回答这个问题。';
        }
        suggestions = [];
      } else {
        // 演示模式回复
        const demoResponses = [
          '这是一个很好的问题！在演示模式下，我建议您可以尝试使用新鲜的食材来提升菜品的口感。',
          '根据您的描述，我认为这道菜可以增加一些香料来提升风味。',
          '演示模式：这道菜的营养价值很高，富含维生素和蛋白质。',
          '在演示模式下，我建议您可以参考类似的菜谱，并根据个人口味进行调整。'
        ];
        
        aiResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
        suggestions = ['了解更多菜谱', '查看营养信息', '获取烹饪技巧'];
      }

      const response: AIChatResponse = { 
        message: aiResponse, 
        suggestions, 
        related_recipes: relatedRecipes, 
        related_ingredients: relatedIngredients 
      };
      
      return { success: true, data: response };
    } catch (error) {
      console.error('AI 聊天错误:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // 测试 API 连接
  async testConnection(): Promise<ApiResponse<{ status: string }>> {
    try {
      if (!this.openai) {
        return { success: false, error: 'OpenAI 未初始化，请检查配置' };
      }
      
      const model = localStorage.getItem('openai_model') || 'gpt-3.5-turbo';
      const response = await this.openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: '测试连接' }],
        max_tokens: 10
      });
      
      if (response.choices && response.choices.length > 0) {
        return { success: true, data: { status: '连接成功' } };
      } else {
        return { success: false, error: '未收到有效响应' };
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

export default new AIService();