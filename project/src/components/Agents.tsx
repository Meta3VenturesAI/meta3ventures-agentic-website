/**
 * Agents Page - Professional Virtual Agent Showcase and Testing Environment
 * Displays all available virtual agents with interactive testing capabilities
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Brain, MessageSquare, Zap, Target, TrendingUp,
  BarChart3, Scale, MapPin, Users, Lightbulb,
  Send, Copy, Download, RefreshCw, Play,
  CheckCircle, XCircle
} from 'lucide-react';
import { adminAgentOrchestrator } from '../services/agents/refactored/AdminAgentOrchestrator';
import AgentAuthGuard from './auth/AgentAuthGuard';
import toast from 'react-hot-toast';

interface AgentInfo {
  id: string;
  name: string;
  description: string;
  specialties: string[];
  icon: React.ComponentType<{ className?: string; size?: string | number }>;
  color: string;
  category: 'core' | 'specialized' | 'support';
  priority: number;
  examples: string[];
}

interface TestResult {
  agentId: string;
  query: string;
  response: string;
  timestamp: Date;
  processingTime: number;
  success: boolean;
}

interface AgentStats {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  lastUpdated: Date;
}

const Agents: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null);
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [agentStats, setAgentStats] = useState<AgentStats | null>(null);
  const [_performanceMetrics, setPerformanceMetrics] = useState({
    totalTests: 0,
    successfulTests: 0,
    averageResponseTime: 0,
    fastestResponse: Infinity,
    slowestResponse: 0
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Define all available agents with their information
  const agentCatalog: AgentInfo[] = [
    {
      id: 'meta3-research',
      name: 'Research Specialist',
      description: 'Expert market researcher providing comprehensive industry analysis, competitive intelligence, and strategic market insights.',
      specialties: ['Market Research', 'Competitive Analysis', 'Industry Trends', 'Market Sizing', 'Strategic Intelligence', 'Data Analysis'],
      icon: BarChart3,
      color: 'blue',
      category: 'core',
      priority: 70,
      examples: [
        'Analyze the AI/ML market trends for 2024',
        'Research competitive landscape for fintech startups',
        'What is the market size for SaaS solutions in healthcare?',
        'Provide industry analysis for blockchain technology'
      ]
    },
    {
      id: 'meta3-investment',
      name: 'Investment Specialist',
      description: 'Expert in investment analysis, funding processes, market trends, and portfolio strategy. Provides professional-grade investment guidance.',
      specialties: ['Investment Analysis', 'Funding Strategy', 'Market Research', 'Portfolio Management', 'Valuation', 'Due Diligence'],
      icon: TrendingUp,
      color: 'green',
      category: 'core',
      priority: 75,
      examples: [
        'What are the current funding trends in early-stage ventures?',
        'Analyze investment opportunities in AI startups',
        'Help me understand Series A funding requirements',
        'Evaluate the investment potential of a fintech company'
      ]
    },
    {
      id: 'venture-launch',
      name: 'Venture Launch Builder',
      description: 'Specializes in venture creation, business planning, and startup development. Guides entrepreneurs through the startup journey.',
      specialties: ['Business Plan Development', 'Market Validation', 'Go-to-Market Strategy', 'Product-Market Fit', 'Startup Guidance', 'MVP Development'],
      icon: Lightbulb,
      color: 'purple',
      category: 'specialized',
      priority: 85,
      examples: [
        'Help me create a business plan for my startup',
        'How do I validate my product idea?',
        'What is the best go-to-market strategy for SaaS?',
        'Guide me through MVP development process'
      ]
    },
    {
      id: 'competitive-intelligence',
      name: 'Competitive Intelligence',
      description: 'Provides detailed competitive analysis, market positioning insights, and strategic intelligence for business advantage.',
      specialties: ['Competitive Analysis', 'Market Intelligence', 'Strategic Positioning', 'Threat Assessment', 'Market Share Analysis'],
      icon: Target,
      color: 'red',
      category: 'specialized',
      priority: 75,
      examples: [
        'Analyze our main competitors in the market',
        'What are the competitive advantages of leading players?',
        'How should we position against established competitors?',
        'Identify emerging threats in our industry'
      ]
    },
    {
      id: 'meta3-marketing',
      name: 'Marketing Specialist',
      description: 'Expert in marketing strategy, brand development, and growth marketing for startups and venture portfolio companies.',
      specialties: ['Marketing Strategy', 'Brand Development', 'Growth Marketing', 'Content Strategy', 'Digital Marketing', 'Campaign Management'],
      icon: Zap,
      color: 'orange',
      category: 'specialized',
      priority: 70,
      examples: [
        'Create a marketing strategy for our B2B SaaS product',
        'How do we build brand awareness in the tech industry?',
        'What are the best growth marketing tactics for startups?',
        'Help me plan a product launch campaign'
      ]
    },
    {
      id: 'meta3-financial',
      name: 'Financial Specialist',
      description: 'Provides financial analysis, modeling, and strategic financial guidance for ventures and investment decisions.',
      specialties: ['Financial Modeling', 'Valuation', 'Financial Planning', 'Risk Assessment', 'Investment Analysis', 'Performance Metrics'],
      icon: BarChart3,
      color: 'indigo',
      category: 'specialized',
      priority: 75,
      examples: [
        'Help me create financial projections for my startup',
        'What valuation methods should I use for a tech company?',
        'Analyze the financial health of a potential investment',
        'Create a fundraising financial model'
      ]
    },
    {
      id: 'meta3-legal',
      name: 'Legal Specialist',
      description: 'Provides legal guidance, compliance advice, and regulatory insights for startups and venture capital activities.',
      specialties: ['Legal Compliance', 'Contract Analysis', 'Regulatory Guidance', 'IP Strategy', 'Corporate Structure', 'Risk Management'],
      icon: Scale,
      color: 'gray',
      category: 'support',
      priority: 70,
      examples: [
        'What legal structure is best for my startup?',
        'Help me understand IP protection strategies',
        'What compliance requirements apply to fintech startups?',
        'Review key terms in this investment agreement'
      ]
    },
    {
      id: 'meta3-support',
      name: 'Support Specialist',
      description: 'Provides general support, guidance, and assistance with Meta3Ventures services and processes.',
      specialties: ['Customer Support', 'Process Guidance', 'General Assistance', 'Service Information', 'FAQ Support'],
      icon: Users,
      color: 'teal',
      category: 'support',
      priority: 60,
      examples: [
        'How do I apply for funding from Meta3Ventures?',
        'What services does Meta3Ventures offer?',
        'Help me navigate the application process',
        'What are the requirements for partnership?'
      ]
    },
    {
      id: 'meta3-local',
      name: 'Local Market Specialist',
      description: 'Expert in local market dynamics, regional opportunities, and location-specific business strategies.',
      specialties: ['Local Market Analysis', 'Regional Opportunities', 'Location Strategy', 'Local Partnerships', 'Geographic Expansion'],
      icon: MapPin,
      color: 'emerald',
      category: 'specialized',
      priority: 65,
      examples: [
        'Analyze the startup ecosystem in Silicon Valley',
        'What are the opportunities in emerging markets?',
        'Help me understand local regulations for expansion',
        'Identify regional partnership opportunities'
      ]
    },
    {
      id: 'general-conversation',
      name: 'General Assistant',
      description: 'Friendly, knowledgeable assistant for general queries, introductions, and broad topic discussions.',
      specialties: ['General Conversation', 'Information Retrieval', 'Query Routing', 'Basic Assistance', 'Introductions'],
      icon: MessageSquare,
      color: 'blue',
      category: 'support',
      priority: 80,
      examples: [
        'Tell me about Meta3Ventures',
        'What can the virtual agents help me with?',
        'I need general business advice',
        'How does venture capital work?'
      ]
    }
  ];

  useEffect(() => {
    loadAgentStats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [testResults]);

  const loadAgentStats = async () => {
    try {
      const stats = await adminAgentOrchestrator.performSystemDiagnostics();
      // Convert the orchestrator stats to AgentStats format
      const agentStats: AgentStats = {
        totalRequests: stats.agents?.length || 0,
        successRate: stats.agents?.filter(a => a.health === 'healthy').length / (stats.agents?.length || 1) * 100 || 0,
        averageResponseTime: stats.performance?.responseTime || 0,
        lastUpdated: new Date()
      };
      setAgentStats(agentStats);
    } catch (error) {
      console.error('Failed to load agent stats:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTestAgent = async () => {
    if (!selectedAgent || !testQuery.trim()) {
      toast.error('Please select an agent and enter a test query');
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      // Use the agent orchestrator to process the message
      const response = await adminAgentOrchestrator.processMessage(testQuery, {
        sessionId: `test-${Date.now()}`,
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {
          source: 'agent-testing',
          preferredAgent: selectedAgent.id
        }
      });

      const processingTime = Date.now() - startTime;

      const testResult: TestResult = {
        agentId: selectedAgent.id,
        query: testQuery,
        response: response.content,
        timestamp: new Date(),
        processingTime,
        success: true
      };

      setTestResults(prev => [...prev, testResult]);
      setTestQuery('');
      
      // Update performance metrics
      setPerformanceMetrics(prev => ({
        totalTests: prev.totalTests + 1,
        successfulTests: prev.successfulTests + 1,
        averageResponseTime: Math.round((prev.averageResponseTime * prev.totalTests + processingTime) / (prev.totalTests + 1)),
        fastestResponse: Math.min(prev.fastestResponse, processingTime),
        slowestResponse: Math.max(prev.slowestResponse, processingTime)
      }));
      
      toast.success(`Agent responded in ${processingTime}ms`);
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Enhanced error handling with more context
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Provide helpful error context
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes('fetch')) {
        userFriendlyMessage = 'Network connection issue. The agent system may be starting up.';
      } else if (errorMessage.includes('LLM')) {
        userFriendlyMessage = 'LLM service temporarily unavailable. Using fallback response system.';
      }

      const testResult: TestResult = {
        agentId: selectedAgent.id,
        query: testQuery,
        response: `⚠️ ${userFriendlyMessage}\n\nFallback Response: I'm Meta3's AI Assistant. While our advanced LLM systems are being configured, I can still help you with questions about Meta3 Ventures, our investment focus, and startup guidance. Please try again or rephrase your question.`,
        timestamp: new Date(),
        processingTime,
        success: false
      };

      setTestResults(prev => [...prev, testResult]);
      
      // Update performance metrics for failed tests
      setPerformanceMetrics(prev => ({
        totalTests: prev.totalTests + 1,
        successfulTests: prev.successfulTests, // Don't increment for failures
        averageResponseTime: Math.round((prev.averageResponseTime * prev.totalTests + processingTime) / (prev.totalTests + 1)),
        fastestResponse: prev.fastestResponse,
        slowestResponse: Math.max(prev.slowestResponse, processingTime)
      }));
      
      toast.error(`Agent test completed with fallback: ${userFriendlyMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleQuery = (example: string) => {
    setTestQuery(example);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const exportResults = () => {
    const data = {
      timestamp: new Date().toISOString(),
      agent: selectedAgent?.name,
      results: testResults
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-test-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearResults = () => {
    setTestResults([]);
    toast.success('Test results cleared');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'bg-blue-100 text-blue-800';
      case 'specialized': return 'bg-purple-100 text-purple-800';
      case 'support': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'border-blue-200 bg-blue-50 text-blue-900',
      green: 'border-green-200 bg-green-50 text-green-900',
      purple: 'border-purple-200 bg-purple-50 text-purple-900',
      red: 'border-red-200 bg-red-50 text-red-900',
      orange: 'border-orange-200 bg-orange-50 text-orange-900',
      indigo: 'border-indigo-200 bg-indigo-50 text-indigo-900',
      gray: 'border-gray-200 bg-gray-50 text-gray-900',
      teal: 'border-teal-200 bg-teal-50 text-teal-900',
      emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900'
    };
    return colors[color] || colors.blue;
  };

  return (
    <AgentAuthGuard agentName="Virtual Agents Showcase">
      <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Virtual Agent Showcase
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore and test our specialized virtual agents. Each agent is designed for specific use cases 
            and provides expert-level assistance in their domain.
          </p>
          {agentStats && (
            <div className="mt-6 flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{agentCatalog.length}</div>
                <div className="text-sm text-gray-500">Available Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testResults.filter(r => r.success).length}</div>
                <div className="text-sm text-gray-500">Successful Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {testResults.length > 0 ? Math.round(testResults.reduce((sum, r) => sum + r.processingTime, 0) / testResults.length) : 0}ms
                </div>
                <div className="text-sm text-gray-500">Avg Response Time</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agent Selection Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Bot className="h-5 w-5 mr-2 text-blue-600" />
                Select Agent
              </h2>
              
              <div className="space-y-3">
                {agentCatalog.map((agent) => {
                  const Icon = agent.icon;
                  const isSelected = selectedAgent?.id === agent.id;
                  
                  return (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? `${getColorClasses(agent.color)} border-current` 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <Icon className={`h-5 w-5 mr-3 mt-0.5 ${isSelected ? 'text-current' : 'text-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium ${isSelected ? 'text-current' : 'text-gray-900'}`}>
                            {agent.name}
                          </h3>
                          <p className={`text-sm mt-1 ${isSelected ? 'text-current opacity-80' : 'text-gray-500'}`}>
                            {agent.description}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(agent.category)}`}>
                              {agent.category}
                            </span>
                            <span className="text-xs text-gray-400">
                              Priority: {agent.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Agent Testing Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  Agent Testing Environment
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={exportResults}
                    disabled={testResults.length === 0}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </button>
                  <button
                    onClick={clearResults}
                    disabled={testResults.length === 0}
                    className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Clear
                  </button>
                </div>
              </div>

              {selectedAgent ? (
                <div className="space-y-6">
                  {/* Agent Details */}
                  <div className={`p-4 rounded-lg border-2 ${getColorClasses(selectedAgent.color)}`}>
                    <div className="flex items-center mb-3">
                      <selectedAgent.icon className="h-6 w-6 mr-3" />
                      <h3 className="text-lg font-semibold">{selectedAgent.name}</h3>
                    </div>
                    <p className="mb-3 opacity-90">{selectedAgent.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgent.specialties.map((specialty, index) => (
                        <span key={index} className="px-2 py-1 bg-white bg-opacity-50 rounded text-sm">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Example Queries */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Example Queries:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedAgent.examples.map((example, index) => (
                        <button
                          key={index}
                          onClick={() => handleExampleQuery(example)}
                          className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-md text-sm border border-gray-200 transition-colors"
                        >
                          <Play className="h-3 w-3 inline mr-2 text-gray-400" />
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Test Input */}
                  <div>
                    <label className="block font-medium text-gray-900 mb-2">Test Query:</label>
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={testQuery}
                        onChange={(e) => setTestQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleTestAgent()}
                        placeholder="Enter your test query..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleTestAgent}
                        disabled={isLoading || !testQuery.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {isLoading ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Test
                      </button>
                    </div>
                  </div>

                  {/* Test Results */}
                  {testResults.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Test Results:</h4>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {testResults.map((result, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {result.success ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="font-medium text-gray-900">
                                  {agentCatalog.find(a => a.id === result.agentId)?.name}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {result.processingTime}ms
                                </span>
                              </div>
                              <button
                                onClick={() => copyToClipboard(result.response)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-700">Query: </span>
                              <span className="text-sm text-gray-600">{result.query}</span>
                            </div>
                            <div className="bg-gray-50 rounded p-3">
                              <span className="text-sm font-medium text-gray-700">Response: </span>
                              <div className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                                {result.response}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              {result.timestamp.toLocaleString()}
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Agent to Test</h3>
                  <p className="text-gray-500">
                    Choose a virtual agent from the left panel to start testing its capabilities.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </AgentAuthGuard>
  );
};

export default Agents;
// Force rebuild trigger - Sun Sep 14 16:00:18 IDT 2025
