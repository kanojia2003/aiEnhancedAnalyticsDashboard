import { useMemo } from 'react';
import {
  prepareBarChartData,
  prepareLineChartData,
  preparePieChartData,
  prepareScatterData,
  validateChartConfig,
} from '../utils/chartHelpers';

/**
 * Custom hook for memoized chart data transformation
 * Prevents unnecessary recalculations when data or config hasn't changed
 * 
 * @param {Array} data - Raw CSV data array
 * @param {Object} config - Chart configuration
 * @param {string} config.chartType - Type of chart ('bar', 'line', 'pie', 'scatter')
 * @param {string} config.xColumn - X-axis column name
 * @param {string} config.yColumn - Y-axis column name (not used for pie charts)
 * @param {string} config.categoryColumn - Category column for pie charts
 * @param {string} config.valueColumn - Value column for pie charts
 * @param {string} config.nameColumn - Name column for scatter plots (optional)
 * @param {string} config.aggregation - Aggregation method ('sum', 'avg', 'count', 'min', 'max')
 * @param {number} config.topN - Number of top items to show (for pie charts)
 * @returns {Object} { chartData, isValid, error }
 */
export const useChartData = (data, config) => {
  // Memoize validation result
  const validation = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        isValid: false,
        error: 'No data available',
      };
    }

    if (!config || !config.chartType) {
      return {
        isValid: false,
        error: 'Chart configuration is incomplete',
      };
    }

    // Get all column names from data
    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    // Validate configuration
    return validateChartConfig(config, columns);
  }, [data, config]);

  // Memoize chart data transformation
  const chartData = useMemo(() => {
    if (!validation.isValid) {
      return [];
    }

    try {
      const { chartType } = config;

      switch (chartType) {
        case 'bar': {
          const { xColumn, yColumn, aggregation = 'sum' } = config;
          return prepareBarChartData(data, xColumn, yColumn, aggregation);
        }

        case 'line': {
          const { xColumn, yColumn, aggregation = 'sum' } = config;
          return prepareLineChartData(data, xColumn, yColumn, aggregation);
        }

        case 'pie': {
          const { categoryColumn, valueColumn, topN = 10 } = config;
          return preparePieChartData(data, categoryColumn, valueColumn, topN);
        }

        case 'scatter': {
          const { xColumn, yColumn, nameColumn } = config;
          return prepareScatterData(data, xColumn, yColumn, nameColumn);
        }

        default:
          return [];
      }
    } catch (error) {
      console.error('Error preparing chart data:', error);
      return [];
    }
  }, [data, config, validation.isValid]);

  // Memoize statistics about the chart data
  const stats = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return null;
    }

    const { chartType } = config;

    switch (chartType) {
      case 'bar':
      case 'line': {
        const values = chartData.map(item => item.value);
        return {
          total: values.reduce((sum, val) => sum + val, 0),
          average: values.reduce((sum, val) => sum + val, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          dataPoints: chartData.length,
        };
      }

      case 'pie': {
        const values = chartData.map(item => item.value);
        return {
          total: values.reduce((sum, val) => sum + val, 0),
          categories: chartData.length,
          largest: Math.max(...values),
          smallest: Math.min(...values),
        };
      }

      case 'scatter': {
        const xValues = chartData.map(item => item.x);
        const yValues = chartData.map(item => item.y);
        return {
          xMin: Math.min(...xValues),
          xMax: Math.max(...xValues),
          yMin: Math.min(...yValues),
          yMax: Math.max(...yValues),
          dataPoints: chartData.length,
        };
      }

      default:
        return null;
    }
  }, [chartData, config]);

  return {
    chartData,
    isValid: validation.isValid,
    error: validation.error,
    stats,
  };
};

/**
 * Hook for managing multiple chart configurations
 * Useful for dashboard pages with multiple charts
 * 
 * @param {Array} data - Raw CSV data array
 * @param {Array} configs - Array of chart configurations
 * @returns {Array} Array of { chartData, isValid, error, stats, config }
 */
export const useMultipleCharts = (data, configs) => {
  return useMemo(() => {
    if (!configs || configs.length === 0) {
      return [];
    }

    return configs.map(config => {
      const result = useChartData(data, config);
      return {
        ...result,
        config,
      };
    });
  }, [data, configs]);
};

export default useChartData;
