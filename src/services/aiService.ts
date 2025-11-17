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
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const baseURL = import.meta.env.VITE_OPENAI_BASE_URL || undefined;
    if (apiKey && apiKey !== 'your-openai-api-key') {
      this.openai = new OpenAI({ apiKey, baseURL, dangerouslyAllowBrowser: true });
    }
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
          const visionModel = import.meta.env.VITE_OPENAI_VISION_MODEL || import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
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
          const textModel = import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo';
          const response = await this.openai.chat.completions.create({ model: textModel, messages, max_tokens: 500, temperature: 0.7 });
          aiResponse = response.choices[0]?.message?.content || '抱歉，我无法回答这个问题。';
        }
        suggestions = [];
      } else {
        aiResponse = '演示模式：这里展示模拟AI回复与建议。';
      }

      const response: AIChatResponse = { message: aiResponse, suggestions, related_recipes: relatedRecipes, related_ingredients: relatedIngredients };
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

export default new AIService();