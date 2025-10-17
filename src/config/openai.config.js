/**
 * OpenAI Configuration
 * 
 * Centralized configuration for OpenAI API integration
 * Loads settings from environment variables
 */

export const OPENAI_CONFIG = {
  // API Key (loaded from .env file)
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  
  // Model Configuration
  model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
  maxTokens: parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS) || 4000,
  temperature: parseFloat(import.meta.env.VITE_OPENAI_TEMPERATURE) || 0.7,
  
  // Feature Flags
  enabled: import.meta.env.VITE_AI_ENABLED === 'true',
  autoGenerate: import.meta.env.VITE_AI_AUTO_GENERATE === 'true',
  
  // Rate Limiting
  maxRetries: 3,
  retryDelay: 1000, // milliseconds
  
  // Data Sampling (to reduce costs)
  maxDataRows: 100, // Send only first 100 rows to API
  maxColumns: 20,   // Send only first 20 columns
  
  // Cache Configuration
  cacheEnabled: true,
  cacheDuration: 1000 * 60 * 30, // 30 minutes
};

/**
 * Check if OpenAI is properly configured
 */
export const isOpenAIConfigured = () => {
  return OPENAI_CONFIG.enabled && 
         OPENAI_CONFIG.apiKey && 
         OPENAI_CONFIG.apiKey !== 'your_api_key_here_replace_this' &&
         OPENAI_CONFIG.apiKey.startsWith('sk-');
};

/**
 * Get configuration status message
 */
export const getConfigStatus = () => {
  if (!OPENAI_CONFIG.enabled) {
    return {
      configured: false,
      message: 'AI features are disabled in configuration'
    };
  }
  
  if (!OPENAI_CONFIG.apiKey || OPENAI_CONFIG.apiKey === 'your_api_key_here_replace_this') {
    return {
      configured: false,
      message: 'OpenAI API key is not set. Please add your API key in Settings.'
    };
  }
  
  if (!OPENAI_CONFIG.apiKey.startsWith('sk-')) {
    return {
      configured: false,
      message: 'Invalid OpenAI API key format. Key should start with "sk-"'
    };
  }
  
  return {
    configured: true,
    message: 'OpenAI is configured and ready'
  };
};

export default OPENAI_CONFIG;
