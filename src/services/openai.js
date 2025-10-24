/**
 * OpenAI Service
 * 
 * Handles all interactions with OpenAI API for AI-powered insights,
 * predictions, anomaly detection, and natural language processing.
 */

import OpenAI from 'openai';
import OPENAI_CONFIG, { isOpenAIConfigured } from '../config/openai.config';

// Initialize OpenAI client
let openaiClient = null;

/**
 * Initialize or get OpenAI client
 */
const getOpenAIClient = (apiKey = null) => {
  const key = apiKey || OPENAI_CONFIG.apiKey;
  
  if (!key || key === 'your_api_key_here_replace_this') {
    throw new Error('OpenAI API key is not configured. Please add your API key in Settings.');
  }
  
  if (!openaiClient || apiKey) {
    openaiClient = new OpenAI({
      apiKey: key,
      dangerouslyAllowBrowser: true // Required for browser usage
    });
  }
  
  return openaiClient;
};

/**
 * Retry logic with exponential backoff
 */
const retryWithBackoff = async (fn, retries = OPENAI_CONFIG.maxRetries) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      // Don't retry on authentication errors
      if (error.status === 401 || error.status === 403) {
        console.error('❌ Authentication error - not retrying');
        throw error;
      }
      
      // Don't retry on rate limit errors - let user handle it
      if (error.status === 429) {
        console.error('❌ Rate limit exceeded - not retrying automatically');
        throw error;
      }
      
      // Don't retry on client errors (4xx except 429)
      if (error.status >= 400 && error.status < 500) {
        console.error('❌ Client error - not retrying');
        throw error;
      }
      
      // Last retry, throw error
      if (i === retries - 1) {
        console.error(`❌ Max retries (${retries}) reached`);
        throw error;
      }
      
      // Only retry on server errors (5xx) or network issues
      const delay = OPENAI_CONFIG.retryDelay * Math.pow(2, i);
      console.log(`⚠️ Retry ${i + 1}/${retries} after ${delay}ms... (Error: ${error.status || 'Network'})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Prepare data for AI analysis (sample and format)
 */
const prepareDataForAI = (data, columns, maxRows = OPENAI_CONFIG.maxDataRows) => {
  if (!data || data.length === 0) {
    return { sample: [], statistics: {}, columns: [] };
  }
  
  // Sample data to reduce token usage
  const sample = data.slice(0, Math.min(maxRows, data.length));
  
  // Generate statistics
  const statistics = {
    totalRows: data.length,
    sampleSize: sample.length,
    columnCount: columns.length,
    columnTypes: columns.reduce((acc, col) => {
      acc[col.type] = (acc[col.type] || 0) + 1;
      return acc;
    }, {}),
    columns: columns.map(col => ({
      name: col.name,
      type: col.type,
      sampleValues: sample.slice(0, 5).map(row => row[col.name])
    }))
  };
  
  return {
    sample,
    statistics,
    columns: columns.map(c => ({ name: c.name, type: c.type }))
  };
};

/**
 * Rate limiting tracker
 */
let lastApiCallTime = 0;
const MIN_TIME_BETWEEN_CALLS = 2000; // 2 seconds minimum between calls

/**
 * Check if we can make an API call (rate limit check)
 */
const canMakeApiCall = () => {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCallTime;
  
  if (timeSinceLastCall < MIN_TIME_BETWEEN_CALLS) {
    const waitTime = Math.ceil((MIN_TIME_BETWEEN_CALLS - timeSinceLastCall) / 1000);
    throw new Error(`Please wait ${waitTime} seconds before making another request to avoid rate limits.`);
  }
  
  lastApiCallTime = now;
  return true;
};

/**
 * Analyze CSV data and generate comprehensive insights
 */
export const analyzeData = async (csvData, columns, apiKey = null) => {
  console.log('🤖 Starting AI data analysis...');
  
  // Check rate limit before proceeding
  canMakeApiCall();
  
  if (!csvData || csvData.length === 0) {
    throw new Error('No data to analyze');
  }
  
  if (!columns || columns.length === 0) {
    throw new Error('No columns information provided');
  }
  
  // Prepare data
  const prepared = prepareDataForAI(csvData, columns);
  
  // Build prompt
  const prompt = `You are a data analyst expert. Analyze this dataset and provide comprehensive insights.

DATA OVERVIEW:
- Total Rows: ${prepared.statistics.totalRows}
- Columns: ${prepared.statistics.columnCount}
- Column Types: ${JSON.stringify(prepared.statistics.columnTypes)}

COLUMNS:
${prepared.columns.map(col => `- ${col.name} (${col.type})`).join('\n')}

SAMPLE DATA (first ${prepared.sample.length} rows):
${JSON.stringify(prepared.sample.slice(0, 10), null, 2)}

Please provide:
1. **Key Insights**: 4-6 important observations about the data (trends, patterns, notable values)
2. **Recommendations**: 3-5 actionable recommendations based on the data
3. **Predictions**: Any trends or forecasts you can identify
4. **Anomalies**: Any unusual patterns or outliers
5. **Data Quality**: Assessment of data completeness and quality

Format your response as JSON with this structure:
{
  "insights": [
    {
      "type": "positive" | "warning" | "negative" | "neutral",
      "category": "sales" | "performance" | "user_behavior" | "general",
      "title": "Brief title",
      "description": "Detailed explanation",
      "confidence": 0-100,
      "dataPoints": ["specific data point 1", "specific data point 2"]
    }
  ],
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "action": "What to do",
      "reason": "Why to do it",
      "impact": "Expected outcome"
    }
  ],
  "predictions": {
    "trend": "up" | "down" | "stable",
    "forecast": "Brief forecast summary",
    "confidence": 0-100
  },
  "anomalies": [
    {
      "column": "column name",
      "description": "What's unusual",
      "severity": "high" | "medium" | "low"
    }
  ],
  "dataQuality": {
    "score": 0-100,
    "issues": ["issue 1", "issue 2"],
    "completeness": 0-100
  }
}`;

  try {
    const client = getOpenAIClient(apiKey);
    
    console.log('📤 Sending request to OpenAI...');
    
    const response = await retryWithBackoff(async () => {
      return await client.chat.completions.create({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert data analyst specializing in business intelligence and data insights. Provide clear, actionable insights in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: OPENAI_CONFIG.temperature,
        max_tokens: OPENAI_CONFIG.maxTokens,
      });
    });
    
    console.log('✅ Received response from OpenAI');
    
    // Parse response
    const content = response.choices[0].message.content;
    const analysis = JSON.parse(content);
    
    // Add IDs and timestamps
    if (analysis.insights) {
      analysis.insights = analysis.insights.map((insight, index) => ({
        id: `insight_${Date.now()}_${index}`,
        ...insight,
        timestamp: new Date().toISOString()
      }));
    }
    
    if (analysis.anomalies) {
      analysis.anomalies = analysis.anomalies.map((anomaly, index) => ({
        id: `anomaly_${Date.now()}_${index}`,
        ...anomaly,
        timestamp: new Date().toISOString()
      }));
    }
    
    console.log(`🎉 Analysis complete! Generated ${analysis.insights?.length || 0} insights`);
    
    return {
      success: true,
      data: analysis,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      }
    };
    
  } catch (error) {
    console.error('❌ Error analyzing data:', error);
    
    // Handle specific errors
    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your configuration.');
    }
    
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a few moments.');
    }
    
    if (error.status === 500 || error.status === 503) {
      throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
    }
    
    throw new Error(error.message || 'Failed to analyze data with AI');
  }
};

/**
 * Generate AI-powered chart suggestions
 */
export const suggestChartWithAI = async (csvData, columns, apiKey = null) => {
  console.log('📊 Generating AI chart suggestions...');
  
  if (!csvData || csvData.length === 0 || !columns || columns.length === 0) {
    throw new Error('No data or columns provided');
  }
  
  const prepared = prepareDataForAI(csvData, columns, 50);
  
  const prompt = `You are a data visualization expert. Suggest the best chart types for this dataset.

