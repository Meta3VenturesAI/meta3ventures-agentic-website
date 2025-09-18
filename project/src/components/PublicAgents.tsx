import React, { useState, useEffect, useRef } from 'react';
import { Bot, Rocket, Send, Loader2, MessageSquare, X, Minimize2 } from 'lucide-react';
import { adminAgentOrchestrator } from '../services/agents/refactored/AdminAgentOrchestrator';
import { llmService } from '../services/agents/refactored/LLMService';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentId: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  specialties: string[];
  examples: string[];
}

const PublicAgents: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agents: Agent[] = [
    {
      id: 'meta3-assistant',
      name: 'Meta3 Assistant',
      description: 'Your intelligent AI assistant for general queries, business guidance, and Meta3Ventures information.',
      icon: Bot,
      color: 'blue',
      specialties: ['General Assistance', 'Business Guidance', 'Company Information', 'Process Help', 'FAQ Support'],
      examples: [
        'Tell me about Meta3Ventures',
        'How can I apply for funding?',
        'What services do you offer?',
        'Help me understand venture capital'
      ]
    },
    {
      id: 'm3vc-venture-builder',
      name: 'M3VC Venture Builder',
      description: 'Specialized AI agent for venture building, startup guidance, and entrepreneurial support.',
      icon: Rocket,
      color: 'purple',
      specialties: ['Venture Building', 'Startup Guidance', 'Business Planning', 'Market Analysis', 'Growth Strategy'],
      examples: [
        'Help me build my startup',
        'What is the best business model for my idea?',
        'How do I validate my product market fit?',
        'Guide me through the fundraising process'
      ]
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedAgent || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      agentId: selectedAgent.id
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Use real adminAgentOrchestrator for actual AI responses
      const result = await adminAgentOrchestrator.processMessage(
        inputMessage,
        {
          sessionId: `public-${Date.now()}`,
          userId: 'public-user',
          conversationHistory: messages.slice(-5).map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            agentId: msg.agentId
          })),
          currentAgent: selectedAgent.id,
          timestamp: new Date(),
          metadata: {
            userType: 'public',
            source: 'homepage'
          }
        }
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.content || 'I apologize, but I\'m having trouble processing your request right now. Please try again.',
        timestamp: new Date(),
        agentId: selectedAgent.id
      };

      setMessages(prev => [...prev, assistantMessage]);
      toast.success('Response received');
    } catch (error) {
      console.error('Agent error:', error);
      
      // Use real open-source LLMs as fallback
      try {
        console.log('🔄 Using open-source LLM fallback...');
        
        // Create system prompt based on agent type
        let systemPrompt = '';
        if (selectedAgent.id === 'meta3-assistant') {
          systemPrompt = `You are Meta3 Assistant, an AI guide for Meta3Ventures, a cutting-edge venture studio focused on AI innovation and digital transformation. You help users understand our services, AI solutions, and business guidance. Be helpful, professional, and informative.`;
        } else if (selectedAgent.id === 'm3vc-venture-builder') {
          systemPrompt = `You are M3VC Venture Builder, a specialized AI assistant for venture building and startup guidance. You help entrepreneurs with business models, fundraising, market analysis, and growth strategies. Be practical, actionable, and experienced.`;
        } else {
          systemPrompt = `You are a helpful AI assistant. Provide useful and accurate information.`;
        }
        
        // Prepare messages for LLM
        const llmMessages = [
          { role: 'system' as const, content: systemPrompt },
          ...messages.slice(-5).map(msg => ({
            role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content
          })),
          { role: 'user' as const, content: inputMessage }
        ];
        
        // Try to get available providers and use the first available one
        const availableProviders = await llmService.getAvailableProviders();
        const availableProvider = availableProviders.find(p => p.available);
        
        if (availableProvider) {
          console.log(`🤖 Using ${availableProvider.name} for fallback response`);
          
          // Use the first available model from the provider
          const model = availableProvider.models[0] || 'llama3.2:3b';
          
          const llmResponse = await llmService.generateResponse(
            model,
            llmMessages,
            {
              temperature: 0.7,
              maxTokens: 1000,
              preferredProvider: availableProvider.id
            }
          );
          
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: llmResponse.content,
            timestamp: new Date(),
            agentId: selectedAgent.id
          };

          setMessages(prev => [...prev, assistantMessage]);
          toast.success(`Response received via ${availableProvider.name}`);
        } else {
          throw new Error('No LLM providers available');
        }
        
      } catch (llmError) {
        console.error('LLM fallback error:', llmError);
        
        // Final fallback - provide a basic response
        const basicResponse = selectedAgent.id === 'meta3-assistant' 
          ? `I'm Meta3 Assistant, your AI guide for Meta3Ventures. I'm currently experiencing technical difficulties, but I can tell you that Meta3Ventures is a venture studio focused on AI innovation and digital transformation. We help organizations with AI solutions, strategic consulting, and venture building. Please try again later or contact our support team.`
          : `I'm M3VC Venture Builder, your AI assistant for venture building and startup guidance. I'm currently experiencing technical difficulties, but I can help with business models, fundraising, market analysis, and growth strategies. Please try again later or contact our support team.`;
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: basicResponse,
          timestamp: new Date(),
          agentId: selectedAgent.id
        };

        setMessages(prev => [...prev, assistantMessage]);
        toast.error('Using basic fallback response');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    toast.success('Conversation cleared');
  };

  const selectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setMessages([]);
    setIsExpanded(true);
    toast.success(`Connected to ${agent.name}`);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <section id="public-agents" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-400 mb-4">
            AI Agents
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
            Meet Our AI Assistants
          </h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Interact with our specialized AI agents to get instant help with your business questions, 
            venture building guidance, and Meta3Ventures information.
          </p>
        </div>

        {!isExpanded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {agents.map((agent) => {
              const IconComponent = agent.icon;
              return (
                <div
                  key={agent.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => selectAgent(agent)}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`bg-${agent.color}-100 p-3 rounded-full group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`h-8 w-8 text-${agent.color}-600`} />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{agent.name}</h4>
                      <p className="text-gray-600">{agent.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {agent.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 bg-${agent.color}-100 text-${agent.color}-800 text-sm rounded-full`}
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Try asking:</p>
                    {agent.examples.slice(0, 2).map((example, index) => (
                      <p key={index} className="text-sm text-gray-500 italic">
                        "{example}"
                      </p>
                    ))}
                  </div>

                  <button className="w-full mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                    Start Chat
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Chat Header */}
              <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {selectedAgent && (
                    <>
                      <selectedAgent.icon className="h-6 w-6" />
                      <div>
                        <h3 className="font-semibold">{selectedAgent.name}</h3>
                        <p className="text-sm text-indigo-200">{selectedAgent.description}</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={clearConversation}
                    className="p-2 hover:bg-indigo-700 rounded-lg transition-colors"
                    title="Clear conversation"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-2 hover:bg-indigo-700 rounded-lg transition-colors"
                    title="Minimize"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 hover:bg-indigo-700 rounded-lg transition-colors"
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Start a conversation with {selectedAgent?.name}</p>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Try asking:</p>
                      {selectedAgent?.examples.slice(0, 3).map((example, index) => (
                        <button
                          key={index}
                          onClick={() => setInputMessage(example)}
                          className="block w-full text-left text-sm text-indigo-600 hover:text-indigo-800 p-2 rounded hover:bg-indigo-50"
                        >
                          "{example}"
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Ask ${selectedAgent?.name} anything...`}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PublicAgents;
