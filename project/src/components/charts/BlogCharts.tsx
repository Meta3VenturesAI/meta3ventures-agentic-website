/**
 * Blog Charts Component - Lazy Loaded
 * Separated for better bundle optimization
 */

import React from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#4F46E5', '#7C3AED', '#2563EB', '#9333EA', '#3B82F6', '#06B6D4', '#10B981'];

interface ChartData {
  name: string;
  value: number;
  [key: string]: unknown;
}

interface BlogChartsProps {
  pageViewsData: ChartData[];
  engagementData: ChartData[];
  tagData: ChartData[];
  performanceData: ChartData[];
}

export const BlogCharts: React.FC<BlogChartsProps> = ({
  pageViewsData,
  engagementData,
  tagData,
  performanceData
}) => {
  return (
    <div className="space-y-8">
      {/* Page Views Over Time */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Page Views Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={pageViewsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="views" stroke="#4F46E5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Engagement Metrics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={engagementData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="likes" fill="#10B981" />
            <Bar dataKey="comments" fill="#7C3AED" />
            <Bar dataKey="shares" fill="#06B6D4" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Content by Tags */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Content by Tags</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={tagData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {tagData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Trends */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="performance" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BlogCharts;
