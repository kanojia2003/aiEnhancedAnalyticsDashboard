/**
 * Chart Helpers Utility
 * 
 * This utility provides functions to transform CSV data into chart-ready formats
 * for use with Recharts library. It handles data aggregation, grouping, and
 * formatting based on column types.
 * 
 * Supported chart types:
 * - Bar Chart: Categorical X-axis, Numeric Y-axis
 * - Line Chart: Time-series or sequential data
 * - Pie Chart: Category distribution
 * - Scatter Plot: Two numeric variables correlation
 */

/**
 * Prepare data for Bar Chart
 * Groups data by a categorical column and aggregates numeric values
 * 
 * @param {Array} data - Array of data objects
 * @param {String} xColumn - Column name for X-axis (categorical)
 * @param {String} yColumn - Column name for Y-axis (numeric)
 * @param {String} aggregation - Aggregation method: 'sum', 'avg', 'count', 'min', 'max'
 * @returns {Array} - Array of objects formatted for Recharts BarChart
 * 
 * Example output:
 * [
 *   { name: 'Category A', value: 1500, count: 10 },
 *   { name: 'Category B', value: 2300, count: 15 }
 * ]
 */
export const prepareBarChartData = (data, xColumn, yColumn, aggregation = 'sum') => {
  if (!data || data.length === 0) return []
  if (!xColumn || !yColumn) return []

  console.log(`📊 Preparing Bar Chart: ${xColumn} vs ${yColumn} (${aggregation})`)

  // Group data by X column
  const grouped = data.reduce((acc, row) => {
    const xValue = row[xColumn]
    const yValue = parseFloat(row[yColumn])

    // Skip if either value is null/undefined
    if (xValue === null || xValue === undefined || isNaN(yValue)) {
      return acc
    }

    // Initialize group if doesn't exist
    if (!acc[xValue]) {
      acc[xValue] = {
        name: String(xValue),
        values: [],
        count: 0
      }
    }

    // Add value to group
    acc[xValue].values.push(yValue)
    acc[xValue].count++

    return acc
  }, {})

  // Apply aggregation and format for Recharts
  const result = Object.values(grouped).map(group => {
    let aggregatedValue

    switch (aggregation.toLowerCase()) {
      case 'sum':
        aggregatedValue = group.values.reduce((sum, val) => sum + val, 0)
        break
      
      case 'avg':
      case 'average':
        const sum = group.values.reduce((sum, val) => sum + val, 0)
        aggregatedValue = sum / group.values.length
        break
      
      case 'count':
        aggregatedValue = group.count
        break
      
      case 'min':
        aggregatedValue = Math.min(...group.values)
        break
      
      case 'max':
        aggregatedValue = Math.max(...group.values)
        break
      
      default:
        aggregatedValue = group.values.reduce((sum, val) => sum + val, 0)
    }

    return {
      name: group.name,
      value: Math.round(aggregatedValue * 100) / 100, // Round to 2 decimals
      count: group.count,
      min: Math.min(...group.values),
      max: Math.max(...group.values)
    }
  })

  // Sort by value descending for better visualization
  result.sort((a, b) => b.value - a.value)

  console.log(`✅ Bar Chart data prepared: ${result.length} categories`)
  return result
}

/**
 * Prepare data for Line Chart
 * Typically used for time-series data or sequential numeric data
 * 
 * @param {Array} data - Array of data objects
 * @param {String} xColumn - Column name for X-axis (date or sequential)
 * @param {String} yColumn - Column name for Y-axis (numeric)
 * @param {String} aggregation - Aggregation method if duplicate X values exist
 * @returns {Array} - Array of objects formatted for Recharts LineChart
 * 
 * Example output:
 * [
 *   { name: '2023-01', value: 1500 },
 *   { name: '2023-02', value: 1800 }
 * ]
 */
