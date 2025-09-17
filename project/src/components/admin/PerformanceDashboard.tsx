/**
 * Performance Monitoring Dashboard
 * Real-time performance metrics and alerts for admin panel
 */

import React, { useState } from 'react';
import {
  Activity, Clock, Zap, AlertTriangle, Download, RefreshCw,
  TrendingUp, TrendingDown, Monitor, Wifi, HardDrive
} from 'lucide-react';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

interface PerformanceDashboardProps {
  className?: string;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ className = '' }) => {
  const {
    summary,
    alerts,
    isMonitoring,
    exportMetrics,
    refreshSummary
  } = usePerformanceMonitor(10000); // Refresh every 10 seconds

  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  const handleExportMetrics = () => {
    const data = exportMetrics(exportFormat);
    const blob = new Blob([data], {
      type: exportFormat === 'json' ? 'application/json' : 'text/csv'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const getMetricColor = (value: number, thresholds: { warning: number; error: number }) => {
    if (value >= thresholds.error) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getAlertColor = (type: 'warning' | 'error') => {
    return type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800';
  };

  if (!isMonitoring) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <Monitor className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Performance monitoring not available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Performance Monitor</h2>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
            <button
              onClick={handleExportMetrics}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={refreshSummary}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-medium text-gray-900">Performance Alerts</h3>
          </div>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded border ${getAlertColor(alert.type)}`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{alert.message}</span>
                  <span className="text-sm">
                    {alert.metric === 'page_load_time' || alert.metric === 'api_response_time'
                      ? formatTime(alert.value)
                      : `${Math.round(alert.value)}${alert.metric === 'memory_usage' ? '%' : ''}`
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="p-6">
        {summary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Page Load Time */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Clock className="h-8 w-8 text-blue-600" />
                <div className="text-right">
                  <p className="text-sm text-blue-700 font-medium">Page Load</p>
                  <p className={`text-lg font-bold ${getMetricColor(summary.pageLoadTime, { warning: 3000, error: 5000 })}`}>
                    {formatTime(summary.pageLoadTime)}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      summary.pageLoadTime > 5000 ? 'bg-red-500' :
                      summary.pageLoadTime > 3000 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, (summary.pageLoadTime / 5000) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* API Response Time */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Zap className="h-8 w-8 text-green-600" />
                <div className="text-right">
                  <p className="text-sm text-green-700 font-medium">API Response</p>
                  <p className={`text-lg font-bold ${getMetricColor(summary.apiResponseTime, { warning: 1000, error: 3000 })}`}>
                    {formatTime(summary.apiResponseTime)}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      summary.apiResponseTime > 3000 ? 'bg-red-500' :
                      summary.apiResponseTime > 1000 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, (summary.apiResponseTime / 3000) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* User Interactions */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="text-right">
                  <p className="text-sm text-purple-700 font-medium">Interactions</p>
                  <p className="text-lg font-bold text-purple-900">
                    {summary.userInteractions.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-xs text-purple-700">
                User activity level
              </div>
            </div>

            {/* Error Rate */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div className="text-right">
                  <p className="text-sm text-red-700 font-medium">Error Rate</p>
                  <p className={`text-lg font-bold ${getMetricColor(summary.errorRate, { warning: 5, error: 10 })}`}>
                    {summary.errorRate.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-red-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, summary.errorRate)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <HardDrive className="h-8 w-8 text-orange-600" />
                <div className="text-right">
                  <p className="text-sm text-orange-700 font-medium">Memory</p>
                  <p className={`text-lg font-bold ${getMetricColor(summary.memoryUsage, { warning: 70, error: 90 })}`}>
                    {summary.memoryUsage.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      summary.memoryUsage > 90 ? 'bg-red-500' :
                      summary.memoryUsage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${summary.memoryUsage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
              <p className="text-gray-500">Loading performance data...</p>
            </div>
          </div>
        )}
      </div>

      {/* Performance Tips */}
      <div className="px-6 pb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Tips</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
            <div className="flex items-start space-x-2">
              <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>Optimize images and enable browser caching for faster load times</span>
            </div>
            <div className="flex items-start space-x-2">
              <Zap className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Implement API response caching and optimize database queries</span>
            </div>
            <div className="flex items-start space-x-2">
              <HardDrive className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <span>Monitor memory usage patterns and optimize component renders</span>
            </div>
            <div className="flex items-start space-x-2">
              <Wifi className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <span>Use lazy loading and code splitting for better user experience</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;