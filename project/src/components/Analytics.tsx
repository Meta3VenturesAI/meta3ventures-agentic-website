import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';

// Lazy load charts component for better bundle splitting
const AnalyticsCharts = lazy(() => import('./charts/AnalyticsCharts'));
import { getAnalyticsSummary, getLeads, AnalyticsSummary, LeadSubmission } from '../lib/analytics';
import { Download, Calendar, RefreshCw, AlertTriangle, Database } from 'lucide-react';
import { format, subDays } from 'date-fns';

const DATE_RANGES = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 }
];

export const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [leads, setLeads] = useState<LeadSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryData, leadsData] = await Promise.all([
        getAnalyticsSummary(dateRange.start, dateRange.end),
        getLeads(dateRange.start, dateRange.end)
      ]);
      
      setSummary(summaryData);
      setLeads(leadsData);
      
      // Check if we're using mock data (when totalPageViews is exactly 1250, it's likely mock data)
      setIsUsingMockData(summaryData.totalPageViews === 1250);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Set fallback data
      setSummary({
        totalPageViews: 0,
        uniqueVisitors: 0,
        averageSessionDuration: 0,
        topPages: [],
        leadsBySource: [],
        conversionRate: 0,
        deviceBreakdown: [],
        countryBreakdown: []
      });
      setLeads([]);
      setIsUsingMockData(true);
    } finally {
      setLoading(false);
    }
  }, [dateRange.start, dateRange.end]);

  useEffect(() => {
    loadData();
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 300000);
    return () => clearInterval(interval);
  }, [dateRange, refreshKey, loadData]);

  const handleDateRangeSelect = (days: number) => {
    setDateRange({
      start: format(subDays(new Date(), days), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd')
    });
  };

  const exportData = () => {
    if (leads.length === 0) {
      alert('No data to export');
      return;
    }

    const csvData = leads.map(lead => ({
      Name: lead.name,
      Email: lead.email,
      Company: lead.company || '',
      Interest: lead.interest,
      Source: lead.source,
      Date: format(new Date(lead.created_at), 'yyyy-MM-dd HH:mm:ss')
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads-${dateRange.start}-to-${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-4">Unable to load analytics data</p>
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Database Status Warning */}
      {isUsingMockData && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <Database className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Demo Mode - Database Tables Not Found
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Analytics tables haven't been created yet. Showing demo data. To enable real analytics, 
                the Supabase migration files need to be applied to create the required tables.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <select
            value={30}
            onChange={(e) => handleDateRangeSelect(Number(e.target.value))}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {DATE_RANGES.map(range => (
              <option key={range.days} value={range.days}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="flex items-center px-4 py-2 text-indigo-600 hover:text-indigo-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Page Views', 
            value: summary.totalPageViews.toLocaleString(),
            subtext: isUsingMockData ? 'Demo data' : 'Real data'
          },
          { 
            label: 'Unique Visitors', 
            value: summary.uniqueVisitors.toLocaleString(),
            subtext: isUsingMockData ? 'Demo data' : 'Real data'
          },
          { 
            label: 'Total Leads', 
            value: leads.length.toLocaleString(),
            subtext: isUsingMockData ? 'Demo data' : 'Real data'
          },
          { 
            label: 'Conversion Rate', 
            value: `${summary.conversionRate.toFixed(2)}%`,
            subtext: isUsingMockData ? 'Demo data' : 'Real data'
          }
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>
          </div>
        ))}
      </div>

      {/* Charts - Lazy Loaded */}
      <Suspense fallback={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      }>
        <AnalyticsCharts
          submissionData={summary.topPages.map(page => ({ name: page.page, value: page.views }))}
          sourceData={summary.leadsBySource.map(source => ({ name: source.source, value: source.count }))}
          conversionData={[
            { name: 'Visitors', value: summary.uniqueVisitors },
            { name: 'Page Views', value: summary.totalPageViews },
            { name: 'Leads', value: summary.leadsBySource.reduce((sum, item) => sum + item.count, 0) }
          ]}
        />
      </Suspense>

      {/* Leads Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">Recent Leads</h3>
          <button
            onClick={exportData}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            disabled={leads.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          {leads.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Interest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{lead.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{lead.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{lead.company || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{lead.interest}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{lead.source}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {format(new Date(lead.created_at), 'PPP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No leads data available</h3>
              <p className="text-sm">
                {isUsingMockData 
                  ? 'Database tables need to be created to track real leads data.'
                  : 'No leads found for the selected date range.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};