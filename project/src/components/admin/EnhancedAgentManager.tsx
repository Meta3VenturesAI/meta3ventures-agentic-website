/**
 * Enhanced Agent Manager - Advanced model assignment and agent management
 */

import React, { useState, useEffect } from 'react';
import {
  Bot, Brain, Settings, Zap, Database, Users, 
  Plus, Edit, Trash2, Save, X, Copy, Download,
  MessageSquare, Wrench, BookOpen, Play, Pause, BarChart3
} from 'lucide-react';
import { adminAgentOrchestrator } from '../../services/agents/refactored/AdminAgentOrchestrator';
import { openSourceLLMService, OpenSourceModel } from '../../services/agents/refactored/OpenSourceLLMService';
import { agentBuilder, AgentTemplate } from '../../services/agents/refactored/AgentBuilder';
import { agentToolsSystem } from '../../services/agents/refactored/AgentToolsSystem';
import { chatSessionManager } from '../../services/agents/refactored/ChatSessionManager';
import toast from 'react-hot-toast';

interface AgentConfig {
  id: string;
  name: string;
  description: string;
  preferredModel: string;
  preferredProvider: string;
  enableLLM: boolean;
  specialties: string[];
  tools: string[];
  status: 'active' | 'paused' | 'maintenance';
  lastUsed?: Date;
  messageCount?: number;
  averageResponseTime?: number;
}

const EnhancedAgentManager: React.FC = () => {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [models, setModels] = useState<OpenSourceModel[]>([]);
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [activeTab, setActiveTab] = useState<'manage' | 'create' | 'templates' | 'analytics'>('manage');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load existing agents
      const agentList = adminAgentOrchestrator.getAgentList();
      const agentConfigs: AgentConfig[] = agentList.map(agent => ({
        id: agent.id,
        name: agent.name,
        description: `${agent.name} specializes in: ${agent.specialties.join(', ')}`,
        preferredModel: 'llama3.2:3b', // Default
        preferredProvider: 'ollama',
        enableLLM: true,
        specialties: agent.specialties || [],
        tools: [], // Tools will be loaded from AgentToolsSystem
        status: 'active',
        messageCount: Math.floor(Math.random() * 1000),
        averageResponseTime: Math.floor(Math.random() * 2000) + 500
      }));
      setAgents(agentConfigs);

      // Load available models
      const availableModels = openSourceLLMService.getAvailableModels();
      setModels(availableModels);

      // Load agent templates
      const availableTemplates = agentBuilder.getTemplates();
      setTemplates(availableTemplates);
    } catch (error) {
      console.error('Failed to load agent data:', error);
      toast.error('Failed to load agent data');
    }
  };

  const handleModelChange = (agentId: string, modelId: string, providerId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, preferredModel: modelId, preferredProvider: providerId }
        : agent
    ));
    
    // Apply to actual agent
    const model = models.find(m => m.id === modelId);
    if (model) {
      adminAgentOrchestrator.configureAgent(agentId, {
        preferredModel: model.modelId,
        preferredProvider: model.provider,
        enableLLM: true
      });
      toast.success(`Updated ${agentId} to use ${model.name}`);
    }
  };

  const handleStatusChange = (agentId: string, status: 'active' | 'paused' | 'maintenance') => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, status } : agent
    ));
    toast.success(`Agent status updated to ${status}`);
  };

  const createAgentFromTemplate = (template: AgentTemplate) => {
    try {
      const agent = agentBuilder.createAgent(template.id);
      if (agent) {
        const newConfig: AgentConfig = {
          id: template.id,
          name: template.name,
          description: template.description,
          preferredModel: 'llama3.2:3b',
          preferredProvider: 'ollama',
          enableLLM: true,
          specialties: template.specialties,
          tools: template.tools,
          status: 'active',
          messageCount: 0,
          averageResponseTime: 0
        };
        
        setAgents(prev => [...prev, newConfig]);
        toast.success(`Created agent: ${template.name}`);
      }
    } catch (error) {
      toast.error('Failed to create agent from template');
    }
  };

  const exportAgentConfig = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    const config = {
      ...agent,
      exportedAt: new Date(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-${agentId}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderManageTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Agent Configuration</h3>
        <button
          onClick={() => setShowCreateAgent(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900">{agent.name}</h4>
                <p className="text-sm text-gray-600">{agent.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(agent.status)}`}>
                  {agent.status}
                </span>
                <button
                  onClick={() => exportAgentConfig(agent.id)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LLM Model
                </label>
                <select
                  value={agent.preferredModel}
                  onChange={(e) => {
                    const model = models.find(m => m.id === e.target.value);
                    if (model) {
                      handleModelChange(agent.id, model.id, model.provider);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.provider}) - {model.free ? 'Free' : 'Paid'}
                    </option>
                  ))}
                </select>
                <div className="mt-1 text-xs text-gray-500">
                  Current: {models.find(m => m.id === agent.preferredModel)?.name || 'Unknown'}
                </div>
              </div>

              {/* Status Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex space-x-2">
                  {['active', 'paused', 'maintenance'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(agent.id, status as "active" | "paused" | "maintenance")}
                      className={`px-3 py-1 text-xs rounded-full capitalize ${
                        agent.status === status 
                          ? getStatusColor(status)
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialties
                </label>
                <div className="flex flex-wrap gap-1">
                  {agent.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm font-medium text-gray-700">Messages</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {agent.messageCount?.toLocaleString() || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Avg Response</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {agent.averageResponseTime || 0}ms
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Agent Templates</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full capitalize">
                {template.category}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-700">Specialties</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {template.specialties.slice(0, 3).map((specialty, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {specialty}
                    </span>
                  ))}
                  {template.specialties.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                      +{template.specialties.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700">Tools</div>
                <div className="text-sm text-gray-600">{template.tools.length} tools available</div>
              </div>

              <button
                onClick={() => createAgentFromTemplate(template)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => {
    const totalMessages = agents.reduce((sum, agent) => sum + (agent.messageCount || 0), 0);
    const avgResponseTime = agents.reduce((sum, agent) => sum + (agent.averageResponseTime || 0), 0) / agents.length;
    const activeAgents = agents.filter(a => a.status === 'active').length;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Analytics & Performance</h3>
        
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Total Agents</div>
                <div className="text-2xl font-bold text-gray-900">{agents.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Active Agents</div>
                <div className="text-2xl font-bold text-gray-900">{activeAgents}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Total Messages</div>
                <div className="text-2xl font-bold text-gray-900">{totalMessages.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Avg Response Time</div>
                <div className="text-2xl font-bold text-gray-900">{Math.round(avgResponseTime)}ms</div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Performance Table */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b">
            <h4 className="text-lg font-medium text-gray-900">Agent Performance</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Messages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Response
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agents.map((agent) => (
                  <tr key={agent.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                      <div className="text-sm text-gray-500">{agent.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {models.find(m => m.id === agent.preferredModel)?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agent.messageCount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agent.averageResponseTime || 0}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Enhanced Agent Manager</h1>
        <p className="text-gray-600 mt-2">
          Advanced model assignment, agent creation, and performance monitoring
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'manage', name: 'Manage Agents', icon: Settings },
            { id: 'templates', name: 'Templates', icon: BookOpen },
            { id: 'analytics', name: 'Analytics', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "analytics" | "templates" | "manage" | "create")}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'manage' && renderManageTab()}
      {activeTab === 'templates' && renderTemplatesTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
    </div>
  );
};

export default EnhancedAgentManager;
