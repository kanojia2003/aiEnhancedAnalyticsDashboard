import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  Sparkles,
  Save,
  X,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { suggestChartType, getNumericColumns, getCategoricalColumns } from '../utils/chartHelpers';
import { useChartData } from '../hooks/useChartData';

const CHART_TYPES = [
  { id: 'bar', name: 'Bar Chart', icon: BarChart3, color: 'blue' },
  { id: 'line', name: 'Line Chart', icon: LineChart, color: 'green' },
  { id: 'pie', name: 'Pie Chart', icon: PieChart, color: 'purple' },
  { id: 'scatter', name: 'Scatter Plot', icon: ScatterChart, color: 'orange' },
];

const AGGREGATION_METHODS = [
  { id: 'sum', name: 'Sum', description: 'Add all values' },
  { id: 'avg', name: 'Average', description: 'Mean of values' },
  { id: 'count', name: 'Count', description: 'Number of items' },
  { id: 'min', name: 'Minimum', description: 'Smallest value' },
  { id: 'max', name: 'Maximum', description: 'Largest value' },
];

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#F97316'];

const ChartConfigurator = ({ data, columns, onSave, onCancel, initialConfig = null }) => {
  const [chartType, setChartType] = useState(initialConfig?.chartType || 'bar');
  const [xColumn, setXColumn] = useState(initialConfig?.xColumn || '');
  const [yColumn, setYColumn] = useState(initialConfig?.yColumn || '');
  const [categoryColumn, setCategoryColumn] = useState(initialConfig?.categoryColumn || '');
  const [valueColumn, setValueColumn] = useState(initialConfig?.valueColumn || '');
  const [nameColumn, setNameColumn] = useState(initialConfig?.nameColumn || '');
  const [aggregation, setAggregation] = useState(initialConfig?.aggregation || 'sum');
  const [topN, setTopN] = useState(initialConfig?.topN || 10);
  const [chartTitle, setChartTitle] = useState(initialConfig?.title || '');
  const [showPreview, setShowPreview] = useState(true);

  // Build current configuration
  const currentConfig = {
    chartType,
    xColumn,
    yColumn,
    categoryColumn,
    valueColumn,
    nameColumn,
    aggregation,
    topN,
    title: chartTitle,
  };

  // Use the custom hook for chart data
  const { chartData, isValid, error, stats } = useChartData(data, currentConfig);

  // Auto-suggest chart configuration
  const handleAutoSuggest = () => {
    const suggestion = suggestChartType(columns);
    
    if (suggestion) {
      setChartType(suggestion.chartType);
      
      if (suggestion.chartType === 'pie') {
        setCategoryColumn(suggestion.xColumn || '');
        setValueColumn(suggestion.yColumn || '');
      } else {
        setXColumn(suggestion.xColumn || '');
        setYColumn(suggestion.yColumn || '');
      }
      
      if (suggestion.aggregation) {
        setAggregation(suggestion.aggregation);
      }

      // Generate a title based on the suggestion
      if (suggestion.xColumn && suggestion.yColumn) {
        const titleMap = {
          bar: `${suggestion.yColumn} by ${suggestion.xColumn}`,
          line: `${suggestion.yColumn} over ${suggestion.xColumn}`,
          pie: `${suggestion.yColumn} Distribution by ${suggestion.xColumn}`,
          scatter: `${suggestion.yColumn} vs ${suggestion.xColumn}`,
        };
        setChartTitle(titleMap[suggestion.chartType] || '');
      }
    }
  };

  // Handle save
  const handleSave = () => {
    if (!isValid) {
      return;
    }

    const config = {
      id: initialConfig?.id || `chart_${Date.now()}`,
      chartType,
      xColumn: chartType === 'pie' ? undefined : xColumn,
      yColumn: chartType === 'pie' ? undefined : yColumn,
      categoryColumn: chartType === 'pie' ? categoryColumn : undefined,
      valueColumn: chartType === 'pie' ? valueColumn : undefined,
      nameColumn: chartType === 'scatter' ? nameColumn : undefined,
      aggregation: chartType !== 'scatter' ? aggregation : undefined,
      topN: chartType === 'pie' ? topN : undefined,
      title: chartTitle || 'Untitled Chart',
    };

    onSave(config);
  };

  // Get filtered columns based on chart type
  const numericColumns = getNumericColumns(columns);
  const categoricalColumns = getCategoricalColumns(columns);

  // Render chart preview
  const renderChartPreview = () => {
    if (!isValid || !chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{error || 'Configure chart to see preview'}</p>
          </div>
        </div>
      );
    }

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3B82F6" name={yColumn} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#10B981" name={yColumn} />
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name={xColumn} />
              <YAxis dataKey="y" name={yColumn} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name={nameColumn || 'Data'} data={chartData} fill="#F59E0B" />
            </RechartsScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl w-[95%] h-[90%] max-w-7xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {initialConfig ? 'Edit Chart' : 'Create New Chart'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure your chart and see a live preview
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Configuration Panel */}
          <div className="w-1/3 p-6 border-r overflow-y-auto">
            <div className="space-y-6">
              {/* Chart Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chart Title
                </label>
                <input
                  type="text"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  placeholder="Enter chart title"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Auto-suggest Button */}
              <button
                onClick={handleAutoSuggest}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Auto-Suggest Chart
              </button>

              {/* Chart Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chart Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CHART_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = chartType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setChartType(type.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? `border-${type.color}-500 bg-${type.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 mx-auto mb-2 ${
                            isSelected ? `text-${type.color}-600` : 'text-gray-600'
                          }`}
                        />
                        <p className={`text-sm font-medium ${
                          isSelected ? `text-${type.color}-700` : 'text-gray-700'
                        }`}>
                          {type.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Column Selection based on Chart Type */}
              {chartType === 'pie' ? (
                <>
                  {/* Pie Chart - Category Column */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Column
                    </label>
                    <select
                      value={categoryColumn}
                      onChange={(e) => setCategoryColumn(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select category...</option>
                      {categoricalColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pie Chart - Value Column */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value Column
                    </label>
                    <select
                      value={valueColumn}
                      onChange={(e) => setValueColumn(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select value...</option>
                      {numericColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Top N */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Show Top {topN} Categories
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="20"
                      value={topN}
                      onChange={(e) => setTopN(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600 text-center mt-1">{topN}</div>
                  </div>
                </>
              ) : (
                <>
                  {/* X-Axis Column */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      X-Axis Column
                    </label>
                    <select
                      value={xColumn}
                      onChange={(e) => setXColumn(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select column...</option>
                      {columns.map((col) => (
                        <option key={col.name} value={col.name}>
                          {col.name} ({col.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Y-Axis Column */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Y-Axis Column
                    </label>
                    <select
                      value={yColumn}
                      onChange={(e) => setYColumn(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select column...</option>
                      {numericColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Name Column for Scatter */}
                  {chartType === 'scatter' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name Column (Optional)
                      </label>
                      <select
                        value={nameColumn}
                        onChange={(e) => setNameColumn(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">None</option>
                        {columns.map((col) => (
                          <option key={col.name} value={col.name}>
                            {col.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Aggregation Method (not for scatter) */}
                  {chartType !== 'scatter' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aggregation Method
                      </label>
                      <div className="space-y-2">
                        {AGGREGATION_METHODS.map((method) => (
                          <label
                            key={method.id}
                            className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                          >
                            <input
                              type="radio"
                              name="aggregation"
                              value={method.id}
                              checked={aggregation === method.id}
                              onChange={(e) => setAggregation(e.target.value)}
                              className="mr-3"
                            />
                            <div>
                              <p className="font-medium text-gray-700">{method.name}</p>
                              <p className="text-sm text-gray-500">{method.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Stats Display */}
              {stats && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Chart Statistics</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {Object.entries(stats).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-blue-600 capitalize">{key}</p>
                        <p className="font-semibold text-blue-900">
                          {typeof value === 'number' ? value.toFixed(2) : value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 p-6 bg-gray-50">
            <div className="h-full flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Live Preview</h3>
                {chartTitle && (
                  <p className="text-gray-600 mt-1">{chartTitle}</p>
                )}
              </div>
              <div className="flex-1 bg-white rounded-lg shadow-sm p-4">
                {renderChartPreview()}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div>
            {error && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
                isValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-5 h-5" />
              Save Chart
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChartConfigurator;
