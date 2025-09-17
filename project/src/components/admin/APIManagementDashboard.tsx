/**
 * API Management Dashboard - Commercial-ready API key and usage management
 */

import React, { useState, useEffect } from 'react';
import { 
  Key, Plus, Trash2, Edit, Eye, EyeOff, Copy, 
  TrendingUp, Clock, AlertTriangle, CheckCircle,
  DollarSign, Users, Activity, Settings
} from 'lucide-react';
import { apiKeyManagementService, APIKey, UsageMetrics } from '../../services/api-key-management.service';
import toast from 'react-hot-toast';

interface CreateKeyForm {
  name: string;
  permissions: string[];
  rateLimit: number;
  expiresIn?: number;
}

const APIManagementDashboard: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
  const [billingInfo, setBillingInfo] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateKeyForm>({
    name: '',
    permissions: [],
    rateLimit: 1000,
    expiresIn: undefined
  });
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const keys = await apiKeyManagementService.getAPIKeys('default-org');
      setApiKeys(keys);
      
      const billing = await apiKeyManagementService.getBillingInfo('default-org');
      setBillingInfo(billing);
    } catch (error) {
      console.error('Failed to load API data:', error);
      toast.error('Failed to load API data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsageMetrics = async (keyId: string) => {
    try {
      const metrics = await apiKeyManagementService.getUsageMetrics(keyId);
      setUsageMetrics(metrics);
    } catch (error) {
      console.error('Failed to load usage metrics:', error);
      toast.error('Failed to load usage metrics');
    }
  };

  const createAPIKey = async () => {
    if (!createForm.name.trim()) {
      toast.error('Please provide a name for the API key');
      return;
    }

    if (createForm.permissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    try {
      await apiKeyManagementService.generateAPIKey(
        createForm.name,
        createForm.permissions,
        'default-org',
        {
          rateLimit: createForm.rateLimit,
          expiresIn: createForm.expiresIn
        }
      );

      toast.success('API key created successfully');
      setShowCreateForm(false);
      setCreateForm({ name: '', permissions: [], rateLimit: 1000, expiresIn: undefined });
      loadData();
    } catch (error) {
      console.error('Failed to create API key:', error);
      toast.error('Failed to create API key');
    }
  };

  const deactivateKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to deactivate this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await apiKeyManagementService.deactivateAPIKey(keyId);
      toast.success('API key deactivated');
      loadData();
    } catch (error) {
      console.error('Failed to deactivate API key:', error);
      toast.error('Failed to deactivate API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const availablePermissions = apiKeyManagementService.getAvailablePermissions();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading API management...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">API Management</h1>
            <p className="text-gray-600 mt-2">Manage API keys, monitor usage, and track billing</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create API Key</span>
          </button>
        </div>
      </div>

      {/* Billing Overview */}
      {billingInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(billingInfo.totalRequests)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cost This Month</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(billingInfo.costThisMonth)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Projected Monthly</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(billingInfo.projectedMonthlyCost)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Tier</p>
                <p className="text-2xl font-bold text-gray-900">{billingInfo.tier}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">API Keys</h2>
        </div>
        <div className="p-6">
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No API keys created yet</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Your First API Key
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{key.name}</h3>
                      <p className="text-sm text-gray-500">Created {new Date(key.created).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {key.isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                      <span className={`px-2 py-1 text-xs rounded ${
                        key.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {key.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">API Key</p>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {visibleKeys.has(key.id) ? key.key : key.key}
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {visibleKeys.has(key.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(key.key)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Usage Count</p>
                      <p className="font-medium">{formatNumber(key.usageCount)}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Rate Limit</p>
                      <p className="font-medium">{formatNumber(key.rateLimit)}/hour</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Last Used</p>
                      <p className="font-medium">
                        {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Permissions</p>
                    <div className="flex flex-wrap gap-2">
                      {key.permissions.map((permission) => (
                        <span
                          key={permission}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedKey(key);
                        loadUsageMetrics(key.id);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Usage Details
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => deactivateKey(key.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        disabled={!key.isActive}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Usage Metrics Modal */}
      {selectedKey && usageMetrics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Usage Metrics - {selectedKey.name}
                </h2>
                <button
                  onClick={() => setSelectedKey(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(usageMetrics.totalRequests)}</p>
                  <p className="text-sm text-gray-500">Total Requests</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(usageMetrics.requestsToday)}</p>
                  <p className="text-sm text-gray-500">Today</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{usageMetrics.averageResponseTime.toFixed(0)}ms</p>
                  <p className="text-sm text-gray-500">Avg Response Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{(usageMetrics.errorRate * 100).toFixed(1)}%</p>
                  <p className="text-sm text-gray-500">Error Rate</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Endpoints</h3>
                <div className="space-y-2">
                  {usageMetrics.topEndpoints.map((endpoint, index) => (
                    <div key={endpoint.endpoint} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <code className="text-sm">{endpoint.endpoint}</code>
                      </div>
                      <span className="font-medium">{formatNumber(endpoint.count)} requests</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create API Key Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Create New API Key</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g., Production API Key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePermissions.map((permission) => (
                      <label key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={createForm.permissions.includes(permission)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCreateForm({
                                ...createForm,
                                permissions: [...createForm.permissions, permission]
                              });
                            } else {
                              setCreateForm({
                                ...createForm,
                                permissions: createForm.permissions.filter(p => p !== permission)
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate Limit (requests/hour)
                    </label>
                    <input
                      type="number"
                      value={createForm.rateLimit}
                      onChange={(e) => setCreateForm({ ...createForm, rateLimit: parseInt(e.target.value) || 1000 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expires In (days, optional)
                    </label>
                    <input
                      type="number"
                      value={createForm.expiresIn || ''}
                      onChange={(e) => setCreateForm({ ...createForm, expiresIn: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="Never expires"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createAPIKey}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create API Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APIManagementDashboard;
