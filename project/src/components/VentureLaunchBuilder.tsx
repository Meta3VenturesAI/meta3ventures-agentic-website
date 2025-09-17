import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle, X, Send, Minimize2, Maximize2, Bot,
  TrendingUp, Target, Users, DollarSign, Lightbulb,
  BarChart, FileText, Shield, Code, Globe, Brain,
  Rocket, BookOpen, Award, Calendar, CheckCircle
} from 'lucide-react';
import { dataStorage } from '../services/data-storage.service';
import { adminAgentOrchestrator } from '../services/agents/refactored/AdminAgentOrchestrator';
// AgentAuthGuard removed - now available to all users
import toast from 'react-hot-toast';

interface BuilderMessage {
  id: string;
  type: 'user' | 'advisor';
  content: string;
  timestamp: Date;
  category?: string;
  attachments?: {
    type: 'link' | 'document' | 'template' | 'checklist';
    title: string;
    url?: string;
    items?: string[];
  }[];
  actions?: {
    label: string;
    action: string;
    primary?: boolean;
  }[];
}

interface StartupProfile {
  stage: 'idea' | 'mvp' | 'launch' | 'growth' | 'scale';
  industry: string;
  fundingStage: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'later';
  teamSize: number;
  challenges: string[];
  goals: string[];
}

interface AdvisorContext {
  profile?: StartupProfile;
  sessionId: string;
  lastInteraction?: Date;
  adviceHistory: string[];
}

