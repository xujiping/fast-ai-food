import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { List, Input, Button, NavBar, Toast, ImageUploader, Space } from "antd-mobile";
import { MessageOutlined, SendOutlined, PlusOutlined, CameraOutlined, PictureOutlined } from "@ant-design/icons";
import { useAppStore } from "@/stores/appStore";
import aiService, { AIChatRequest } from "@/services/aiService";
import { ChatMessage } from "@/types";
import "./AIChat.css";

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, currentChatSession, setCurrentChatSession } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contextType = location.state?.contextType as string;
  const contextId = location.state?.contextId as string;
  const contextTitle = location.state?.contextTitle as string;

  useEffect(() => {
    if (!user) {
      Toast.show({ content: "请先登录", icon: "fail", duration: 2000, afterClose: () => navigate("/login") });
      return;
    }
    initializeChatSession();
  }, [user]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const initializeChatSession = async () => {
    try {
      setIsLoading(true);
      if (currentChatSession) {
        const result = await aiService.getChatMessages(currentChatSession.id);
        if (result.success && result.data) { setMessages(result.data); }
      } else {
        const title = contextTitle ? `关于${contextTitle}` : "新对话";
        const result = await aiService.createChatSession(user!.id, title, contextType, contextId);
        if (result.success && result.data) {
          setCurrentChatSession(result.data);
          const welcomeMessage: ChatMessage = { id: `welcome-${Date.now()}`, session_id: result.data.id, role: "assistant", content: generateWelcomeMessage(contextType), message_type: "text", created_at: new Date().toISOString() };
          setMessages([welcomeMessage]);
        }
      }
    } catch (error) { Toast.show({ content: "初始化聊天失败", icon: "fail" }); }
    finally { setIsLoading(false); }
  };

  const generateWelcomeMessage = (contextType?: string): string => {
    const messages = {
      recipe: "您好！我是您的AI厨房助手，可以帮您解答关于菜谱制作的问题。",
      ingredient: "您好！我是您的AI厨房助手，可以帮您识别食材、了解营养价值、推荐储存方法等。",
      meal_planning: "您好！我是您的AI厨房助手，可以帮您制定饮食计划、分析营养搭配、推荐健康食谱等。",
      cooking_help: "您好！我是您的AI厨房助手，可以为您提供烹饪技巧、调味建议、火候掌握等方面的帮助。",
      default: "您好！我是您的AI厨房助手，可以帮您识别食材、推荐菜谱、规划饮食、解答烹饪问题等。有什么可以帮助您的吗？",
    } as const;
    return messages[(contextType as keyof typeof messages) || 'default'];
  };

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !imageFile) return;
    try {
      setIsLoading(true);
      const userMessage: ChatMessage = { id: `user-${Date.now()}`, session_id: currentChatSession!.id, role: "user", content: inputMessage, message_type: imageFile ? "image" : "text", image_url: imagePreview || undefined, created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, userMessage]);
      setInputMessage("");
      const aiRequest: AIChatRequest = { message: inputMessage, image_url: imagePreview || undefined, context_type: contextType as any, context_id: contextId, session_id: currentChatSession!.id };
      const result = await aiService.sendAIChat(aiRequest);
      if (result.success && result.data) {
        const aiMessage: ChatMessage = { id: `ai-${Date.now()}`, session_id: currentChatSession!.id, role: "assistant", content: result.data.message, message_type: "text", created_at: new Date().toISOString() };
        setMessages((prev) => [...prev, aiMessage]);
        if (result.data.suggestions && result.data.suggestions.length > 0) { Toast.show({ content: `建议: ${result.data.suggestions[0]}`, duration: 3000 }); }
      } else { Toast.show({ content: "AI回复失败，请重试", icon: "fail" }); }
      setImageFile(null); setImagePreview("");
    } catch (error) { Toast.show({ content: "发送消息失败", icon: "fail" }); }
    finally { setIsLoading(false); }
  };

  const handleImageUpload = (file: File) => { setImageFile(file); const reader = new FileReader(); reader.onload = (e) => { setImagePreview(e.target?.result as string); }; reader.readAsDataURL(file); return false; };
  const handleCameraClick = () => { fileInputRef.current?.click(); };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) { handleImageUpload(file); } };
  const handleQuickAction = (action: string) => { const quickMessages = { 识别食材: "请帮我识别这张图片中的食材", 推荐菜谱: "根据我现有的食材推荐一些菜谱", 烹饪技巧: "给我一些基础的烹饪技巧", 营养建议: "给我一些营养搭配的建议" } as const; const message = quickMessages[action as keyof typeof quickMessages]; if (message) { setInputMessage(message); } };
  const formatTime = (timestamp: string) => { return new Date(timestamp).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }); };

  return (
    <div className="ai-chat-page">
      <NavBar backArrow onBack={() => navigate(-1)}>
        <span className="nav-title">AI厨房助手</span>
      </NavBar>

      <div className="chat-content">
        <List>
          {messages.map((msg) => (
            <List.Item key={msg.id} className={`chat-item ${msg.role}`}>
              <div className="chat-message">
                <div className="message-header">
                  <MessageOutlined />
                  <span className="message-role">{msg.role === 'user' ? '我' : '助手'}</span>
                  <span className="message-time">{formatTime(msg.created_at)}</span>
                </div>
                <div className="message-content">{msg.content}</div>
                {msg.image_url && (
                  <div className="message-image">
                    <img src={msg.image_url} alt="上传图片" />
                  </div>
                )}
              </div>
            </List.Item>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </div>

      <div className="chat-input">
        <Space align="center">
          <Button onClick={handleCameraClick}>
            <CameraOutlined />
          </Button>
          <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />
          <Input value={inputMessage} onChange={setInputMessage} placeholder="请输入消息" clearable />
          <Button color="primary" onClick={handleSendMessage} loading={isLoading}>
            <SendOutlined />
          </Button>
        </Space>
      </div>

      <div className="quick-actions">
        <Space>
          <Button onClick={() => handleQuickAction('识别食材')}><PictureOutlined /> 识别食材</Button>
          <Button onClick={() => handleQuickAction('推荐菜谱')}><PlusOutlined /> 推荐菜谱</Button>
          <Button onClick={() => handleQuickAction('烹饪技巧')}>烹饪技巧</Button>
          <Button onClick={() => handleQuickAction('营养建议')}>营养建议</Button>
        </Space>
      </div>
    </div>
  );
};

export default AIChat;