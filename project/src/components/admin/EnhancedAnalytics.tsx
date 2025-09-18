import React, { useState, useEffect, useMemo } from 'react';
import { 
  Download, Database, Users, MessageSquare, Mail, FileText, 
  TrendingUp, Calendar, RefreshCw, Filter, Search, Eye, 
  Building, Briefcase, Newspaper, Handshake, ChevronDown,
  X, Clock, DollarSign, Target, CheckCircle, AlertCircle, 
  BarChart3, PieChart, Lock, Brain, Activity, ArrowUpDown,
  ChevronLeft, ChevronRight, MoreHorizontal, ExternalLink
} from 'lucide-react';
import { dataStorage, FormType } from '../../services/data-storage.service';
import toast from 'react-hot-toast';

interface EnhancedAnalyticsProps {
  submissions: any[];
  onRefresh: () => void;
  dataSource?: 'formspree' | 'local' | 'supabase';
}

interface AnalyticsData {
  totalSubmissions: number;
  byType: Record<string, number>;
  byTimeframe: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  byIndustry: Record<string, number>;
  byStage: Record<string, number>;
  conversionRate: number;
  avgResponseTime: number;
  topSources: Array<{ source: string; count: number }>;
  recentActivity: any[];
  applicationFunnel: {
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
  status: string;
}

const EnhancedAnalytics: React.FC<EnhancedAnalyticsProps> = ({ submissions, onRefresh, dataSource = 'local' }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'all',
    industry: 'all',
    fundingRange: 'all',
    companyStage: 'all',
    formType: 'all',
    status: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate analytics data
  const calculateAnalytics = useMemo(() => {
    if (!submissions.length) return null;

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const data: AnalyticsData = {
      totalSubmissions: submissions.length,
      byType: {},
      byTimeframe: {
        last24h: 0,
        last7d: 0,
        last30d: 0
      },
      byIndustry: {},
      byStage: {},
      conversionRate: 0,
      avgResponseTime: 0,
      topSources: [],
      recentActivity: [],
      applicationFunnel: {
        step1_started: 0,
        step2_reached: 0,
        step3_reached: 0,
        step4_completed: 0,
        avg_completion_time: 0
      }
    };

    // Calculate type distribution
    submissions.forEach(sub => {
      data.byType[sub.type] = (data.byType[sub.type] || 0) + 1;
      
      // Time-based stats
      const subDate = new Date(sub.created_at || sub.timestamp);
      if (subDate >= last24h) data.byTimeframe.last24h++;
      if (subDate >= last7d) data.byTimeframe.last7d++;
      if (subDate >= last30d) data.byTimeframe.last30d++;
      
      // Industry and stage stats for applications
      if (sub.type === 'apply') {
        const industry = sub.data?.industry || 'Unknown';
        const stage = sub.data?.companyStage || sub.data?.stage || 'Unknown';
        
        data.byIndustry[industry] = (data.byIndustry[industry] || 0) + 1;
        data.byStage[stage] = (data.byStage[stage] || 0) + 1;
      }
    });

    // Calculate conversion rate
    const applications = data.byType.apply || 0;
    const totalContacts = Object.values(data.byType).reduce((a, b) => a + b, 0);
    data.conversionRate = totalContacts > 0 ? (applications / totalContacts) * 100 : 0;

    // Calculate top sources
    const sources = submissions
      .map(s => s.metadata?.referrer || 'Direct')
      .reduce((acc, source) => {
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    data.topSources = Object.entries(sources)
      .map(([source, count]) => ({ source, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent activity
    data.recentActivity = submissions
      .sort((a, b) => new Date(b.created_at || b.timestamp).getTime() - new Date(a.created_at || a.timestamp).getTime())
      .slice(0, 10);

    // Application funnel
    const applicationSubmissions = submissions.filter(s => s.type === 'apply');
    data.applicationFunnel.step1_started = applicationSubmissions.length;
    data.applicationFunnel.step2_reached = applicationSubmissions.filter(a => a.data?.completedSteps >= 2).length;
    data.applicationFunnel.step3_reached = applicationSubmissions.filter(a => a.data?.completedSteps >= 3).length;
    data.applicationFunnel.step4_completed = applicationSubmissions.filter(a => a.data?.completedSteps >= 4).length;
    
    const totalTime = applicationSubmissions.reduce((sum, app) => sum + (app.data?.timeSpentSeconds || 0), 0);
    data.applicationFunnel.avg_completion_time = applicationSubmissions.length > 0 ? 
      Math.round(totalTime / applicationSubmissions.length) : 0;

    return data;
  }, [submissions]);

  useEffect(() => {
    setAnalyticsData(calculateAnalytics);
  }, [calculateAnalytics]);

  // Filter and sort submissions
  const filteredSubmissions = useMemo(() => {
    let filtered = [...submissions];

    // Apply filters
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const days = filters.dateRange === '7days' ? 7 : 
                   filters.dateRange === '30days' ? 30 : 90;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(s => 
        new Date(s.created_at || s.timestamp) > cutoff
      );
    }

    if (filters.formType !== 'all') {
      filtered = filtered.filter(s => s.type === filters.formType);
    }

    if (filters.industry !== 'all') {
      filtered = filtered.filter(s => s.data?.industry === filters.industry);
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

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(s => {
        const searchStr = JSON.stringify(s.data).toLowerCase();
        return searchStr.includes(searchQuery.toLowerCase());
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [submissions, filters, searchQuery, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleDownloadCSV = () => {
    if (filteredSubmissions.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csvContent = [
      ['Date', 'Type', 'Name', 'Email', 'Company', 'Message', 'Additional Data'],
      ...filteredSubmissions.map(sub => [
        new Date(sub.created_at || sub.timestamp).toLocaleString(),
        sub.type,
        sub.data?.name || sub.data?.firstName || sub.data?.companyName || '',
        sub.data?.email || sub.data?.contactEmail || '',
        sub.data?.company || sub.data?.companyName || '',
        sub.data?.message || sub.data?.pitch || '',
        JSON.stringify(sub.data)
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `meta3_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Data exported successfully');
  };

  const handleViewDetails = (submission: any) => {
    setSelectedSubmission(submission);
    setShowDetails(true);
  };

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Source Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Data Source</h3>
              <p className="text-sm text-blue-700">
                {dataSource === 'formspree' 
                  ? 'Live data from Formspree (Production)' 
                  : dataSource === 'supabase'
                  ? 'Data from Supabase database'
                  : 'Local storage data (Development)'
                }
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-900">{submissions.length}</div>
            <div className="text-sm text-blue-700">submissions</div>
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Database className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalSubmissions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last 24h</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.byTimeframe.last24h}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.byType.apply || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Form Type</label>
            <select
              value={filters.formType}
              onChange={(e) => setFilters({...filters, formType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="apply">Applications</option>
              <option value="contact">Contact</option>
              <option value="newsletter">Newsletter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({...filters, industry: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Industries</option>
              {Object.keys(analyticsData.byIndustry).map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Funding Range</label>
            <select
              value={filters.fundingRange}
              onChange={(e) => setFilters({...filters, fundingRange: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Ranges</option>
              <option value="0-50k">$0 - $50k</option>
              <option value="50k-250k">$50k - $250k</option>
              <option value="250k-1m">$250k - $1M</option>
              <option value="1m+">$1M+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Stage</label>
            <select
              value={filters.companyStage}
              onChange={(e) => setFilters({...filters, companyStage: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Stages</option>
              {Object.keys(analyticsData.byStage).map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search submissions..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Showing {paginatedSubmissions.length} of {filteredSubmissions.length} submissions
          </p>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center">
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">
                    Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSubmissions.map((submission, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(submission.created_at || submission.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      submission.type === 'apply' ? 'bg-green-100 text-green-800' :
                      submission.type === 'contact' ? 'bg-blue-100 text-blue-800' :
                      submission.type === 'newsletter' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {submission.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {submission.data?.name || submission.data?.firstName || submission.data?.companyName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {submission.data?.email || submission.data?.contactEmail || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {submission.data?.company || submission.data?.companyName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(submission)}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submission Details Modal */}
      {showDetails && selectedSubmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Submission Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSubmission.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedSubmission.created_at || selectedSubmission.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data</label>
                  <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md overflow-auto max-h-96">
                    {JSON.stringify(selectedSubmission.data, null, 2)}
                  </pre>
                </div>
                
                {selectedSubmission.metadata && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Metadata</label>
                    <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md overflow-auto">
                      {JSON.stringify(selectedSubmission.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAnalytics;
