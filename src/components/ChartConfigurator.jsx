import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Lightbulb,
  Brain,
  Loader2,
  CheckCircle,
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
  ComposedChart,
  Label,
  LabelList,
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
import { suggestChartWithAI } from '../services/openai';
import { isOpenAIConfigured } from '../config/openai.config';
import { handleOpenAIError } from '../utils/aiHelpers';

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
  const [showTrendline, setShowTrendline] = useState(false);
  
  // AI Suggestions State
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

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

  // Auto-suggest chart configuration (rule-based)
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

  // AI-powered chart suggestions
  const handleAiSuggest = async () => {
    if (!isOpenAIConfigured()) {
      setAiError('OpenAI is not configured. Please add your API key in Settings.');
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setShowAiSuggestions(true);

    try {
      console.log('🤖 Requesting AI chart suggestions...');
      const result = await suggestChartWithAI(data, columns);

      if (result.success && result.suggestions) {
        setAiSuggestions(result.suggestions);
        console.log(`✅ Received ${result.suggestions.length} AI suggestions`);
      }
    } catch (error) {
      console.error('❌ AI suggestion error:', error);
      setAiError(handleOpenAIError(error));
    } finally {
      setAiLoading(false);
    }
  };

  // Apply AI suggestion
  const applyAiSuggestion = (suggestion) => {
    // Helper: match suggestion column names to actual column names (case-insensitive)
    const findColumnName = (name) => {
      if (!name) return '';
      // If columns are objects with .name, try to match; otherwise try direct
      const exact = columns.find((c) => (c.name ? c.name === name : c === name));
      if (exact) return exact.name || name;
      const lower = name.toLowerCase();
      const found = columns.find((c) => ((c.name ? c.name : c) && (c.name ? c.name.toLowerCase() : String(c).toLowerCase()) === lower));
      return found ? (found.name || name) : name;
    };

    setChartType(suggestion.chartType);

    if (suggestion.chartType === 'pie') {
      setCategoryColumn(findColumnName(suggestion.categoryColumn || suggestion.xColumn || ''));
      setValueColumn(findColumnName(suggestion.valueColumn || suggestion.yColumn || ''));
    } else {
      setXColumn(findColumnName(suggestion.xColumn || ''));
      setYColumn(findColumnName(suggestion.yColumn || ''));
    }

    if (suggestion.aggregation) {
      setAggregation(suggestion.aggregation);
    }

    if (suggestion.title) {
      setChartTitle(suggestion.title);
    } else {
      // Create a friendly title if none provided
      if (suggestion.xColumn && suggestion.yColumn) {
        setChartTitle(`${suggestion.yColumn} by ${suggestion.xColumn}`);
      }
    }

    // Ensure the live preview is visible after applying suggestion
    setShowPreview(true);

    // Close the suggestions panel and clear suggestions
    setShowAiSuggestions(false);
    setAiSuggestions([]);
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

  // Helper and UI constants
  const AGGREGATION_LABELS = {
    sum: 'Sum',
    avg: 'Average (Mean)',
    average: 'Average (Mean)',
    count: 'Count',
    min: 'Minimum',
    max: 'Maximum',
  };

  const getContrastColor = (hex) => {
    if (!hex) return '#000';
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#000' : '#fff';
  };

  const detectUnitForColumn = (colName = '') => {
    const n = String(colName).toLowerCase();
    if (n.includes('income') || n.includes('salary') || n.includes('amount') || n.includes('revenue')) return '₹';
    if (n.includes('percent') || n.includes('%') || n.includes('rate')) return '%';
    return '';
  };

  // Format numbers for display in axes, tooltips and labels
  const formatValue = (v) => {
    if (v === null || v === undefined || v === '') return '-';
    const num = Number(v);
    if (!isNaN(num)) {
      try {
        return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(num);
      } catch (e) {
        return num.toFixed(2);
      }
    }
    return String(v);
  };

  const generateTitle = ({ chartType, xColumn, yColumn, aggregation, categoryColumn, valueColumn }) => {
    if (chartType === 'pie') {
      const name = categoryColumn || 'Category';
      if (valueColumn) return `${AGGREGATION_LABELS[aggregation]?.split(' ')[0] || 'Count'} of ${valueColumn} by ${name}`;
      return `Distribution of ${name}`;
    }

    if (chartType === 'scatter') {
      return `${yColumn || 'Y'} vs ${xColumn || 'X'}`;
    }

    const aggLabel = aggregation ? AGGREGATION_LABELS[aggregation] || aggregation : '';
    if (aggLabel && xColumn && yColumn) return `${aggLabel} ${yColumn} by ${xColumn}`;
    if (xColumn && yColumn) return `${yColumn} by ${xColumn}`;
    return 'Chart';
  };

  const renderBarLabel = (props) => {
    const { x, y, width, value, fill } = props;
    const textX = x + width / 2;
    const textY = y - 6;
    const color = getContrastColor(fill || COLORS[0]);
    return (
      <text x={textX} y={textY} fill={color} textAnchor="middle" fontSize={12} fontWeight={600}>
        {formatValue(value)}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload, label, type = 'bar', total }) => {
    if (!active || !payload || payload.length === 0) return null;

    const p = payload[0];
    const data = p.payload || {};
    const name = data.name || label || (data.x ?? data.label) || 'Value';
    const value = data.value != null ? data.value : data.y ?? data.value;
    const count = data.count != null ? data.count : data._count || 1;
    const pct = total && total > 0 ? `${Math.round((Number(value) / total) * 100)}%` : null;

    return (
      <div className="bg-white p-3 rounded shadow border text-sm text-gray-800">
        <div className="font-semibold mb-1">{type === 'pie' ? `${name}` : `${label || name}`}</div>
        <div>{type === 'pie' ? `${formatValue(value)}` : `${formatValue(value)}`}</div>
        <div className="text-xs text-gray-600">Entries: {count}</div>
        {pct && <div className="text-xs text-gray-600">% of Total: {pct}</div>}
      </div>
    );
  };

  // Render chart preview
  const renderChartPreview = () => {
    if (!isValid || !chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{error || 'No data available for selected configuration.'}</p>
          </div>
        </div>
      );
    }

    // Normalize data to a predictable shape (label, value, count, x, y)
    const displayedData = chartData.map((d) => ({
      ...d,
      label: d.name ?? d.label ?? (d.x != null ? String(d.x) : ''),
      value: d.value ?? d.y ?? d.value,
      x: d.x ?? (d.label != null ? d.label : undefined),
      y: d.y ?? d.value,
      count: d.count ?? d._count ?? 1,
    }));

    const total = displayedData.reduce((s, it) => s + (Number(it.value) || 0), 0);
    const rotateTicks = displayedData.length > 8;

    switch (chartType) {
      case 'bar': {
        // Choose color (blue default). If values negative, use red.
        const allValues = displayedData.map((r) => Number(r.value) || 0);
        const avg = allValues.reduce((s, v) => s + v, 0) / Math.max(1, allValues.length);
        const barColor = avg < 0 ? '#EF4444' : '#3B82F6';

        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayedData} margin={{ top: 20, right: 20, left: 20, bottom: rotateTicks ? 80 : 40 }}>
              <CartesianGrid stroke="#E6E6E6" horizontal vertical={false} />
              <XAxis
                dataKey="label"
                height={rotateTicks ? 60 : 40}
                tick={{ fontSize: 12, angle: rotateTicks ? -30 : 0, textAnchor: rotateTicks ? 'end' : 'middle' }}
              />
              <YAxis tickFormatter={(v) => formatValue(v)}>
                <Label value={`${yColumn || 'Value'} ${detectUnitForColumn(yColumn) ? `(${detectUnitForColumn(yColumn)})` : ''}`} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#666' }} />
              </YAxis>
              <Tooltip content={(props) => <CustomTooltip {...props} type="bar" total={total} />} />
              <Legend />
              <Bar dataKey="value" fill={barColor} name={yColumn} isAnimationActive>
                {displayedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={barColor} />
                ))}
                <LabelList dataKey="value" content={renderBarLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'line': {
        const lineColor = (() => {
          const vals = displayedData.map((r) => Number(r.value) || 0);
          if (vals.length >= 2) {
            return vals[vals.length - 1] > vals[0] ? '#10B981' : '#EF4444';
          }
          return '#10B981';
        })();

        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={displayedData} margin={{ top: 20, right: 20, left: 20, bottom: rotateTicks ? 80 : 40 }}>
              <CartesianGrid stroke="#E6E6E6" horizontal vertical={false} />
              <XAxis dataKey="label" interval={0} height={rotateTicks ? 60 : 40} tick={{ angle: rotateTicks ? -30 : 0, textAnchor: rotateTicks ? 'end' : 'middle' }} />
              <YAxis tickFormatter={(v) => formatValue(v)}>
                <Label value={`${yColumn || 'Value'} ${detectUnitForColumn(yColumn) ? `(${detectUnitForColumn(yColumn)})` : ''}`} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#666' }} />
              </YAxis>
              <Tooltip content={(props) => <CustomTooltip {...props} type="line" total={total} />} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke={lineColor} dot={{ r: 3 }} activeDot={{ r: 6 }} />
            </RechartsLineChart>
          </ResponsiveContainer>
        );
      }

      case 'pie': {
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={displayedData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ percent }) => `${Math.round(percent * 100)}%`}
                paddingAngle={2}
              >
                {displayedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={(props) => <CustomTooltip {...props} type="pie" total={total} />} />
              <Legend layout="vertical" verticalAlign="middle" align="right" />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      }

      case 'scatter': {
        // Compute regression if trendline requested
        const points = displayedData.map((d) => ({ x: Number(d.x), y: Number(d.y) })).filter((p) => !isNaN(p.x) && !isNaN(p.y));
        let withTrend = displayedData;
        if (showTrendline && points.length >= 2) {
          const meanX = points.reduce((s, p) => s + p.x, 0) / points.length;
          const meanY = points.reduce((s, p) => s + p.y, 0) / points.length;
          const num = points.reduce((s, p) => s + (p.x - meanX) * (p.y - meanY), 0);
          const den = points.reduce((s, p) => s + Math.pow(p.x - meanX, 2), 0) || 1;
          const slope = num / den;
          const intercept = meanY - slope * meanX;
          withTrend = displayedData.map((d) => ({ ...d, trend: !isNaN(Number(d.x)) ? intercept + slope * Number(d.x) : null }));
        }

        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={withTrend} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
              <CartesianGrid stroke="#E6E6E6" horizontal vertical={false} />
              <XAxis dataKey="x" name={xColumn} tickFormatter={(v) => formatValue(v)} />
              <YAxis tickFormatter={(v) => formatValue(v)}>
                <Label value={`${yColumn || 'Y'} ${detectUnitForColumn(yColumn) ? `(${detectUnitForColumn(yColumn)})` : ''}`} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#666' }} />
              </YAxis>
              <Tooltip content={(props) => <CustomTooltip {...props} type="scatter" total={total} />} cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name={nameColumn || 'Data'} data={withTrend} fill="#F59E0B" />
              {showTrendline && <Line type="linear" dataKey="trend" stroke="#EF4444" dot={false} />}
            </ComposedChart>
          </ResponsiveContainer>
        );
      }

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

              {/* Auto-suggest Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleAutoSuggest}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  Quick Suggest
                </button>
                
                <button
                  onClick={handleAiSuggest}
                  disabled={aiLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating AI Suggestions...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      AI-Powered Suggestions
                    </>
                  )}
                </button>
              </div>

              {/* AI Suggestions Panel */}
              <AnimatePresence>
                {showAiSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-purple-600" />
                          <h3 className="font-semibold text-purple-900">AI Suggestions</h3>
                        </div>
                        <button
                          onClick={() => setShowAiSuggestions(false)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {aiError && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700">{aiError}</p>
                        </div>
                      )}

                      {aiLoading && (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                          <span className="ml-2 text-purple-700">Analyzing your data...</span>
                        </div>
                      )}

                      {!aiLoading && aiSuggestions.length > 0 && (
                        <div className="space-y-2">
                          {aiSuggestions.map((suggestion, idx) => (
                            <motion.button
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              onClick={() => applyAiSuggestion(suggestion)}
                              className="w-full text-left p-3 bg-white border border-purple-200 rounded-lg hover:border-purple-400 hover:shadow-md transition-all group"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-purple-900 capitalize">
                                      {suggestion.chartType} Chart
                                    </span>
                                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                      {suggestion.confidence}% confidence
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{suggestion.reasoning}</p>
                                  <div className="text-xs text-gray-500">
                                    <span className="font-medium">Config:</span> {suggestion.xColumn} × {suggestion.yColumn || suggestion.categoryColumn}
                                    {suggestion.aggregation && ` (${suggestion.aggregation})`}
                                  </div>
                                  {suggestion.insights && suggestion.insights.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      {suggestion.insights.map((insight, i) => (
                                        <p key={i} className="text-xs text-purple-700 flex items-start gap-1">
                                          <span>•</span>
                                          <span>{insight}</span>
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <CheckCircle className="w-5 h-5 text-purple-400 group-hover:text-purple-600 transition-colors flex-shrink-0" />
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {!aiLoading && aiSuggestions.length === 0 && !aiError && (
                        <p className="text-sm text-purple-700 text-center py-4">
                          Click "AI-Powered Suggestions" to get smart chart recommendations
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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

                  {chartType === 'scatter' && (
                    <div className="flex items-center gap-3">
                      <input id="trendline" type="checkbox" checked={showTrendline} onChange={(e) => setShowTrendline(e.target.checked)} className="w-4 h-4" />
                      <label htmlFor="trendline" className="text-sm text-gray-700">Show trendline</label>
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
                  {(() => {
                    const titleToShow = chartTitle || generateTitle(currentConfig);
                    const aggSubtitle = aggregation ? `Aggregation: ${AGGREGATION_LABELS[aggregation] || aggregation}` : null;
                    return (
                      <div>
                        {titleToShow && <p className="text-gray-600 mt-1">{titleToShow}</p>}
                        {aggSubtitle && <p className="text-xs text-gray-500 mt-1">{aggSubtitle}</p>}
                      </div>
                    );
                  })()}
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
