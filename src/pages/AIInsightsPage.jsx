import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Upload,
  MessageSquare,
  Send,
  X,
  Info,
  BarChart3,
  Zap,
  Shield,
  Activity,
  Brain,
  Target,
  Lightbulb,
} from 'lucide-react';
import useStore from '../store/useStore';
import { analyzeData, answerQuestion } from '../services/openai';
import { isOpenAIConfigured, getConfigStatus } from '../config/openai.config';
import {
  formatInsights,
  getInsightStyle,
  handleOpenAIError,
  formatRecommendations,
  getPriorityStyle,
  formatDataQuality,
  generateCacheKey,
  getCachedResponse,
  setCachedResponse,
} from '../utils/aiHelpers';

const AIInsightsPage = () => {
  const {
    csvData,
    dataColumns,
    dataStats,
    aiInsights,
    aiInsightsLoading,
    aiInsightsError,
    aiRecommendations,
    aiPredictions,
    aiAnomalies,
    setAiInsights,
    setAiInsightsLoading,
    setAiInsightsError,
    setAiRecommendations,
    setAiPredictions,
    setAiAnomalies,
    clearAiInsights,
    setCurrentPage,
    aiChatMessages,
    aiChatLoading,
    addChatMessage,
    setAiChatLoading,
    clearChatMessages,
    aiAutoGenerate,
  } = useStore();

  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [dataQuality, setDataQuality] = useState(null);
  const [selectedInsightType, setSelectedInsightType] = useState('all');

  // Check if OpenAI is configured
  const configStatus = getConfigStatus();
  const isConfigured = configStatus.configured;

  // Auto-generate insights when data is uploaded (if enabled)
  useEffect(() => {
    if (csvData && csvData.length > 0 && dataColumns && dataColumns.length > 0 && isConfigured && aiAutoGenerate) {
      // Only auto-generate if we don't have insights yet
      if (aiInsights.length === 0 && !aiInsightsLoading) {
        // Check cache first
        const cacheKey = generateCacheKey(csvData, dataColumns);
        const cached = getCachedResponse(cacheKey);

        if (cached) {
          console.log('📦 Loading cached insights');
          setAiInsights(cached.insights || []);
          setAiRecommendations(cached.recommendations || []);
          setAiPredictions(cached.predictions || null);
          setAiAnomalies(cached.anomalies || []);
          setDataQuality(cached.dataQuality || null);
        } else {
          console.log('🤖 Auto-generating insights...');
          handleGenerateInsights();
        }
      }
    }
  }, [csvData, dataColumns, isConfigured, aiAutoGenerate]);

  // Generate AI insights
  const handleGenerateInsights = async () => {
    if (!csvData || csvData.length === 0) {
      setAiInsightsError('No data uploaded. Please upload a CSV file first.');
      return;
    }

    if (!isConfigured) {
      setAiInsightsError(configStatus.message);
      return;
    }

    setAiInsightsLoading(true);
    setAiInsightsError(null);

    try {
      console.log('🚀 Generating AI insights for', csvData.length, 'rows...');

      const result = await analyzeData(csvData, dataColumns);

      if (result.success && result.data) {
        const data = result.data;

        // Store insights
        const formattedInsights = formatInsights(data.insights || []);
        const formattedRecommendations = formatRecommendations(data.recommendations || []);
        
        setAiInsights(formattedInsights);
        setAiRecommendations(formattedRecommendations);
        setAiPredictions(data.predictions || null);
        setAiAnomalies(data.anomalies || []);
        setDataQuality(formatDataQuality(data.dataQuality));

        // Cache the results
        const cacheKey = generateCacheKey(csvData, dataColumns);
        setCachedResponse(cacheKey, {
          insights: formattedInsights,
          recommendations: formattedRecommendations,
          predictions: data.predictions || null,
          anomalies: data.anomalies || [],
          dataQuality: data.dataQuality || null,
        });

        console.log(`✅ Generated ${formattedInsights.length} insights`);
        console.log(`📊 Token usage: ${result.usage.totalTokens} tokens ($${(result.usage.totalTokens * 0.00003).toFixed(4)})`);
      }
    } catch (error) {
      console.error('❌ Error generating insights:', error);
      setAiInsightsError(handleOpenAIError(error));
    } finally {
      setAiInsightsLoading(false);
    }
  };

  // Handle chat question
  const handleAskQuestion = async () => {
    if (!chatInput.trim()) return;

    if (!csvData || csvData.length === 0) {
      addChatMessage({
        role: 'assistant',
        content: 'Please upload data first before asking questions.',
      });
      return;
    }

    if (!isConfigured) {
      addChatMessage({
        role: 'assistant',
        content: configStatus.message,
      });
      return;
    }

    // Add user message
    addChatMessage({
      role: 'user',
      content: chatInput,
    });

    const question = chatInput;
    setChatInput('');
    setAiChatLoading(true);

    try {
      const result = await answerQuestion(question, csvData, dataColumns);

      if (result.success) {
        addChatMessage({
          role: 'assistant',
          content: result.answer,
        });
      }
    } catch (error) {
      addChatMessage({
        role: 'assistant',
        content: `Error: ${handleOpenAIError(error)}`,
      });
    } finally {
      setAiChatLoading(false);
    }
  };

  // Get icon component for insight type
  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive':
        return TrendingUp;
      case 'warning':
        return AlertCircle;
      case 'negative':
        return TrendingDown;
      default:
        return CheckCircle;
    }
  };

  // Filter insights by type
  const filteredInsights = selectedInsightType === 'all' 
    ? aiInsights 
    : aiInsights.filter(insight => insight.type === selectedInsightType);

  // Count insights by type
  const insightCounts = {
    all: aiInsights.length,
    positive: aiInsights.filter(i => i.type === 'positive').length,
    warning: aiInsights.filter(i => i.type === 'warning').length,
    negative: aiInsights.filter(i => i.type === 'negative').length,
    neutral: aiInsights.filter(i => i.type === 'neutral').length,
  };

  // No data uploaded state
  if (!csvData || csvData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
            <Upload className="w-12 h-12 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">No Data Available</h2>
          <p className="text-gray-400 mb-8 max-w-md">Upload CSV data to unlock AI-powered insights and analysis</p>
          <button
            onClick={() => setCurrentPage('upload')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg shadow-blue-500/25"
          >
            Upload Data Now
          </button>
        </motion.div>
      </div>
    );
  }

  // OpenAI not configured state
  if (!isConfigured) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Insights</h1>
          <p className="text-gray-400">AI-powered analysis of your data</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-yellow-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">OpenAI Not Configured</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">{configStatus.message}</p>
          <button
            onClick={() => setCurrentPage('settings')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
          >
            Configure in Settings
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            AI Insights
          </h1>
          <p className="text-gray-400">
            {aiInsights.length > 0
              ? `${aiInsights.length} AI-generated insights from ${csvData.length.toLocaleString()} rows`
              : 'Generate intelligent insights from your data'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowChat(!showChat)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/25"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Ask AI</span>
          </button>
          <button
            onClick={handleGenerateInsights}
            disabled={aiInsightsLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
          >
            {aiInsightsLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {aiInsights.length > 0 ? 'Regenerate Insights' : 'Generate Insights'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {aiInsightsError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-red-400 font-semibold mb-1">Error Generating Insights</h4>
              <p className="text-red-200/80 text-sm">{aiInsightsError}</p>
            </div>
            <button
              onClick={handleGenerateInsights}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Data Summary Cards */}
      {dataStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4 hover:border-blue-400/50 transition-colors"
          >
            <BarChart3 className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-sm text-gray-400">Total Rows</p>
            <p className="text-2xl font-bold text-white">{dataStats.rowCount?.toLocaleString()}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-4 hover:border-green-400/50 transition-colors"
          >
            <Activity className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-sm text-gray-400">Columns</p>
            <p className="text-2xl font-bold text-white">{dataStats.columnCount}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4 hover:border-purple-400/50 transition-colors"
          >
            <Zap className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-sm text-gray-400">Data Quality</p>
            <p className="text-2xl font-bold text-white">
              {dataQuality ? `${dataQuality.score}%` : `${dataStats.qualityScore || 'N/A'}`}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-4 hover:border-orange-400/50 transition-colors"
          >
            <Shield className="w-8 h-8 text-orange-400 mb-2" />
            <p className="text-sm text-gray-400">Insights</p>
            <p className="text-2xl font-bold text-white">{aiInsights.length}</p>
          </motion.div>
        </div>
      )}

      {/* Loading Skeleton */}
      {aiInsightsLoading && aiInsights.length === 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Analyzing your data with AI...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insight Type Filter */}
      {!aiInsightsLoading && aiInsights.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All', icon: Sparkles },
            { key: 'positive', label: 'Positive', icon: TrendingUp },
            { key: 'warning', label: 'Warnings', icon: AlertCircle },
            { key: 'negative', label: 'Negative', icon: TrendingDown },
            { key: 'neutral', label: 'Neutral', icon: CheckCircle },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedInsightType(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedInsightType === key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              <span className="text-xs opacity-75">({insightCounts[key]})</span>
            </button>
          ))}
        </div>
      )}

      {/* Insights Grid */}
      {!aiInsightsLoading && filteredInsights.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredInsights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            const style = getInsightStyle(insight.type);

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all hover:shadow-xl hover:shadow-gray-900/50"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${style.bg} border ${style.border} flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${style.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h3 className="text-lg font-semibold text-white line-clamp-2">{insight.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${style.bg} ${style.text} font-medium`}>
                        {insight.category}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">{insight.description}</p>

                    {/* Data Points */}
                    {insight.dataPoints && insight.dataPoints.length > 0 && (
                      <div className="space-y-1 mb-4">
                        {insight.dataPoints.slice(0, 3).map((point, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                            <div className={`w-1.5 h-1.5 rounded-full ${style.bg}`}></div>
                            <span className="line-clamp-1">{point}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Confidence Bar */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">AI Confidence</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${insight.confidence}%` }}
                            transition={{ duration: 0.8, delay: index * 0.05 + 0.2 }}
                            className={`h-full bg-gradient-to-r ${style.gradient}`}
                          ></motion.div>
                        </div>
                        <span className="text-xs text-gray-400 font-semibold min-w-[3ch] text-right">{insight.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* No insights after filtering */}
      {!aiInsightsLoading && aiInsights.length > 0 && filteredInsights.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No {selectedInsightType} insights found</p>
        </div>
      )}

      {/* Recommendations Panel */}
      {aiRecommendations && aiRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-purple-400" />
            AI Recommendations
          </h3>
          <div className="space-y-3">
            {aiRecommendations.map((rec, index) => {
              const priorityStyle = getPriorityStyle(rec.priority);
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl hover:bg-gray-800 transition-colors border border-gray-700/50"
                >
                  <div className="flex items-start justify-between mb-2 gap-3">
                    <h4 className="font-semibold text-white flex-1">{rec.action}</h4>
                    <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${priorityStyle.bg} ${priorityStyle.text} font-medium`}>
                      {priorityStyle.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{rec.reason}</p>
                  {rec.impact && (
                    <p className="text-xs text-gray-500 flex items-start gap-2">
                      <Target className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-gray-400">Expected Impact:</strong> {rec.impact}</span>
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Predictions */}
      {aiPredictions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            Trend Predictions
          </h3>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
              aiPredictions.trend === 'up' ? 'bg-green-500/20 border border-green-500/30' :
              aiPredictions.trend === 'down' ? 'bg-red-500/20 border border-red-500/30' :
              'bg-gray-700 border border-gray-600'
            }`}>
              {aiPredictions.trend === 'up' && <TrendingUp className="w-8 h-8 text-green-400" />}
              {aiPredictions.trend === 'down' && <TrendingDown className="w-8 h-8 text-red-400" />}
              {aiPredictions.trend === 'stable' && <Activity className="w-8 h-8 text-gray-400" />}
            </div>
            <div className="flex-1">
              <p className="text-gray-300 mb-3 leading-relaxed">{aiPredictions.forecast}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${aiPredictions.confidence}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  ></motion.div>
                </div>
                <span className="text-xs text-gray-400 font-semibold">{aiPredictions.confidence}% confidence</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Anomalies */}
      {aiAnomalies && aiAnomalies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            Detected Anomalies
          </h3>
          <div className="space-y-3">
            {aiAnomalies.map((anomaly, index) => (
              <motion.div
                key={anomaly.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-4 bg-gray-800/50 backdrop-blur-sm border border-yellow-500/20 rounded-xl hover:border-yellow-500/40 transition-colors"
              >
                <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-white font-semibold mb-1">{anomaly.column}</p>
                  <p className="text-sm text-gray-400 mb-2">{anomaly.description}</p>
                  <span className={`text-xs px-2 py-1 rounded inline-block font-medium ${
                    anomaly.severity === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    anomaly.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {anomaly.severity} severity
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Chat Modal */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowChat(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-2xl w-full max-w-2xl h-[600px] flex flex-col border border-gray-700 shadow-2xl"
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Ask AI About Your Data</h3>
                    <p className="text-xs text-gray-400">Get instant answers to your questions</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {aiChatMessages.length === 0 && (
                  <div className="text-center text-gray-500 mt-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="font-semibold mb-2">Ask me anything about your data!</p>
                    <div className="mt-6 space-y-2 text-left max-w-md mx-auto">
                      <p className="text-xs text-gray-600 font-semibold mb-3">Example questions:</p>
                      {[
                        'What are the top trends in this data?',
                        'Which columns have the highest values?',
                        'What correlations can you find?',
                        'Are there any outliers I should know about?'
                      ].map((q) => (
                        <button
                          key={q}
                          onClick={() => setChatInput(q)}
                          className="block w-full text-left text-sm p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors text-gray-300"
                        >
                          • {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {aiChatMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-xl ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-gray-700 text-gray-200 border border-gray-600'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <p className="text-xs opacity-60 mt-2">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {aiChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-gray-200 p-3 rounded-xl border border-gray-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !aiChatLoading && handleAskQuestion()}
                    placeholder="Ask a question about your data..."
                    className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                    disabled={aiChatLoading}
                  />
                  <button
                    onClick={handleAskQuestion}
                    disabled={!chatInput.trim() || aiChatLoading}
                    className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                {aiChatMessages.length > 0 && (
                  <button
                    onClick={clearChatMessages}
                    className="text-xs text-gray-500 hover:text-gray-400 mt-2 transition-colors"
                  >
                    Clear conversation
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIInsightsPage;