export const prepareLineChartData = (data, xColumn, yColumn, aggregation = 'avg') => {
  if (!data || data.length === 0) return []
  if (!xColumn || !yColumn) return []

  console.log(`📈 Preparing Line Chart: ${xColumn} vs ${yColumn}`)

  // Group by X column (might be dates or categories)
  const grouped = data.reduce((acc, row) => {
    let xValue = row[xColumn]
    const yValue = parseFloat(row[yColumn])

    // Skip if either value is null/undefined
    if (xValue === null || xValue === undefined || isNaN(yValue)) {
      return acc
    }

    // Convert date objects to string if needed
    if (xValue instanceof Date) {
      xValue = xValue.toISOString().split('T')[0]
    }

    // Initialize group if doesn't exist
    if (!acc[xValue]) {
      acc[xValue] = {
        name: String(xValue),
        values: [],
        date: xValue
      }
    }

    acc[xValue].values.push(yValue)
    return acc
  }, {})

  // Apply aggregation
  const result = Object.values(grouped).map(group => {
    let aggregatedValue

    if (group.values.length === 1) {
      aggregatedValue = group.values[0]
    } else {
      switch (aggregation.toLowerCase()) {
        case 'sum':
          aggregatedValue = group.values.reduce((sum, val) => sum + val, 0)
          break
        case 'avg':
        case 'average':
          const sum = group.values.reduce((sum, val) => sum + val, 0)
          aggregatedValue = sum / group.values.length
          break
        case 'min':
          aggregatedValue = Math.min(...group.values)
          break
        case 'max':
          aggregatedValue = Math.max(...group.values)
          break
        default:
          aggregatedValue = group.values.reduce((sum, val) => sum + val, 0) / group.values.length
      }
    }

    return {
      name: group.name,
      value: Math.round(aggregatedValue * 100) / 100,
      date: group.date
    }
  })

  // Sort by date/name for chronological order
  result.sort((a, b) => {
    // Try to parse as dates first
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    
    if (!isNaN(dateA) && !isNaN(dateB)) {
      return dateA - dateB
    }
    
    // If not dates, sort alphabetically
    return String(a.name).localeCompare(String(b.name))
  })

  console.log(`✅ Line Chart data prepared: ${result.length} points`)
  return result
}

/**
 * Prepare data for Pie Chart
 * Shows distribution of a categorical variable
 * 
 * @param {Array} data - Array of data objects
 * @param {String} categoryColumn - Column name for categories
 * @param {String} valueColumn - Column name for values (optional, uses count if not provided)
 * @param {Number} topN - Show only top N categories (default: all)
 * @returns {Array} - Array of objects formatted for Recharts PieChart
 * 
 * Example output:
 * [
 *   { name: 'Category A', value: 1500 },
 *   { name: 'Category B', value: 2300 }
 * ]
 */
export const preparePieChartData = (data, categoryColumn, valueColumn = null, topN = null) => {
  if (!data || data.length === 0) return []
  if (!categoryColumn) return []

  console.log(`🥧 Preparing Pie Chart: ${categoryColumn}${valueColumn ? ` weighted by ${valueColumn}` : ' (count)'}`)

  // Group and aggregate
  const grouped = data.reduce((acc, row) => {
    const category = row[categoryColumn]

    // Skip null/undefined categories
    if (category === null || category === undefined) {
      return acc
    }

    const categoryStr = String(category)

    if (!acc[categoryStr]) {
      acc[categoryStr] = {
        name: categoryStr,
        count: 0,
        sum: 0
      }
    }

    acc[categoryStr].count++

    // If value column provided, sum the values
    if (valueColumn) {
      const value = parseFloat(row[valueColumn])
      if (!isNaN(value)) {
        acc[categoryStr].sum += value
      }
    }

    return acc
  }, {})

  // Format for Recharts
  let result = Object.values(grouped).map(group => ({
    name: group.name,
    value: valueColumn ? Math.round(group.sum * 100) / 100 : group.count
  }))

  // Sort by value descending
  result.sort((a, b) => b.value - a.value)

  // Limit to top N if specified
  if (topN && topN > 0 && result.length > topN) {
    const topCategories = result.slice(0, topN)
    const others = result.slice(topN)
    const othersSum = others.reduce((sum, item) => sum + item.value, 0)
    
    result = [
      ...topCategories,
      { name: 'Others', value: Math.round(othersSum * 100) / 100 }
    ]
  }

  console.log(`✅ Pie Chart data prepared: ${result.length} categories`)
  return result
}

/**
 * Prepare data for Scatter Plot
 * Shows correlation between two numeric variables
 * 
 * @param {Array} data - Array of data objects
 * @param {String} xColumn - Column name for X-axis (numeric)
 * @param {String} yColumn - Column name for Y-axis (numeric)
 * @param {String} nameColumn - Optional column for point labels
 * @returns {Array} - Array of objects formatted for Recharts ScatterChart
 * 
 * Example output:
 * [
 *   { x: 25, y: 50000, name: 'Point 1' },
 *   { x: 30, y: 60000, name: 'Point 2' }
 * ]
 */
export const prepareScatterData = (data, xColumn, yColumn, nameColumn = null) => {
  if (!data || data.length === 0) return []
  if (!xColumn || !yColumn) return []

  console.log(`📍 Preparing Scatter Plot: ${xColumn} vs ${yColumn}`)

  const result = data
    .map((row, index) => {
      const xValue = parseFloat(row[xColumn])
      const yValue = parseFloat(row[yColumn])

      // Skip if either value is not numeric
      if (isNaN(xValue) || isNaN(yValue)) {
        return null
      }

      return {
        x: xValue,
        y: yValue,
        name: nameColumn ? String(row[nameColumn]) : `Point ${index + 1}`
      }
    })
    .filter(point => point !== null) // Remove invalid points

  console.log(`✅ Scatter Plot data prepared: ${result.length} points`)
  return result
}

