import React, { useState, useEffect, useRef } from 'react';
import {
  Brain, Search, Target, Users, TrendingUp, BarChart,
  X, Minimize2, Maximize2, Play, Download,
  AlertCircle, FileText, Map,
  Lightbulb, Award, Layers, Grid, List, RefreshCw
} from 'lucide-react';
import { researchAgentsService } from '../services/research-agents.service';
import { dataStorage } from '../services/data-storage.service';
import AgentAuthGuard from './auth/AgentAuthGuard';
import {
  ResearchAgent,
  ResearchSession,
  ResearchRequest,
  AgentFinding,
  CompetitorProfile,
  SWOTItem
} from '../types/research.types';

interface CompetitiveIntelligenceSystemProps {}

const CompetitiveIntelligenceSystem: React.FC<CompetitiveIntelligenceSystemProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeView, setActiveView] = useState<'setup' | 'research' | 'results'>('setup');
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'findings' | 'swot' | 'landscape' | 'competitors'>('dashboard');
  
  // Form state for research request
  const [formData, setFormData] = useState<ResearchRequest>({
    companyName: '',
    industry: '',
    currentDescription: '',
    targetMarket: '',
    mainCompetitors: [],
    currentUSP: '',
    researchDepth: 'standard',
    focusAreas: []
  });

  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Agent role icons
  const agentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    orchestrator: Brain,
    market: TrendingUp,
    competitor: Target,
    customer: Users,
    usp: Lightbulb,
    differentiation: Award
  };

  // Start polling for session updates when research begins
  useEffect(() => {
    if (isResearching && session) {
      pollingInterval.current = setInterval(() => {
        const currentSession = researchAgentsService.getCurrentSession();
        if (currentSession) {
          setSession({ ...currentSession });
          
          if (currentSession.status === 'completed') {
            setIsResearching(false);
            setActiveView('results');
            if (pollingInterval.current) {
              clearInterval(pollingInterval.current);
            }
          }
        }
      }, 1000);
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [isResearching, session]);

  const startResearch = async () => {
    if (!formData.companyName || !formData.industry) {
      alert('Please provide company name and industry');
      return;
    }

    setIsResearching(true);
    setActiveView('research');

    // Store the research request
    await dataStorage.storeFormSubmission({
      type: 'chat',
      data: {
        context: 'competitive-intelligence',
        request: formData,
        timestamp: new Date().toISOString()
      },
      metadata: {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        sessionId: `ci-${Date.now()}`
      }
    });

    // Start the research session
    const newSession = await researchAgentsService.startResearchSession(formData);
    setSession(newSession);

    // Simulate research completion after delay
    setTimeout(async () => {
      await researchAgentsService.synthesizeFindings();
      const finalSession = researchAgentsService.getCurrentSession();
      if (finalSession) {
        setSession({ ...finalSession });
        setIsResearching(false);
        setActiveView('results');
      }
    }, 8000);
  };

  const renderAgentStatus = (agent: ResearchAgent) => {
    const Icon = agentIcons[agent.role] || Brain;
    
    return (
      <div
        key={agent.id}
        onClick={() => setSelectedAgent(agent.id)}
        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
          selectedAgent === agent.id
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
        } ${
          agent.status === 'working' ? 'animate-pulse' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Icon className={`h-5 w-5 ${
              agent.status === 'completed' ? 'text-green-600' :
              agent.status === 'working' ? 'text-blue-600' :
              agent.status === 'error' ? 'text-red-600' :
              'text-gray-400'
            }`} />
            <span className="font-medium text-sm">{agent.name}</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            agent.status === 'completed' ? 'bg-green-100 text-green-700' :
            agent.status === 'working' ? 'bg-blue-100 text-blue-700' :
            agent.status === 'error' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {agent.status}
          </span>
        </div>
        
        {agent.currentTask && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{agent.currentTask}</p>
        )}
        
        {agent.progress !== undefined && agent.status === 'working' && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${agent.progress}%` }}
            />
          </div>
        )}
        
        {agent.findings && agent.findings.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            {agent.findings.length} findings
          </div>
        )}
      </div>
    );
  };

  const renderFindings = () => {
    if (!session?.findings) return null;

    const priorityColors = {
      critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    };

    const typeIcons = {
      insight: Lightbulb,
      data: BarChart,
      recommendation: Target,
      warning: AlertCircle,
      opportunity: TrendingUp
    };

    return (
      <div className="space-y-4">
        {session.findings.map((finding: AgentFinding) => {
          const TypeIcon = typeIcons[finding.type] || FileText;
          return (
            <div key={finding.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <TypeIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-medium text-sm">{finding.category}</span>
                </div>
                {finding.priority && (
                  <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[finding.priority]}`}>
                    {finding.priority}
                  </span>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-2">{finding.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Confidence: {finding.confidence}%</span>
                <span>{new Date(finding.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSWOT = () => {
    if (!session?.swot) return null;

    const sections = [
      { title: 'Strengths', items: session.swot.strengths, color: 'green' },
      { title: 'Weaknesses', items: session.swot.weaknesses, color: 'red' },
      { title: 'Opportunities', items: session.swot.opportunities, color: 'blue' },
      { title: 'Threats', items: session.swot.threats, color: 'orange' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <div key={section.title} className={`bg-${section.color}-50 dark:bg-${section.color}-900/20 rounded-lg p-4`}>
            <h3 className={`font-bold text-${section.color}-700 dark:text-${section.color}-400 mb-3`}>
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.items.map((item: SWOTItem) => (
                <li key={item.id} className="flex items-start">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    • {item.description}
                  </span>
                  <span className={`ml-2 text-xs text-${section.color}-600 dark:text-${section.color}-400`}>
                    ({item.impact}/5)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  const renderCompetitiveLandscape = () => {
    if (!session?.landscape) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4">Competitive Positioning Map</h3>
        <div className="relative h-96 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {/* Quadrant labels */}
          {session.landscape.quadrants?.map((quadrant) => (
            <div
              key={quadrant.name}
              className="absolute text-xs text-gray-500 dark:text-gray-400"
              style={{
                left: `${quadrant.x}%`,
                top: `${100 - quadrant.y - quadrant.height}%`,
                width: `${quadrant.width}%`,
                height: `${quadrant.height}%`
              }}
            >
              <div className="p-2">
                <span className="font-medium">{quadrant.name}</span>
              </div>
            </div>
          ))}
          
          {/* Axis labels */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
            {session.landscape.dimensions.x.label} →
          </div>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-gray-600">
            {session.landscape.dimensions.y.label} →
          </div>
          
          {/* Players */}
          {session.landscape.players.map((player) => (
            <div
              key={player.name}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                player.isUs ? 'z-10' : ''
              }`}
              style={{
                left: `${player.x}%`,
                bottom: `${player.y}%`
              }}
            >
              <div
                className={`rounded-full flex items-center justify-center text-white text-xs font-medium ${
                  player.isUs ? 'ring-4 ring-indigo-300 animate-pulse' : ''
                }`}
                style={{
                  backgroundColor: player.color,
                  width: `${Math.sqrt(player.size) * 10}px`,
                  height: `${Math.sqrt(player.size) * 10}px`
                }}
              >
                {player.name}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
          <span className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-indigo-500 mr-1"></span>
            Us
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-500 mr-1"></span>
            Competitors
          </span>
          <span className="text-gray-500">Bubble size = Market share</span>
        </div>
      </div>
    );
  };

  const renderCompetitors = () => {
    if (!session?.competitors || session.competitors.length === 0) return null;

    return (
      <div className="space-y-4">
        {session.competitors.map((competitor: CompetitorProfile) => (
          <div key={competitor.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">{competitor.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{competitor.description}</p>
              </div>
              {competitor.marketShare && (
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {competitor.marketShare}%
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-green-700 dark:text-green-400 mb-2">Strengths</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  {competitor.strengths.map((strength, idx) => (
                    <li key={idx}>• {strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-sm text-red-700 dark:text-red-400 mb-2">Weaknesses</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  {competitor.weaknesses.map((weakness, idx) => (
                    <li key={idx}>• {weakness}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            {competitor.funding && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Funding: ${(competitor.funding.total / 1000000).toFixed(0)}M ({competitor.funding.lastRound})
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const exportReport = () => {
    if (!session) return;
    
    const report = {
      session: session,
      exportedAt: new Date().toISOString(),
      format: 'competitive-intelligence-report'
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `competitive-intelligence-${session.companyName}-${Date.now()}.json`;
    a.click();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-44 right-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all z-50 group"
        aria-label="Open Competitive Intelligence System"
      >
        <Brain className="h-6 w-6" />
        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          AI
        </span>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Competitive Intelligence System
        </div>
      </button>
    );
  }

  return (
    <AgentAuthGuard agentName="Competitive Intelligence System">
      <div className={`fixed ${isMinimized ? 'bottom-44 right-6' : 'inset-0'} z-50 transition-all`}>
      <div className={`bg-white dark:bg-gray-800 ${isMinimized ? 'w-96 h-14' : 'w-full h-full'} ${!isMinimized && 'sm:inset-4'} sm:rounded-lg shadow-2xl flex flex-col overflow-hidden transition-all`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6" />
            <div>
              <h3 className="font-bold text-lg">Competitive Intelligence System</h3>
              {!isMinimized && (
                <p className="text-xs text-indigo-100">Multi-Agent Research & USP Development</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-700 p-4">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveView('setup')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeView === 'setup'
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Search className="h-4 w-4 inline mr-2" />
                  Setup Research
                </button>
                <button
                  onClick={() => setActiveView('research')}
                  disabled={!session}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeView === 'research'
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  } ${!session && 'opacity-50 cursor-not-allowed'}`}
                >
                  <Brain className="h-4 w-4 inline mr-2" />
                  Agent Activity
                </button>
                <button
                  onClick={() => setActiveView('results')}
                  disabled={!session || session.status !== 'completed'}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeView === 'results'
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  } ${(!session || session.status !== 'completed') && 'opacity-50 cursor-not-allowed'}`}
                >
                  <FileText className="h-4 w-4 inline mr-2" />
                  Results & Insights
                </button>
              </div>

              {session && activeView === 'results' && (
                <div className="mt-6 space-y-2">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    View Options
                  </h4>
                  <button
                    onClick={() => setViewMode('dashboard')}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      viewMode === 'dashboard' ? 'bg-gray-200 dark:bg-gray-700' : ''
                    }`}
                  >
                    <Grid className="h-3 w-3 inline mr-2" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => setViewMode('findings')}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      viewMode === 'findings' ? 'bg-gray-200 dark:bg-gray-700' : ''
                    }`}
                  >
                    <List className="h-3 w-3 inline mr-2" />
                    All Findings
                  </button>
                  <button
                    onClick={() => setViewMode('swot')}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      viewMode === 'swot' ? 'bg-gray-200 dark:bg-gray-700' : ''
                    }`}
                  >
                    <Layers className="h-3 w-3 inline mr-2" />
                    SWOT Analysis
                  </button>
                  <button
                    onClick={() => setViewMode('landscape')}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      viewMode === 'landscape' ? 'bg-gray-200 dark:bg-gray-700' : ''
                    }`}
                  >
                    <Map className="h-3 w-3 inline mr-2" />
                    Landscape
                  </button>
                  <button
                    onClick={() => setViewMode('competitors')}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      viewMode === 'competitors' ? 'bg-gray-200 dark:bg-gray-700' : ''
                    }`}
                  >
                    <Target className="h-3 w-3 inline mr-2" />
                    Competitors
                  </button>
                </div>
              )}

              {session?.status === 'completed' && (
                <button
                  onClick={exportReport}
                  className="w-full mt-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </button>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeView === 'setup' && (
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-2xl font-bold mb-6">Setup Competitive Research</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Company Name *</label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                        placeholder="Your company name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Industry *</label>
                      <input
                        type="text"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                        placeholder="e.g., SaaS, E-commerce, FinTech"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Current Description</label>
                      <textarea
                        value={formData.currentDescription}
                        onChange={(e) => setFormData({ ...formData, currentDescription: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                        rows={3}
                        placeholder="Brief description of what your company does"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Target Market</label>
                      <input
                        type="text"
                        value={formData.targetMarket}
                        onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                        placeholder="e.g., SMBs, Enterprise, Consumers"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Main Competitors</label>
                      <input
                        type="text"
                        onChange={(e) => setFormData({ ...formData, mainCompetitors: e.target.value.split(',').map(s => s.trim()) })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                        placeholder="Comma-separated list of competitors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Research Depth</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['quick', 'standard', 'comprehensive'].map((depth) => (
                          <button
                            key={depth}
                            onClick={() => setFormData({ ...formData, researchDepth: depth as "comprehensive" | "quick" | "standard" })}
                            className={`px-4 py-2 rounded-lg border transition-colors ${
                              formData.researchDepth === depth
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                            }`}
                          >
                            {depth.charAt(0).toUpperCase() + depth.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Focus Areas</label>
                      <div className="space-y-2">
                        {['market', 'competitors', 'customers', 'positioning', 'differentiation'].map((area) => (
                          <label key={area} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.focusAreas?.includes(area as "market" | "competitors" | "positioning" | "customers" | "differentiation") || false}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    focusAreas: [...(formData.focusAreas || []), area as "market" | "competitors" | "positioning" | "customers" | "differentiation"]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    focusAreas: formData.focusAreas?.filter(a => a !== area)
                                  });
                                }
                              }}
                              className="mr-2"
                            />
                            <span className="capitalize">{area} Analysis</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={startResearch}
                      disabled={isResearching || !formData.companyName || !formData.industry}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isResearching ? (
                        <span className="flex items-center justify-center">
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                          Researching...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Play className="h-5 w-5 mr-2" />
                          Start Multi-Agent Research
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeView === 'research' && session && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">Research in Progress</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Multiple AI agents are analyzing your competitive landscape
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {session.agents.map((agent) => renderAgentStatus(agent))}
                  </div>

                  {selectedAgent && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                      <h3 className="font-bold mb-4">
                        {session.agents.find(a => a.id === selectedAgent)?.name} Activity
                      </h3>
                      <div className="space-y-3">
                        {session.agents
                          .find(a => a.id === selectedAgent)
                          ?.findings?.map((finding) => (
                            <div key={finding.id} className="bg-white dark:bg-gray-800 rounded p-3">
                              <p className="text-sm">{finding.content}</p>
                              <span className="text-xs text-gray-500">
                                {new Date(finding.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeView === 'results' && session?.status === 'completed' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">Research Complete</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Analysis for {session.companyName} in {session.industry}
                    </p>
                  </div>

                  {viewMode === 'dashboard' && (
                    <div className="space-y-6">
                      {/* USP Canvas */}
                      {session.uspCanvas && (
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-6">
                          <h3 className="font-bold text-lg mb-4">Recommended USP</h3>
                          <h4 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">
                            {session.uspCanvas.valueProposition.headline}
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300 mb-4">
                            {session.uspCanvas.valueProposition.subheadline}
                          </p>
                          <div className="bg-white dark:bg-gray-800 rounded p-4">
                            <p className="text-sm font-medium mb-2">Positioning Statement:</p>
                            <p className="text-gray-700 dark:text-gray-300">
                              {session.uspCanvas.positioning.statement}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Key Recommendations */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                        <h3 className="font-bold text-lg mb-4">Strategic Recommendations</h3>
                        <div className="space-y-4">
                          {session.recommendations.slice(0, 3).map((rec, idx) => (
                            <div key={idx} className="border-l-4 border-indigo-500 pl-4">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium">{rec.description}</h4>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  rec.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                  rec.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {rec.priority}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {rec.rationale}
                              </p>
                              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                <span>Impact: {rec.expectedImpact}</span>
                                <span>Timeline: {rec.timeframe}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Market Overview */}
                      {session.marketAnalysis && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                          <h3 className="font-bold text-lg mb-4">Market Analysis</h3>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                ${(session.marketAnalysis.marketSize.tam / 1000000000).toFixed(1)}B
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">TAM</p>
                            </div>
                            <div className="text-center">
                              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {session.marketAnalysis.growthRate.toFixed(1)}%
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
                            </div>
                            <div className="text-center">
                              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {session.marketAnalysis.segments.length}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Segments</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {viewMode === 'findings' && renderFindings()}
                  {viewMode === 'swot' && renderSWOT()}
                  {viewMode === 'landscape' && renderCompetitiveLandscape()}
                  {viewMode === 'competitors' && renderCompetitors()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </AgentAuthGuard>
  );
};

export default CompetitiveIntelligenceSystem;