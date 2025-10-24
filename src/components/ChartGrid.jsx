import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Edit2,
  Trash2,
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  Maximize2,
  GripVertical,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useChartData } from '../hooks/useChartData';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#F97316'];

const ChartGrid = ({ configs, data, onEdit, onDelete, onReorder }) => {
  const [expandedChart, setExpandedChart] = useState(null);
  const [gridLayout, setGridLayout] = useState('2-col'); // '1-col', '2-col', '3-col'

  // Handle reordering
  const handleReorder = (newOrder) => {
    if (onReorder) {
      onReorder(newOrder);
    }
  };

  // Toggle expanded view
  const toggleExpanded = (chartId) => {
    setExpandedChart(expandedChart === chartId ? null : chartId);
  };

  // Grid layout classes
  const getGridClass = () => {
    switch (gridLayout) {
      case '1-col':
        return 'grid-cols-1';
      case '2-col':
        return 'grid-cols-1 lg:grid-cols-2';
      case '3-col':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      default:
        return 'grid-cols-1 lg:grid-cols-2';
    }
  };

  return (
    <div className="space-y-4">
      {/* Grid Layout Controls */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-gray-400">Layout:</span>
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setGridLayout('1-col')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              gridLayout === '1-col'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            1 Col
          </button>
          <button
            onClick={() => setGridLayout('2-col')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              gridLayout === '2-col'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            2 Col
          </button>
          <button
            onClick={() => setGridLayout('3-col')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              gridLayout === '3-col'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            3 Col
          </button>
        </div>
      </div>

      {/* Charts Grid with Drag & Drop */}
      <Reorder.Group
        axis="y"
        values={configs}
        onReorder={handleReorder}
        className={`grid ${getGridClass()} gap-6`}
      >
        {configs.map((config, index) => (
          <Reorder.Item
            key={config.id}
            value={config}
            className={expandedChart === config.id ? 'col-span-full' : ''}
          >
            <ChartCard
              config={config}
              data={data}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              isExpanded={expandedChart === config.id}
              onToggleExpand={() => toggleExpanded(config.id)}
            />
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
};

// Chart Card Component
const ChartCard = ({ config, data, index, onEdit, onDelete, isExpanded, onToggleExpand }) => {
  const { chartData, isValid, stats } = useChartData(data, config);

  const getChartIcon = () => {
    switch (config.chartType) {
      case 'bar':
        return <BarChart3 className="w-5 h-5" />;
      case 'line':
        return <LineChart className="w-5 h-5" />;
      case 'pie':
        return <PieChart className="w-5 h-5" />;
      case 'scatter':
        return <ScatterChart className="w-5 h-5" />;
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getChartColor = () => {
    switch (config.chartType) {
      case 'bar':
        return 'blue';
      case 'line':
        return 'green';
      case 'pie':
        return 'purple';
      case 'scatter':
        return 'orange';
      default:
        return 'blue';
    }
  };

  const color = getChartColor();

  // Calculate trend if stats available
  const getTrend = () => {
    if (!stats || config.chartType === 'pie') return null;

    if (stats.max && stats.min) {
      const range = stats.max - stats.min;
      const avgPos = (stats.average - stats.min) / range;
      return avgPos > 0.5 ? 'up' : 'down';
    }
    return null;
  };

  const trend = getTrend();

  const renderChart = () => {
    if (!isValid || !chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>Invalid chart configuration</p>
        </div>
      );
    }

    const height = isExpanded ? 500 : 250;

    switch (config.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} name={config.yColumn} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsLineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 4 }}
                name={config.yColumn}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={isExpanded ? 150 : 80}
                label={isExpanded}
              >
                {chartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend wrapperStyle={{ color: '#9ca3af' }} iconType="circle" />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="x" stroke="#9ca3af" name={config.xColumn} />
              <YAxis dataKey="y" stroke="#9ca3af" name={config.yColumn} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Scatter name={config.nameColumn || 'Data'} data={chartData} fill="#F59E0B" />
            </RechartsScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
      data-chart-id={config.id}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-5 h-5 text-gray-600 hover:text-gray-400" />
          </div>
          <div className={`w-10 h-10 bg-${color}-500/20 rounded-lg flex items-center justify-center`}>
            <div className={`text-${color}-400`}>{getChartIcon()}</div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{config.title}</h3>
            {stats && config.chartType !== 'pie' && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-400">
                  Avg: {typeof stats.average === 'number' ? stats.average.toFixed(2) : stats.average}
                </span>
                {trend && (
                  <div className="flex items-center gap-1">
                    {trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleExpand}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <Maximize2 className={`w-4 h-4 ${isExpanded ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`} />
          </button>
          <button
            onClick={() => onEdit(config)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Edit chart"
          >
            <Edit2 className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
          <button
            onClick={() => onDelete(config.id)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Delete chart"
          >
            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className={isExpanded ? 'h-[500px]' : 'h-[250px]'}>{renderChart()}</div>

      {/* Stats Footer (only for expanded view) */}
      {isExpanded && stats && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-400 uppercase mb-1">{key}</p>
                <p className="text-lg font-semibold text-white">
                  {typeof value === 'number' ? value.toFixed(2) : value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ChartGrid;