/**
 * Auto-suggest best chart type based on column types
 * 
 * @param {Array} columns - Array of column metadata from inferColumnTypes
 * @param {String} xColumn - Selected X column (optional)
 * @param {String} yColumn - Selected Y column (optional)
 * @returns {Object} - Suggested chart configuration
 * 
 * Example output:
 * {
 *   chartType: 'bar',
 *   reason: 'X is categorical, Y is numeric',
 *   xColumn: 'Category',
 *   yColumn: 'Sales',
 *   aggregation: 'sum'
 * }
 */
export const suggestChartType = (columns, xColumn = null, yColumn = null) => {
  if (!columns || columns.length === 0) {
    return {
      chartType: null,
      reason: 'No columns available',
      xColumn: null,
      yColumn: null
    }
  }

  // Find column types
  const getColumnType = (colName) => {
    const col = columns.find(c => c.name === colName)
    return col ? col.type : null
  }

  // If both columns provided, suggest based on their types
  if (xColumn && yColumn) {
    const xType = getColumnType(xColumn)
    const yType = getColumnType(yColumn)

    console.log(`🤖 Analyzing: ${xColumn} (${xType}) vs ${yColumn} (${yType})`)

    // Both numeric → Scatter plot
    if (xType === 'number' && yType === 'number') {
      return {
        chartType: 'scatter',
        reason: 'Both columns are numeric - best for correlation analysis',
        xColumn,
        yColumn,
        aggregation: null
      }
    }

    // X is date, Y is numeric → Line chart
    if (xType === 'date' && yType === 'number') {
      return {
        chartType: 'line',
        reason: 'Time-series data - best for trend analysis',
        xColumn,
        yColumn,
        aggregation: 'avg'
      }
    }

    // X is category, Y is numeric → Bar chart
    if ((xType === 'category' || xType === 'string' || xType === 'boolean') && yType === 'number') {
      return {
        chartType: 'bar',
        reason: 'Categorical X and numeric Y - best for comparison',
        xColumn,
        yColumn,
        aggregation: 'sum'
      }
    }

    // X is category, no Y or Y is category → Pie chart
    if ((xType === 'category' || xType === 'string') && (!yColumn || yType === 'category' || yType === 'string')) {
      return {
        chartType: 'pie',
        reason: 'Categorical data - best for distribution',
        categoryColumn: xColumn,
        valueColumn: null
      }
    }
  }

  // If only one column provided or no columns provided, make smart suggestions
  const numericCols = columns.filter(c => c.type === 'number')
  const categoryCols = columns.filter(c => c.type === 'category' || c.type === 'string')
  const dateCols = columns.filter(c => c.type === 'date')

  // Suggest based on available column types
  if (dateCols.length > 0 && numericCols.length > 0) {
    return {
      chartType: 'line',
      reason: 'Date and numeric columns found - time-series analysis recommended',
      xColumn: dateCols[0].name,
      yColumn: numericCols[0].name,
      aggregation: 'avg'
    }
  }

  if (categoryCols.length > 0 && numericCols.length > 0) {
    return {
      chartType: 'bar',
      reason: 'Category and numeric columns found - comparison recommended',
      xColumn: categoryCols[0].name,
      yColumn: numericCols[0].name,
      aggregation: 'sum'
    }
  }

  if (numericCols.length >= 2) {
    return {
      chartType: 'scatter',
      reason: 'Multiple numeric columns found - correlation analysis recommended',
      xColumn: numericCols[0].name,
      yColumn: numericCols[1].name,
      aggregation: null
    }
  }

  if (categoryCols.length > 0) {
    return {
      chartType: 'pie',
      reason: 'Categorical columns found - distribution recommended',
      categoryColumn: categoryCols[0].name,
      valueColumn: null
    }
  }

  return {
    chartType: null,
    reason: 'Unable to suggest chart type - insufficient data',
    xColumn: null,
    yColumn: null
  }
}

/**
 * Aggregate data by grouping column
 * 
 * @param {Array} data - Array of data objects
 * @param {String} groupByColumn - Column to group by
 * @param {String} valueColumn - Column to aggregate
 * @param {String} operation - Aggregation operation: 'sum', 'avg', 'count', 'min', 'max'
 * @returns {Array} - Aggregated data
 */