export const VentureLaunchBuilder: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<BuilderMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Use the admin agent orchestrator for proper LLM integration
  const [context, setContext] = useState<AdvisorContext>({
    sessionId: `vlb-${Date.now()}`,
    adviceHistory: []
  });
  const [activeModule, setActiveModule] = useState<string>('main');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const modules = [
    { id: 'strategy', name: 'Strategic Planning', icon: Target, color: 'indigo' },
    { id: 'market', name: 'Market Analysis', icon: TrendingUp, color: 'blue' },
    { id: 'fundraising', name: 'Fundraising', icon: DollarSign, color: 'green' },
    { id: 'product', name: 'Product Development', icon: Code, color: 'purple' },
    { id: 'team', name: 'Team Building', icon: Users, color: 'orange' },
    { id: 'metrics', name: 'KPI Tracking', icon: BarChart, color: 'pink' }
  ];

  const quickActions = [
    'Create Business Plan',
    'Market Validation',
    'Pitch Deck Review',
    'Find Investors',
    'MVP Roadmap',
    'Growth Strategy'
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: BuilderMessage = {
        id: '1',
        type: 'advisor',
        content: `Welcome to M3VC Venture Launch Builder! 🚀
        
I'm your AI-powered strategic advisor, here to guide you through every stage of your startup journey. Whether you're validating an idea, building an MVP, or scaling your business, I provide tailored guidance based on proven methodologies and real-world insights.

How can I help you today?`,
        timestamp: new Date(),
        category: 'welcome',
        actions: [
          { label: 'Start Strategic Planning', action: 'strategy', primary: true },
          { label: 'Validate My Idea', action: 'validate' },
          { label: 'Get Funding Guidance', action: 'funding' },
          { label: 'Build MVP Roadmap', action: 'mvp' }
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const processAdvisorResponse = async (userInput: string, actionType?: string): Promise<BuilderMessage> => {
    const msgId = Date.now().toString();
    
    try {
      // Use real AI agent for intelligent responses
      const contextMessage = `Venture Launch Builder context: ${actionType || 'general guidance'}. Session history: ${context.adviceHistory.slice(-3).join(', ')}`;
      
      const agentResponse = await adminAgentOrchestrator.processMessage(userInput, {
        sessionId: context.sessionId,
        userId: 'venture-builder-user',
        timestamp: new Date(),
        metadata: { 
          component: 'VentureLaunchBuilder',
          actionType,
          context: contextMessage,
          preferredAgent: 'venture-launch'
        }
      });

      // Convert agent response to BuilderMessage format
      return {
        id: msgId,
        type: 'advisor',
        content: agentResponse.content,
        timestamp: new Date(),
        category: actionType || 'general',
        attachments: agentResponse.attachments?.map(att => ({
          type: att.type as 'link' | 'document' | 'template' | 'checklist',
          title: att.title,
          url: att.url,
          items: att.content ? [att.content] : undefined
        })) || [],
        actions: agentResponse.suggestedActions?.map(action => ({
          label: action.label,
          action: action.action,
          primary: false
        })) || []
      };
    } catch (error) {
      console.error('LLM Agent error:', error);
      toast.error('AI advisor temporarily unavailable. Using backup response.');
      
      // Fallback to high-quality static response if LLM fails
      return {
        id: msgId,
        type: 'advisor',
        content: `I understand you're looking for guidance on "${userInput}". Let me provide you with actionable insights.

Based on your query, here are my recommendations:

**Immediate Next Steps:**
• Validate your core assumptions with potential customers
• Build a minimal viable product to test market fit
• Create a clear value proposition and positioning
• Develop a sustainable business model

**Resources to Help You:**
• Customer discovery interviews and surveys
• MVP development frameworks and methodologies
• Business model canvas and strategic planning tools
• Market analysis and competitive research techniques

Which of these areas would you like to explore in more detail?`,
        timestamp: new Date(),
        category: actionType || 'general',
        actions: [
          { label: 'Market Validation', action: 'validate', primary: true },
          { label: 'Build MVP', action: 'mvp' },
          { label: 'Strategic Planning', action: 'strategy' },
          { label: 'Get Funding Guidance', action: 'funding' }
        ]
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: BuilderMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Store the conversation
    await dataStorage.storeFormSubmission({
      type: 'chat',
      data: {
        message: inputValue,
        context: 'venture-launch-builder',
        sessionId: context.sessionId
      },
      metadata: {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        sessionId: context.sessionId
      }
    });

    // Simulate advisor thinking
    setTimeout(async () => {
      const response = await processAdvisorResponse(inputValue);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
      
      // Update context
      setContext(prev => ({
        ...prev,
        lastInteraction: new Date(),
        adviceHistory: [...prev.adviceHistory, inputValue]
      }));
    }, 1500);
  };

  const handleActionClick = async (action: string) => {
    const response = await processAdvisorResponse('', action);
    setMessages(prev => [...prev, response]);
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    handleSendMessage();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-24 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all z-50 group focus:outline-none focus:ring-4 focus:ring-purple-400"
        aria-label="Open M3VC Venture Launch Builder - AI Strategic Advisor for Startups"
        aria-expanded={isOpen}
        role="button"
      >
        <Rocket className="h-6 w-6" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          AI
        </span>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          M3VC Venture Launch Builder
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed ${isMinimized ? 'bottom-6 right-6' : 'bottom-0 right-0 sm:bottom-6 sm:right-6'} z-50 transition-all`}>
      <div className={`bg-white dark:bg-gray-800 ${isMinimized ? 'w-80' : 'w-full sm:w-[500px]'} ${isMinimized ? 'h-14' : 'h-[600px]'} sm:rounded-lg shadow-2xl flex flex-col overflow-hidden transition-all`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Rocket className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-green-400 h-2 w-2 rounded-full animate-pulse"></span>
            </div>
            <div>
              <h3 className="font-bold text-lg">M3VC Venture Launch Builder</h3>
              {!isMinimized && (
                <p className="text-xs text-purple-100">AI Strategic Advisor for Startups</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Module Tabs */}
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 flex space-x-2 overflow-x-auto">
              {modules.map(module => {
                const Icon = module.icon;
                return (
                  <button
                    key={module.id}
                    onClick={() => setActiveModule(module.id)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                      activeModule === module.id
                        ? `bg-${module.color}-100 text-${module.color}-700 dark:bg-${module.color}-900 dark:text-${module.color}-300`
                        : 'bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{module.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    {message.type === 'advisor' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                          <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">AI Advisor</span>
                      </div>
                    )}
                    
                    <div className={`rounded-lg p-4 ${
                      message.type === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      <p className="whitespace-pre-line text-sm">{message.content}</p>
                      
                      {message.attachments && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((attachment, idx) => (
                            <div key={idx} className="border border-gray-300 dark:border-gray-600 rounded p-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium">{attachment.title}</span>
                                {attachment.type === 'template' && <FileText className="h-3 w-3" />}
                                {attachment.type === 'checklist' && <CheckCircle className="h-3 w-3" />}
                              </div>
                              {attachment.items && (
                                <ul className="mt-2 text-xs space-y-1">
                                  {attachment.items.map((item, i) => (
                                    <li key={i} className="flex items-start">
                                      <span className="mr-1">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {message.actions && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.actions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleActionClick(action.action)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                action.primary
                                  ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                                  : 'bg-indigo-500/20 text-white hover:bg-indigo-500/30'
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <span className="text-xs text-gray-400 mt-1 block">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action)}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-xs text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t dark:border-gray-700">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about strategy, funding, growth..."
                  className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={isTyping || !inputValue.trim()}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label="Send message"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VentureLaunchBuilder;