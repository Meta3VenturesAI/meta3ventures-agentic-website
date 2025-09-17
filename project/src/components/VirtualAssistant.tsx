import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, X, Send, Bot, User, 
  HelpCircle, Calendar, FileText, Mail, 
  ChevronDown, Sparkles, Mic, Paperclip
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminAgentOrchestrator } from '../services/agents/refactored/AdminAgentOrchestrator';
import { enhancedContextManager } from '../services/agents/EnhancedContextManager';
// AgentAuthGuard removed - now available to all users
import { performanceMonitor } from '../services/PerformanceMonitor';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  options?: QuickReply[];
  attachments?: Attachment[];
}

interface QuickReply {
  label: string;
  value: string;
  action?: string;
}

interface Attachment {
  type: 'link' | 'document' | 'action';
  title: string;
  url?: string;
  action?: () => void;
}

interface ChatContext {
  stage: 'greeting' | 'onboarding' | 'support' | 'investment' | 'general';
  userData: {
    name?: string;
    email?: string;
    company?: string;
    interest?: string;
  };
}

export const VirtualAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<ChatContext>({
    stage: 'greeting',
    userData: {}
  });
  const [isMinimized, setIsMinimized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Initialize with greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Message = {
        id: generateId(),
        text: "👋 Hello! I'm Meta3's AI assistant. I'm here to help you explore our venture studio, learn about investment opportunities, or answer any questions. How can I assist you today?",
        sender: 'assistant',
        timestamp: new Date(),
        options: [
          { label: '🚀 Learn about Meta3Ventures', value: 'about' },
          { label: '💼 Investment opportunities', value: 'investment' },
          { label: '📝 Apply for partnership', value: 'apply' },
          { label: '📊 View portfolio', value: 'portfolio' },
          { label: '💬 General inquiry', value: 'general' }
        ]
      };
      setMessages([greeting]);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Process message and generate response
    const response = await processUserMessage(inputValue, context);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, response]);
      
      // Store conversation for analytics
      storeConversation(userMessage, response);
    }, 1000 + Math.random() * 1000);
  };

  const processUserMessage = async (message: string, ctx: ChatContext): Promise<Message> => {
    const startTime = Date.now();
    let success = false;
    
    try {
      // Generate enhanced context for better AI responses
      console.log('🧠 Generating enhanced context for message:', message);
      
      const sessionId = getSessionId();
      const userId = `user-${sessionId}`;
      
      // Get enhanced context with user profile and conversation history
      const enhancedContext = await enhancedContextManager.generateEnhancedContext(
        userId,
        sessionId,
        'virtual-assistant',
        message
      );
      
      console.log('🎯 Enhanced context generated:', enhancedContext);
      
      // Use the sophisticated agent orchestrator system with enhanced context
      const agentResponse = await adminAgentOrchestrator.processMessage(
        message,
        {
          sessionId,
          userId,
          timestamp: new Date(),
          metadata: {
            source: 'virtual-assistant',
            userContext: ctx.userData,
            enhancedContext: {
              userProfile: enhancedContext.userProfile,
              conversationSummary: enhancedContext.conversationHistory.summary,
              currentIntent: enhancedContext.currentSession.currentIntent,
              businessContext: enhancedContext.businessContext,
              relatedTopics: enhancedContext.relatedContext.relatedTopics
            }
          }
        }
      );
      
      console.log('🎯 Agent response received:', agentResponse);
      
      success = true;
      const responseTime = Date.now() - startTime;
      
      // Track performance
      performanceMonitor.trackAgentInteraction(
        'virtual-assistant',
        'Virtual Assistant',
        responseTime,
        true,
        message
      );
      
      // Convert agent response to UI message format
      const responseMessage: Message = {
        id: generateId(),
        text: agentResponse.content,
        sender: 'assistant',
        timestamp: new Date(),
        attachments: agentResponse.attachments?.map(att => ({
          type: att.type as 'link' | 'document' | 'action',
          title: att.title,
          url: att.url
        }))
      };
      
      // Update context based on agent response
      if (message.toLowerCase().includes('invest') || message.toLowerCase().includes('funding')) {
        setContext(prev => ({ ...prev, stage: 'investment' }));
      } else if (message.toLowerCase().includes('apply') || message.toLowerCase().includes('partner')) {
        setContext(prev => ({ ...prev, stage: 'onboarding' }));
      }
      
      return responseMessage;
      
    } catch (error) {
      console.error('🔥 Agent processing failed, falling back to simple responses:', error);
      
      // Track failed interaction
      const responseTime = Date.now() - startTime;
      performanceMonitor.trackAgentInteraction(
        'virtual-assistant',
        'Virtual Assistant',
        responseTime,
        false,
        message
      );
      
      // Track error
      performanceMonitor.trackError(error as Error, 'virtual-assistant-processing');
      
      // Fallback to simple responses if agent system fails
      const lowerMessage = message.toLowerCase();
      
      // Intent detection fallback
      if (lowerMessage.includes('invest') || lowerMessage.includes('funding')) {
        setContext(prev => ({ ...prev, stage: 'investment' }));
        return {
          id: generateId(),
          text: "I see you're interested in investment opportunities! Meta3Ventures focuses on early-stage AI and blockchain companies. We offer:",
          sender: 'assistant',
          timestamp: new Date(),
          attachments: [
            { type: 'link', title: '💰 Investment criteria', url: '/services' },
            { type: 'link', title: '📈 Portfolio performance', url: '/portfolio' },
            { type: 'action', title: '📅 Schedule a call', action: () => navigate('/contact') }
          ],
          options: [
            { label: 'View portfolio', value: 'portfolio' },
            { label: 'Investment process', value: 'process' },
            { label: 'Apply for funding', value: 'apply' }
          ]
        };
      }
    
    if (lowerMessage.includes('apply') || lowerMessage.includes('partner')) {
      setContext(prev => ({ ...prev, stage: 'onboarding' }));
      return {
        id: generateId(),
        text: "Great! I can help you start the partnership application process. First, could you tell me a bit about your company?",
        sender: 'assistant',
        timestamp: new Date(),
        options: [
          { label: 'Start application', value: 'start_apply', action: '/apply' },
          { label: 'Learn requirements', value: 'requirements' },
          { label: 'View success stories', value: 'portfolio' }
        ]
      };
    }
    
    if (lowerMessage.includes('blog') || lowerMessage.includes('article')) {
      return {
        id: generateId(),
        text: "Our blog features insights on AI trends, venture capital, and technology innovation. Here are some popular topics:",
        sender: 'assistant',
        timestamp: new Date(),
        attachments: [
          { type: 'link', title: '📚 Latest articles', url: '/blog' },
          { type: 'link', title: '🤖 AI insights', url: '/blog?category=ai' },
          { type: 'link', title: '💡 Thought leadership', url: '/blog?category=thought-leadership' }
        ]
      };
    }
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('reach') || lowerMessage.includes('email')) {
      return {
        id: generateId(),
        text: "I'd be happy to connect you with our team! You can reach us through:",
        sender: 'assistant',
        timestamp: new Date(),
        attachments: [
          { type: 'link', title: '📧 Contact form', url: '/contact' },
          { type: 'action', title: '📅 Schedule meeting', action: () => window.open('https://calendly.com/meta3ventures', '_blank') }
        ],
        options: [
          { label: 'Send email', value: 'email', action: '/contact' },
          { label: 'Schedule call', value: 'schedule' },
          { label: 'View location', value: 'location' }
        ]
      };
    }
    
    // Handle quick replies
    if (message === 'about') {
      return {
        id: generateId(),
        text: "Meta3Ventures is an AI-focused venture studio and investment fund. We partner with visionary entrepreneurs to build transformative companies in AI, blockchain, and emerging technologies. Our unique approach combines capital, expertise, and strategic partnerships to accelerate growth.",
        sender: 'assistant',
        timestamp: new Date(),
        attachments: [
          { type: 'link', title: '🎯 Our mission', url: '/about' },
          { type: 'link', title: '🤝 Our partners', url: '/partners' },
          { type: 'link', title: '⚡ Our services', url: '/services' }
        ]
      };
    }
    
    if (message === 'portfolio') {
      navigate('/portfolio');
      return {
        id: generateId(),
        text: "I'm redirecting you to our portfolio page where you can explore our successful investments and case studies.",
        sender: 'assistant',
        timestamp: new Date()
      };
    }
    
    // Default response with smart suggestions
    return {
      id: generateId(),
      text: "I understand you're asking about: \"" + message + "\". Let me help you find the right information:",
      sender: 'assistant',
      timestamp: new Date(),
      options: [
        { label: '📞 Talk to team', value: 'contact', action: '/contact' },
        { label: '📚 Browse resources', value: 'resources', action: '/resources' },
        { label: '❓ FAQ', value: 'faq' }
      ]
    };
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    if (reply.action) {
      if (reply.action.startsWith('/')) {
        navigate(reply.action);
      } else {
        handleSend();
      }
    } else {
      setInputValue(reply.value);
      handleSend();
    }
  };

  const storeConversation = (userMsg: Message, assistantMsg: Message) => {
    // Store in localStorage for now, can be sent to Supabase later
    const conversations = JSON.parse(localStorage.getItem('chat_conversations') || '[]');
    conversations.push({
      sessionId: getSessionId(),
      timestamp: new Date().toISOString(),
      userMessage: userMsg.text,
      assistantMessage: assistantMsg.text,
      context: context
    });
    localStorage.setItem('chat_conversations', JSON.stringify(conversations));
    
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'chat_interaction', {
        event_category: 'engagement',
        event_label: context.stage,
        value: 1
      });
    }
  };

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = generateId();
      sessionStorage.setItem('chat_session_id', sessionId);
    }
    return sessionId;
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 group"
          aria-label="Open chat assistant"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
          </div>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Need help? Chat with our AI!
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed z-50 transition-all duration-300 ${
          isMinimized 
            ? 'bottom-6 right-6 w-72 h-16' 
            : 'bottom-6 right-6 w-96 h-[600px] md:w-[450px] md:h-[650px]'
        }`}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col h-full border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bot className="w-8 h-8" />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                </div>
                <div>
                  <h3 className="font-semibold">Meta3 AI Assistant</h3>
                  <p className="text-xs opacity-90">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label="Minimize chat"
                >
                  <ChevronDown className={`w-5 h-5 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setMessages([]);
                    setContext({ stage: 'greeting', userData: {} });
                  }}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className="flex items-start gap-2">
                          {message.sender === 'assistant' && (
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center flex-shrink-0">
                              <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                          )}
                          <div>
                            <div className={`px-4 py-3 rounded-2xl ${
                              message.sender === 'user'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            </div>
                            
                            {/* Attachments */}
                            {message.attachments && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map((att, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => att.url ? navigate(att.url) : att.action?.()}
                                    className="block w-full text-left px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                  >
                                    <span className="text-sm text-indigo-600 dark:text-indigo-400">
                                      {att.title}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                            
                            {/* Quick Replies */}
                            {message.options && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {message.options.map((option, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleQuickReply(option)}
                                    className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {message.sender === 'user' && (
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={isTyping}
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isTyping}
                      className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Send message"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    Powered by Meta3 AI • Your data is secure
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VirtualAssistant;