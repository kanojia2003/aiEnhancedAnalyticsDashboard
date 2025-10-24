/**
 * AI Helper Utilities
 * 
 * Helper functions for AI integration, data preparation,
 * response parsing, and error handling.
 */

/**
 * Estimate token count (rough approximation)
 * OpenAI uses ~4 characters per token
 */
export const estimateTokens = (text) => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};

/**
 * Truncate context to fit within token limits
 */
export const truncateContext = (data, maxTokens = 3000) => {
  const jsonString = JSON.stringify(data);
  const estimatedTokens = estimateTokens(jsonString);
  
  if (estimatedTokens <= maxTokens) {
    return data;
  }
  
  // Reduce data size
  if (Array.isArray(data)) {
    const ratio = maxTokens / estimatedTokens;
    const targetLength = Math.floor(data.length * ratio * 0.9); // 90% to be safe
    return data.slice(0, Math.max(1, targetLength));
  }
  
  return data;
};

/**
 * Format insights for display
 */
export const formatInsights = (insights) => {
  if (!insights || !Array.isArray(insights)) {
    return [];
  }
  
  return insights.map(insight => ({
    ...insight,
    // Ensure all required fields
    id: insight.id || `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: insight.type || 'neutral',
    category: insight.category || 'general',
    confidence: insight.confidence || 0,
    dataPoints: insight.dataPoints || [],
    // Format timestamp
    timestamp: insight.timestamp || new Date().toISOString(),
    formattedTime: new Date(insight.timestamp || Date.now()).toLocaleString()
  }));
};

/**
 * Get icon and color for insight type
 */
export const getInsightStyle = (type) => {
  const styles = {
    positive: {
      color: 'green',
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      border: 'border-green-500/30',
      gradient: 'from-green-500 to-green-600'
    },
    warning: {
      color: 'yellow',
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
      gradient: 'from-yellow-500 to-yellow-600'
    },
    negative: {
      color: 'red',
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/30',
      gradient: 'from-red-500 to-red-600'
    },
    neutral: {
      color: 'blue',
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      gradient: 'from-blue-500 to-blue-600'
    }
  };
  
  return styles[type] || styles.neutral;
};

/**
 * Handle OpenAI errors with user-friendly messages
 */
export const handleOpenAIError = (error) => {
  if (!error) {
    return 'An unknown error occurred';
  }
  
  // API key errors
  if (error.message?.includes('API key') || error.status === 401) {
    return 'Invalid API key. Please check your OpenAI API key in Settings.';
  }
  
  // Rate limit errors
  if (error.status === 429 || error.message?.includes('rate limit')) {
    return 'Rate limit exceeded. Please wait a few moments and try again.';
  }
  
  // Token limit errors
  if (error.message?.includes('token') || error.message?.includes('context length')) {
    return 'Data is too large. Try with a smaller dataset or fewer columns.';
  }
  
  // Network errors
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return 'Network error. Please check your internet connection.';
  }
  
  // Service errors
  if (error.status === 500 || error.status === 503) {
    return 'OpenAI service is temporarily unavailable. Please try again later.';
  }
  
  // Default
  return error.message || 'Failed to connect to AI service';
};

/**
 * Validate AI response structure
 */
export const validateAIResponse = (response, requiredFields = []) => {
  if (!response || typeof response !== 'object') {
    return {
      valid: false,
      error: 'Invalid response format'
    };
  }
  
  for (const field of requiredFields) {
    if (!(field in response)) {
      return {
        valid: false,
        error: `Missing required field: ${field}`
      };
    }
  }
  
  return {
    valid: true,
    error: null
  };
};

/**
 * Format recommendations for display
 */
export const formatRecommendations = (recommendations) => {
  if (!recommendations || !Array.isArray(recommendations)) {
    return [];
  }
  
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  
  return recommendations
    .map(rec => ({
      ...rec,
      id: rec.id || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      priority: rec.priority || 'medium'
    }))
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

/**
 * Get priority badge style
 */
export const getPriorityStyle = (priority) => {
  const styles = {
    high: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      label: 'High Priority'
    },
    medium: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      label: 'Medium Priority'
    },
    low: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      label: 'Low Priority'
    }
  };
  
  return styles[priority] || styles.medium;
};

/**
 * Cache management
 */
const cache = new Map();

export const getCachedResponse = (key) => {
  const cached = cache.get(key);
  
  if (!cached) return null;
  
  // Check if cache is expired (30 minutes)
  if (Date.now() - cached.timestamp > 30 * 60 * 1000) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
};

export const setCachedResponse = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};



/**
 * Generate cache key from data
 */
export const generateCacheKey = (data, columns) => {
  const dataHash = JSON.stringify({
    rowCount: data.length,
    columnCount: columns.length,
    columnNames: columns.map(c => c.name).sort().join(','),
    firstRowHash: JSON.stringify(data[0])
  });
  
  return btoa(dataHash); // Base64 encode
};

/**
 * Format data quality score
 */
export const formatDataQuality = (quality) => {
  if (!quality) return null;
  
  let rating, color;
  
  if (quality.score >= 90) {
    rating = 'Excellent';
    color = 'green';
  } else if (quality.score >= 75) {
    rating = 'Good';
    color = 'blue';
  } else if (quality.score >= 60) {
    rating = 'Fair';
    color = 'yellow';
  } else {
    rating = 'Poor';
    color = 'red';
  }
  
  return {
    ...quality,
    rating,
    color
  };
};

/**
 * Export all utilities
 */
export default {
  estimateTokens,
  truncateContext,
  formatInsights,
  getInsightStyle,
  handleOpenAIError,
  validateAIResponse,
  formatRecommendations,
  getPriorityStyle,
  getCachedResponse,
  setCachedResponse,
  generateCacheKey,
  formatDataQuality
};