COLUMNS:
${prepared.columns.map(col => `- ${col.name} (${col.type})`).join('\n')}

SAMPLE DATA:
${JSON.stringify(prepared.sample.slice(0, 5), null, 2)}

Suggest 3 different chart configurations that would best visualize this data.

Format as JSON:
{
  "suggestions": [
    {
      "chartType": "bar" | "line" | "pie" | "scatter",
      "xColumn": "column name",
      "yColumn": "column name",
      "categoryColumn": "for pie charts",
      "valueColumn": "for pie charts",
      "aggregation": "sum" | "avg" | "count" | "min" | "max",
      "title": "Suggested chart title",
      "reasoning": "Why this chart is recommended",
      "confidence": 0-100,
      "insights": ["insight 1", "insight 2"]
    }
  ]
}`;

  try {
    const client = getOpenAIClient(apiKey);
    
    const response = await retryWithBackoff(async () => {
      return await client.chat.completions.create({
        model: OPENAI_CONFIG.model,
        messages: [
          { role: 'system', content: 'You are a data visualization expert. Provide chart suggestions in JSON format.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000,
      });
    });
    
    const content = response.choices[0].message.content;
    const suggestions = JSON.parse(content);
    
    console.log(`✅ Generated ${suggestions.suggestions?.length || 0} chart suggestions`);
    
    // Return both a top-level `suggestions` array and the full `data` object
    // so callers that expect `result.suggestions` (ChartConfigurator) or
    // `result.data` (other callers) will both work.
    return {
      success: true,
      suggestions: suggestions.suggestions || [],
      data: suggestions,
      usage: response.usage
    };
    
  } catch (error) {
    console.error('❌ Error generating chart suggestions:', error);
    throw new Error(error.message || 'Failed to generate chart suggestions');
  }
};

/**
 * Answer natural language questions about the data
 */
export const answerQuestion = async (question, csvData, columns, apiKey = null) => {
  console.log(`💬 Answering question: "${question}"`);
  
  if (!question || question.trim().length === 0) {
    throw new Error('No question provided');
  }
  
  if (!csvData || csvData.length === 0) {
    throw new Error('No data available to answer questions');
  }
  
  const prepared = prepareDataForAI(csvData, columns, 50);
  
  const prompt = `You are a helpful data analyst. Answer this question about the dataset.

QUESTION: ${question}

DATASET INFO:
- Rows: ${prepared.statistics.totalRows}
- Columns: ${prepared.columns.map(c => c.name).join(', ')}

SAMPLE DATA:
${JSON.stringify(prepared.sample.slice(0, 10), null, 2)}

Provide a clear, concise answer based on the data. Include specific numbers and examples where relevant.`;

  try {
    const client = getOpenAIClient(apiKey);
    
    const response = await retryWithBackoff(async () => {
      return await client.chat.completions.create({
        model: OPENAI_CONFIG.model,
        messages: [
          { role: 'system', content: 'You are a helpful data analyst who answers questions clearly and accurately based on data.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });
    });
    
    const answer = response.choices[0].message.content;
    
    console.log('✅ Question answered');
    
    return {
      success: true,
      answer,
      usage: response.usage
    };
    
  } catch (error) {
    console.error('❌ Error answering question:', error);
    throw new Error(error.message || 'Failed to answer question');
  }
};



/**
 * Export service functions
 */
export default {
  analyzeData,
  suggestChartWithAI,
  answerQuestion,
  isConfigured: isOpenAIConfigured
};
