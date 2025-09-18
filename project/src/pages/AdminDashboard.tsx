import React, { useState, useEffect, useMemo } from 'react';
import { 
  Download, Database, Users, MessageSquare,
  Mail, FileText, TrendingUp, Calendar,
  RefreshCw, Filter, Search, Eye, Building,
  Briefcase, Newspaper, Handshake, ChevronDown,
  X, Clock, DollarSign, Target, CheckCircle,
  AlertCircle, BarChart3, PieChart, Lock, Brain, Activity
} from 'lucide-react';
import { dataStorage, FormType } from '../services/data-storage.service';
import { useAuth } from '../contexts/AuthContext';
import { SEO } from '../components/SEO';
import AgentSystemDashboard from '../components/admin/AgentSystemDashboard';
import UserAcceptanceTest from '../components/testing/UserAcceptanceTest';
import AccessibilityTest from '../components/testing/AccessibilityTest';
import MobileOptimizer from '../components/mobile/MobileOptimizer';
import VirtualAssistant from '../components/VirtualAssistant';
import { AIAdvisors } from '../components/AIAdvisors';
import StrategicFundraisingAdvisor from '../components/StrategicFundraisingAdvisor';
import CompetitiveIntelligenceSystem from '../components/CompetitiveIntelligenceSystem';
import PerformanceDashboard from '../components/admin/PerformanceDashboard';
import EnhancedAnalytics from '../components/admin/EnhancedAnalytics';
import toast from 'react-hot-toast';

interface DataSummary {
  total_submissions: number;
  by_type: {
    contact: number;
    apply: number;
    newsletter: number;
    chat: number;
    contact_entrepreneur: number;
    contact_investor: number;
    contact_media: number;
    contact_partnership: number;
    contact_general: number;
  };
  recent_submissions: unknown[];
  total_events: number;
  unique_sessions: number;
  application_funnel?: {
    step1_started: number;
    step2_reached: number;
    step3_reached: number;
    step4_completed: number;
    avg_completion_time: number;
  };
}

interface FilterState {
  dateRange: 'all' | '7days' | '30days' | '90days';
  industry: string;
  fundingRange: string;
  companyStage: string;
  formType: string;
}

type TabType = 'overview' | 'applications' | 'entrepreneurs' | 'investors' |
               'media' | 'partnerships' | 'general' | 'newsletter' | 'agents' | 'performance';

const AdminLoginForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(password);
      if (!success) {
        setError('Invalid password. Please contact administrator.');
        setPassword('');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm text-center">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export const AdminDashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [summary, setSummary] = useState<DataSummary | null>(null);
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: '30days',
    industry: 'all',
    fundingRange: 'all',
    companyStage: 'all',
    formType: 'all'
  });

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: TrendingUp, color: 'indigo' },
    { id: 'applications' as TabType, label: 'Applications', icon: FileText, color: 'green' },
    { id: 'entrepreneurs' as TabType, label: 'Entrepreneurs', icon: Building, color: 'blue' },
    { id: 'investors' as TabType, label: 'Investors', icon: Briefcase, color: 'purple' },
    { id: 'media' as TabType, label: 'Media', icon: Newspaper, color: 'pink' },
    { id: 'partnerships' as TabType, label: 'Partnerships', icon: Handshake, color: 'yellow' },
    { id: 'general' as TabType, label: 'General', icon: MessageSquare, color: 'gray' },
    { id: 'newsletter' as TabType, label: 'Newsletter', icon: Mail, color: 'orange' },
    { id: 'agents' as TabType, label: 'AI Agents', icon: Brain, color: 'cyan' },
    { id: 'performance' as TabType, label: 'Performance', icon: Activity, color: 'emerald' }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading admin data...');
      
      // Load summary data (now includes Formspree integration)
      const summaryData = await dataStorage.getAnalyticsSummary();
      console.log('Summary data loaded:', summaryData);
      
      // Load all form submissions (now includes Formspree integration)
      const allSubmissions = await dataStorage.getAllSubmissions();
      console.log(`Loaded ${allSubmissions.length} submissions from data storage service`);
      
      // Ensure all submissions have proper structure and valid data
      const validSubmissions = allSubmissions.filter((s: any) => 
        s && 
        typeof s === 'object' && 
        s.type && 
        s.data && 
        typeof s.data === 'object' && 
        Object.keys(s.data).length > 0
      );
      
      // Calculate funnel metrics for applications
      const applications = validSubmissions.filter((s: any) => s.type === 'apply');
      const funnel = calculateFunnelMetrics(applications);
      
      setSummary({
        ...summaryData,
        application_funnel: funnel
      });
      setAllSubmissions(validSubmissions);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
      setAllSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateFunnelMetrics = (applications: unknown[]) => {
    const metrics = {
      step1_started: applications.length,
      step2_reached: 0,
      step3_reached: 0,
      step4_completed: 0,
      avg_completion_time: 0
    };

    let totalTime = 0;
    applications.forEach((app: any) => {
      if (app.data?.completedSteps >= 2) metrics.step2_reached++;
      if (app.data?.completedSteps >= 3) metrics.step3_reached++;
      if (app.data?.completedSteps >= 4) metrics.step4_completed++;
      if (app.data?.timeSpentSeconds) totalTime += app.data.timeSpentSeconds;
    });

    metrics.avg_completion_time = applications.length > 0 ? 
      Math.round(totalTime / applications.length) : 0;

    return metrics;
  };

  const getFilteredSubmissions = useMemo(() => {
    let filtered = [...allSubmissions];

    // Filter by tab type
    switch (activeTab) {
      case 'applications':
        filtered = filtered.filter(s => s.type === 'apply');
        break;
      case 'entrepreneurs':
        filtered = filtered.filter(s => s.type === 'contact_entrepreneur');
        break;
      case 'investors':
        filtered = filtered.filter(s => s.type === 'contact_investor');
        break;
      case 'media':
        filtered = filtered.filter(s => s.type === 'contact_media');
        break;
      case 'partnerships':
        filtered = filtered.filter(s => s.type === 'contact_partnership');
        break;
      case 'general':
        filtered = filtered.filter(s => s.type === 'contact_general' || s.type === 'contact');
        break;
      case 'newsletter':
        filtered = filtered.filter(s => s.type === 'newsletter');
        break;
    }

    // Apply date filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const days = filters.dateRange === '7days' ? 7 : 
                   filters.dateRange === '30days' ? 30 : 90;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(s => 
        new Date(s.timestamp || s.created_at) > cutoff
      );
    }

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(s => {
        const searchStr = JSON.stringify(s.data).toLowerCase();
        return searchStr.includes(searchQuery.toLowerCase());
      });
    }

    // Apply other filters
    if (filters.industry !== 'all') {
      filtered = filtered.filter(s => 
        s.data?.industry === filters.industry
      );
    }

    if (filters.fundingRange !== 'all') {
      filtered = filtered.filter(s => 
        s.data?.fundingSought === filters.fundingRange ||
        s.data?.funding === filters.fundingRange
      );
    }

    if (filters.companyStage !== 'all') {
      filtered = filtered.filter(s => 
        s.data?.companyStage === filters.companyStage ||
        s.data?.stage === filters.companyStage
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.timestamp || b.created_at).getTime() - 
      new Date(a.timestamp || a.created_at).getTime()
    );
  }, [allSubmissions, activeTab, filters, searchQuery]);

  const handleDownloadCSV = (type?: string) => {
    const dataToExport = type ? 
      allSubmissions.filter(s => s.type === type) : 
      getFilteredSubmissions;
    
    if (dataToExport.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Convert to CSV
    const headers = ['Date', 'Type', 'Name', 'Email', 'Company', 'Industry', 'Stage', 'Funding', 'Data'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(s => [
        new Date(s.timestamp || s.created_at).toISOString(),
        s.type,
        s.data?.name || s.data?.contactName || '',
        s.data?.email || s.data?.contactEmail || '',
        s.data?.company || s.data?.companyName || '',
        s.data?.industry || '',
        s.data?.stage || s.data?.companyStage || '',
        s.data?.funding || s.data?.fundingSought || '',
        JSON.stringify(s.data).replace(/,/g, ';')
      ].map(v => `"${v}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meta3ventures_${type || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('Data exported successfully!');
  };

  const renderApplicationDetail = (submission: unknown) => {
    if (!submission) {
      return null;
    }
    
    // Handle cases where data might be empty or malformed
    const data = (submission as any).data || {};
    const hasValidData = data && typeof data === 'object' && Object.keys(data).length > 0;
    
    // Additional safety check to prevent React error #31
    if (data && typeof data === 'object' && Object.keys(data).length === 0) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">No Data Available</h2>
              <p className="text-gray-600 mb-4">This submission has no data to display.</p>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (!hasValidData) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">No Data Available</h2>
              <p className="text-gray-600 mb-4">This submission has no data to display.</p>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Application Details</h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Company Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2 text-indigo-600" />
                Company Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Company Name</label>
                  <p className="font-medium">{data.companyName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Website</label>
                  <p className="font-medium">
                    {data.website ? (
                      <a href={data.website} target="_blank" rel="noopener noreferrer" 
                         className="text-indigo-600 hover:underline">
                        {data.website}
                      </a>
                    ) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Industry</label>
                  <p className="font-medium">{data.industry || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Stage</label>
                  <p className="font-medium">{data.companyStage || data.stage || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Location</label>
                  <p className="font-medium">{data.location || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Founded</label>
                  <p className="font-medium">{data.foundedYear || 'N/A'}</p>
                </div>
              </div>
              {data.companyDescription && (
                <div className="mt-4">
                  <label className="text-sm text-gray-500">Description</label>
                  <p className="mt-1">{data.companyDescription}</p>
                </div>
              )}
            </div>

            {/* Technology & Product */}
            {(data.technologyFocus || data.productDescription) && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Technology & Product
                </h3>
                <div className="space-y-3">
                  {data.technologyFocus && (
                    <div>
                      <label className="text-sm text-gray-500">Technology Focus</label>
                      <p className="font-medium">{data.technologyFocus}</p>
                    </div>
                  )}
                  {data.productDescription && (
                    <div>
                      <label className="text-sm text-gray-500">Product Description</label>
                      <p className="mt-1">{data.productDescription}</p>
                    </div>
                  )}
                  {data.competitiveAdvantage && (
                    <div>
                      <label className="text-sm text-gray-500">Competitive Advantage</label>
                      <p className="mt-1">{data.competitiveAdvantage}</p>
                    </div>
                  )}
                  {data.developmentStatus && (
                    <div>
                      <label className="text-sm text-gray-500">Development Status</label>
                      <p className="font-medium">{data.developmentStatus}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Market & Funding */}
            {(data.fundingSought || data.targetMarket) && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Market & Funding
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Funding Sought</label>
                    <p className="font-medium">{data.fundingSought || data.funding || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Previous Funding</label>
                    <p className="font-medium">{data.previousFunding || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Revenue Status</label>
                    <p className="font-medium">{data.revenueStatus || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Current Users</label>
                    <p className="font-medium">{data.currentUsers || 'N/A'}</p>
                  </div>
                </div>
                {data.targetMarket && (
                  <div className="mt-4">
                    <label className="text-sm text-gray-500">Target Market</label>
                    <p className="mt-1">{data.targetMarket}</p>
                  </div>
                )}
                {data.useOfFunds && (
                  <div className="mt-4">
                    <label className="text-sm text-gray-500">Use of Funds</label>
                    <p className="mt-1">{data.useOfFunds}</p>
                  </div>
                )}
              </div>
            )}

            {/* Team & Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Team & Contact
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Contact Name</label>
                  <p className="font-medium">{data.contactName || data.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Role</label>
                  <p className="font-medium">{data.contactRole || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">
                    <a href={`mailto:${data.contactEmail || data.email}`} 
                       className="text-indigo-600 hover:underline">
                      {data.contactEmail || data.email || 'N/A'}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="font-medium">{data.contactPhone || 'N/A'}</p>
                </div>
              </div>
              {data.teamDescription && (
                <div className="mt-4">
                  <label className="text-sm text-gray-500">Team Description</label>
                  <p className="mt-1">{data.teamDescription}</p>
                </div>
              )}
            </div>

            {/* Uploaded Files */}
            {(() => {
              const files = [];
              
              // Handle different file storage formats
              if (data.uploadedFiles && Array.isArray(data.uploadedFiles)) {
                files.push(...data.uploadedFiles.filter((file: any) => file && typeof file === 'object' && file.name));
              }
              
              // Handle attachedFiles (from form submission)
              if (data.attachedFiles) {
                try {
                  const attachedFiles = typeof data.attachedFiles === 'string' 
                    ? JSON.parse(data.attachedFiles) 
                    : data.attachedFiles;
                  
                  if (attachedFiles && typeof attachedFiles === 'object' && attachedFiles.pitchDeck && Array.isArray(attachedFiles.pitchDeck)) {
                    files.push(...attachedFiles.pitchDeck
                      .filter((name: unknown) => name && typeof name === 'string')
                      .map((name: string) => ({
                        name,
                        type: 'Pitch Deck',
                        category: 'pitchDeck'
                      })));
                  }
                  
                  if (attachedFiles && typeof attachedFiles === 'object' && attachedFiles.businessPlan && Array.isArray(attachedFiles.businessPlan)) {
                    files.push(...attachedFiles.businessPlan
                      .filter((name: unknown) => name && typeof name === 'string')
                      .map((name: string) => ({
                        name,
                        type: 'Business Plan',
                        category: 'businessPlan'
                      })));
                  }
                } catch (e) {
                  console.log('Could not parse attachedFiles:', data.attachedFiles);
                }
              }
              
              // Handle direct file references
              if (data.pitchDeck && Array.isArray(data.pitchDeck)) {
                files.push(...data.pitchDeck
                  .filter((file: any) => file && (typeof file === 'string' || (typeof file === 'object' && file.name)))
                  .map((file: any) => ({
                    name: file.name || file,
                    type: 'Pitch Deck',
                    category: 'pitchDeck',
                    size: file.size || 0,
                    fileObject: file instanceof File ? file : null,
                    mimeType: file.type || 'application/pdf',
                    url: file.url || null
                  })));
              }
              
              if (data.businessPlan && Array.isArray(data.businessPlan)) {
                files.push(...data.businessPlan
                  .filter((file: any) => file && (typeof file === 'string' || (typeof file === 'object' && file.name)))
                  .map((file: any) => ({
                    name: file.name || file,
                    type: 'Business Plan',
                    category: 'businessPlan',
                    size: file.size || 0,
                    fileObject: file instanceof File ? file : null,
                    mimeType: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    url: file.url || null
                  })));
              }
              
              return files.length > 0 ? (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Uploaded Files ({files.length})
                  </h3>
                  <div className="space-y-3">
                    {files.map((file: any, idx: number) => {
                      // Ensure file is valid and has required properties
                      if (!file || typeof file !== 'object' || !file.name) {
                        return null;
                      }
                      
                      return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                              <p className="text-sm text-gray-500">
                                {file.type} {file.size ? `• ${Math.round(file.size / 1024)} KB` : ''}
                                {file.category && ` • ${file.category}`}
                              </p>
                              {file.mimeType && (
                                <p className="text-xs text-gray-400">
                                  {file.mimeType}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {file.url ? (
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                              >
                                View
                              </a>
                            ) : (
                              <button
                                onClick={() => {
                                  // Handle file download based on file type
                                  if (file.fileObject && file.fileObject instanceof File) {
                                    // If we have the actual File object, create download link
                                    const url = URL.createObjectURL(file.fileObject);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = file.name;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                  } else if (file.content) {
                                    // If we have file content, create blob and download
                                    const blob = new Blob([file.content], { type: file.mimeType || 'application/octet-stream' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = file.name;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                  } else {
                                    // Fallback: create a placeholder file
                                    const content = `This is a placeholder for ${file.name}.\n\nFile was uploaded but content is not available for download.\nFile type: ${file.type}\nSize: ${file.size ? Math.round(file.size / 1024) + ' KB' : 'Unknown'}`;
                                    const blob = new Blob([content], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = file.name.replace(/\.[^/.]+$/, '') + '_info.txt';
                                    a.click();
                                    URL.revokeObjectURL(url);
                                  }
                                }}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                              >
                                Download
                              </button>
                            )}
                            <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded">
                              {file.url ? 'Available' : 'Uploaded'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Metadata */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-600" />
                Submission Details
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="text-gray-500">Submitted</label>
                  <p className="font-medium">
                    {new Date((submission as any).timestamp || (submission as any).created_at).toLocaleString()}
                  </p>
                </div>
                {data.timeSpentSeconds && (
                  <div>
                    <label className="text-gray-500">Time Spent</label>
                    <p className="font-medium">
                      {Math.floor(data.timeSpentSeconds / 60)} min {data.timeSpentSeconds % 60} sec
                    </p>
                  </div>
                )}
                {data.completedSteps && (
                  <div>
                    <label className="text-gray-500">Steps Completed</label>
                    <p className="font-medium">{data.completedSteps} of 4</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => {
                  const emailData = {
                    to: data.contactEmail || data.email,
                    subject: `Re: ${data.companyName || 'Your'} Application`,
                    body: `Dear ${data.contactName || data.name},\n\nThank you for your application...`
                  };
                  window.location.href = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Send Email
              </button>
              <button
                onClick={() => handleDownloadCSV((submission as any).type)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFunnelChart = () => {
    const funnel = summary?.application_funnel;
    if (!funnel || funnel.step1_started === 0) return null;

    const stages = [
      { name: 'Step 1: Company Info', value: funnel.step1_started, percent: 100 },
      { name: 'Step 2: Technology', value: funnel.step2_reached, 
        percent: Math.round((funnel.step2_reached / funnel.step1_started) * 100) },
      { name: 'Step 3: Market', value: funnel.step3_reached,
        percent: Math.round((funnel.step3_reached / funnel.step1_started) * 100) },
      { name: 'Step 4: Completed', value: funnel.step4_completed,
        percent: Math.round((funnel.step4_completed / funnel.step1_started) * 100) }
    ];

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
          Application Funnel
        </h3>
        <div className="space-y-3">
          {stages.map((stage, idx) => (
            <div key={idx}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{stage.name}</span>
                <span className="text-sm text-gray-500">
                  {stage.value} ({stage.percent}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${stage.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        {funnel.avg_completion_time > 0 && (
          <p className="text-sm text-gray-500 mt-4">
            Average completion time: {Math.floor(funnel.avg_completion_time / 60)} minutes
          </p>
        )}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard Access
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Please enter your password to continue
            </p>
          </div>

          <AdminLoginForm />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Admin Dashboard - Meta3Ventures"
        description="Admin dashboard for managing form submissions and analytics"
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {allSubmissions.length} total submissions
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronDown className="w-4 h-4 rotate-180" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => handleDownloadCSV()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export All
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6">
              <div className="grid md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date Range</label>
                  <select 
                    value={filters.dateRange}
                    onChange={(e) => setFilters({...filters, dateRange: e.target.value as "all" | "7days" | "30days" | "90days"})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="all">All Time</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Industry</label>
                  <select 
                    value={filters.industry}
                    onChange={(e) => setFilters({...filters, industry: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="all">All Industries</option>
                    <option value="ai-ml">AI & Machine Learning</option>
                    <option value="blockchain">Blockchain & Web3</option>
                    <option value="fintech">FinTech</option>
                    <option value="healthtech">HealthTech</option>
                    <option value="saas">Enterprise SaaS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Funding Range</label>
                  <select 
                    value={filters.fundingRange}
                    onChange={(e) => setFilters({...filters, fundingRange: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="all">All Ranges</option>
                    <option value="100k-250k">$100K - $250K</option>
                    <option value="250k-500k">$250K - $500K</option>
                    <option value="500k-1m">$500K - $1M</option>
                    <option value="1m-5m">$1M - $5M</option>
                    <option value="5m+">$5M+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Company Stage</label>
                  <select 
                    value={filters.companyStage}
                    onChange={(e) => setFilters({...filters, companyStage: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="all">All Stages</option>
                    <option value="idea">Idea Stage</option>
                    <option value="mvp">MVP/Prototype</option>
                    <option value="revenue">Early Revenue</option>
                    <option value="growth">Growth Stage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Clear Filters</label>
                  <button
                    onClick={() => setFilters({
                      dateRange: '30days',
                      industry: 'all',
                      fundingRange: 'all',
                      companyStage: 'all',
                      formType: 'all'
                    })}
                    className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
              <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold">{summary?.total_submissions || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
              <p className="text-xs text-gray-600 dark:text-gray-400">Applications</p>
              <p className="text-2xl font-bold text-green-600">{summary?.by_type.apply || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
              <p className="text-xs text-gray-600 dark:text-gray-400">Entrepreneurs</p>
              <p className="text-2xl font-bold text-blue-600">{summary?.by_type.contact_entrepreneur || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
              <p className="text-xs text-gray-600 dark:text-gray-400">Investors</p>
              <p className="text-2xl font-bold text-purple-600">{summary?.by_type.contact_investor || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
              <p className="text-xs text-gray-600 dark:text-gray-400">Media</p>
              <p className="text-2xl font-bold text-pink-600">{summary?.by_type.contact_media || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
              <p className="text-xs text-gray-600 dark:text-gray-400">Partners</p>
              <p className="text-2xl font-bold text-yellow-600">{summary?.by_type.contact_partnership || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
              <p className="text-xs text-gray-600 dark:text-gray-400">Newsletter</p>
              <p className="text-2xl font-bold text-orange-600">{summary?.by_type.newsletter || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
              <p className="text-xs text-gray-600 dark:text-gray-400">General</p>
              <p className="text-2xl font-bold text-gray-600">{summary?.by_type.contact_general || 0}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="flex flex-wrap">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-4 py-3 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                            activeTab === tab.id
                              ? 'border-indigo-600 text-indigo-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="p-6">
                  {/* Search Bar */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by company, name, email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {activeTab === 'agents' ? (
                      <AgentSystemDashboard />
                    ) : activeTab === 'performance' ? (
                      <PerformanceDashboard className="mt-0" />
                    ) : activeTab === 'overview' ? (
                      <EnhancedAnalytics 
                        submissions={allSubmissions} 
                        onRefresh={loadData}
                        dataSource={allSubmissions.length > 0 ? 'formspree' : 'local'}
                      />
                    ) : getFilteredSubmissions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No submissions found
                      </div>
                    ) : (
                      getFilteredSubmissions.map((submission, idx) => (
                        <div 
                          key={idx} 
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                                  {submission.type}
                                </span>
                                {submission.data?.companyName && (
                                  <span className="font-medium">{submission.data.companyName}</span>
                                )}
                                {submission.data?.industry && (
                                  <span className="text-xs text-gray-500">{submission.data.industry}</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>
                                  <span className="font-medium">
                                    {submission.data?.contactName || submission.data?.name || 'Unknown'}
                                  </span>
                                  {submission.data?.contactEmail || submission.data?.email ? (
                                    <span> - {submission.data?.contactEmail || submission.data?.email}</span>
                                  ) : null}
                                </p>
                                {submission.data?.fundingSought && (
                                  <p>Seeking: {submission.data.fundingSought}</p>
                                )}
                                {submission.data?.message && (
                                  <p className="truncate">{submission.data.message}</p>
                                )}
                                {(() => {
                                  let fileCount = 0;
                                  
                                  // Count files from different sources
                                  if (submission.data?.uploadedFiles) fileCount += submission.data.uploadedFiles.length;
                                  if (submission.data?.attachedFiles) {
                                    try {
                                      const attachedFiles = typeof submission.data.attachedFiles === 'string' 
                                        ? JSON.parse(submission.data.attachedFiles) 
                                        : submission.data.attachedFiles;
                                      if (attachedFiles.pitchDeck) fileCount += attachedFiles.pitchDeck.length;
                                      if (attachedFiles.businessPlan) fileCount += attachedFiles.businessPlan.length;
                                    } catch (e) {}
                                  }
                                  if (submission.data?.pitchDeck && Array.isArray(submission.data.pitchDeck)) {
                                    fileCount += submission.data.pitchDeck.length;
                                  }
                                  if (submission.data?.businessPlan && Array.isArray(submission.data.businessPlan)) {
                                    fileCount += submission.data.businessPlan.length;
                                  }
                                  
                                  return fileCount > 0 ? (
                                    <p className="text-indigo-600 text-xs">
                                      📎 {fileCount} file(s) uploaded
                                    </p>
                                  ) : null;
                                })()}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-xs text-gray-500">
                                {new Date(submission.timestamp || submission.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(submission.timestamp || submission.created_at).toLocaleTimeString()}
                              </p>
                              <button className="mt-2 text-indigo-600 hover:text-indigo-700">
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Export Button for Tab */}
                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={() => {
                        const typeMap: Record<TabType, string> = {
                          overview: 'all',
                          applications: 'apply',
                          entrepreneurs: 'contact_entrepreneur',
                          investors: 'contact_investor',
                          media: 'contact_media',
                          partnerships: 'contact_partnership',
                          general: 'contact_general',
                          newsletter: 'newsletter',
                          agents: 'agents',
                          performance: 'all'
                        };
                        handleDownloadCSV(typeMap[activeTab]);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export {tabs.find(t => t.id === activeTab)?.label}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Funnel Chart */}
              {activeTab === 'applications' && renderFunnelChart()}

              {/* Quick Stats */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Today</span>
                    <span className="font-medium">
                      {allSubmissions.filter(s => {
                        const today = new Date().toDateString();
                        const subDate = new Date(s.timestamp || s.created_at).toDateString();
                        return today === subDate;
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">This Week</span>
                    <span className="font-medium">
                      {allSubmissions.filter(s => {
                        const now = new Date();
                        const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return new Date(s.timestamp || s.created_at) > week;
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="font-medium">
                      {summary?.application_funnel ? 
                        `${Math.round((summary.application_funnel.step4_completed / 
                          summary.application_funnel.step1_started) * 100)}%` : 
                        'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {allSubmissions.slice(0, 5).map((submission, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        submission.type === 'apply' ? 'bg-green-500' :
                        submission.type.includes('entrepreneur') ? 'bg-blue-500' :
                        submission.type.includes('investor') ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {submission.data?.companyName || submission.data?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {submission.type} • {new Date(submission.timestamp || submission.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Detail Modal */}
        {selectedSubmission && renderApplicationDetail(selectedSubmission)}
        
        {/* Admin Testing & Optimization Tools */}
        <UserAcceptanceTest />
        <AccessibilityTest />
        <MobileOptimizer />
        
        {/* Virtual Agents - Admin Access Only */}
        <VirtualAssistant />
        <AIAdvisors />
        <StrategicFundraisingAdvisor />
        <CompetitiveIntelligenceSystem />
      </div>
    </>
  );
};

export default AdminDashboard;