export const aggregateData = (data, groupByColumn, valueColumn, operation = 'sum') => {
  if (!data || data.length === 0) return []
  if (!groupByColumn) return []

  console.log(`🔢 Aggregating: ${valueColumn} by ${groupByColumn} (${operation})`)

  const grouped = data.reduce((acc, row) => {
    const groupKey = String(row[groupByColumn] || 'null')
    
    if (!acc[groupKey]) {
      acc[groupKey] = {
        [groupByColumn]: row[groupByColumn],
        values: []
      }
    }

    if (valueColumn) {
      const value = parseFloat(row[valueColumn])
      if (!isNaN(value)) {
        acc[groupKey].values.push(value)
      }
    } else {
      acc[groupKey].values.push(1) // For counting
    }

    return acc
  }, {})

  const result = Object.values(grouped).map(group => {
    let aggregatedValue

    switch (operation.toLowerCase()) {
      case 'sum':
        aggregatedValue = group.values.reduce((sum, val) => sum + val, 0)
        break
      case 'avg':
      case 'average':
        const sum = group.values.reduce((sum, val) => sum + val, 0)
        aggregatedValue = sum / group.values.length
        break
      case 'count':
        aggregatedValue = group.values.length
        break
      case 'min':
        aggregatedValue = Math.min(...group.values)
        break
      case 'max':
        aggregatedValue = Math.max(...group.values)
        break
      default:
        aggregatedValue = group.values.reduce((sum, val) => sum + val, 0)
    }

    return {
      [groupByColumn]: group[groupByColumn],
      [valueColumn || 'count']: Math.round(aggregatedValue * 100) / 100,
      _count: group.values.length
    }
  })

  console.log(`✅ Aggregated to ${result.length} groups`)
  return result
}

/**
 * Get numeric columns from data
 * 
 * @param {Array} columns - Column metadata
 * @returns {Array} - Array of numeric column names
 */
export const getNumericColumns = (columns) => {
  return columns
    .filter(col => col.type === 'number')
    .map(col => col.name)
}

/**
 * Get categorical columns from data
 * 
 * @param {Array} columns - Column metadata
 * @returns {Array} - Array of categorical column names
 */
export const getCategoricalColumns = (columns) => {
  return columns
    .filter(col => col.type === 'category' || col.type === 'string' || col.type === 'boolean')
    .map(col => col.name)
}

/**
 * Get date columns from data
 * 
 * @param {Array} columns - Column metadata
 * @returns {Array} - Array of date column names
 */
export const getDateColumns = (columns) => {
  return columns
    .filter(col => col.type === 'date')
    .map(col => col.name)
}

/**
 * Validate chart configuration
 * 
 * @param {Object} config - Chart configuration with chartType
 * @param {Array} columns - Column names array or column metadata
 * @returns {Object} - Validation result { isValid: boolean, error: string }
 */
export const validateChartConfig = (config, columns) => {
  if (!config) {
    return { isValid: false, error: 'Configuration is required' }
  }

  if (!config.chartType) {
    return { isValid: false, error: 'Chart type is required' }
  }

  if (!columns || columns.length === 0) {
    return { isValid: false, error: 'No columns available' }
  }

  // Handle both array of strings and array of objects
  const columnNames = Array.isArray(columns)
    ? columns.map(c => typeof c === 'string' ? c : c.name)
    : []

  const chartType = config.chartType

  switch (chartType) {
    case 'bar':
    case 'line':
      if (!config.xColumn) {
        return { isValid: false, error: 'X-axis column is required' }
      }
      if (!config.yColumn) {
        return { isValid: false, error: 'Y-axis column is required' }
      }
      if (!columnNames.includes(config.xColumn)) {
        return { isValid: false, error: `Column "${config.xColumn}" not found` }
      }
      if (!columnNames.includes(config.yColumn)) {
        return { isValid: false, error: `Column "${config.yColumn}" not found` }
      }
      break

    case 'pie':
      if (!config.categoryColumn) {
        return { isValid: false, error: 'Category column is required' }
      }
      if (!columnNames.includes(config.categoryColumn)) {
        return { isValid: false, error: `Column "${config.categoryColumn}" not found` }
      }
      if (config.valueColumn && !columnNames.includes(config.valueColumn)) {
        return { isValid: false, error: `Column "${config.valueColumn}" not found` }
      }
      break

    case 'scatter':
      if (!config.xColumn) {
        return { isValid: false, error: 'X-axis column is required' }
      }
      if (!config.yColumn) {
        return { isValid: false, error: 'Y-axis column is required' }
      }
      if (!columnNames.includes(config.xColumn)) {
        return { isValid: false, error: `Column "${config.xColumn}" not found` }
      }
      if (!columnNames.includes(config.yColumn)) {
        return { isValid: false, error: `Column "${config.yColumn}" not found` }
      }
      break

    default:
      return { isValid: false, error: `Unknown chart type: ${chartType}` }
  }

  return { isValid: true, error: null }
}

/**
 * Export all chart helper functions
 */
export default {
  prepareBarChartData,
  prepareLineChartData,
  preparePieChartData,
  prepareScatterData,
  suggestChartType,
  aggregateData,
  getNumericColumns,
  getCategoricalColumns,
  getDateColumns,
  validateChartConfig
}
