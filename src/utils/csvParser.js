import Papa from 'papaparse'

/**
 * Parse CSV file to JSON format
 * 
 * @param {File} file - The CSV file object from input/drag-drop
 * @returns {Promise} - Resolves with parsed data object containing:
 *                      - data: Array of parsed rows as objects
 *                      - errors: Array of parsing errors
 *                      - meta: Metadata about parsing (delimiter, linebreak, etc.)
 * 
 * Example usage:
 *   const result = await parseCSVFile(file)
 *   console.log(result.data) // [{ name: 'John', age: 25 }, ...]
 */
export const parseCSVFile = (file) => {
  // Return a Promise to handle async file reading
  return new Promise((resolve, reject) => {
    // PapaParse.parse() reads and parses the CSV file
    Papa.parse(file, {
      // Configuration options:
      
      // header: true means first row becomes object keys
      // Example: If row 1 is "Name,Age" then each data row becomes { Name: 'John', Age: 25 }
      // If false, you get arrays: [['Name', 'Age'], ['John', 25]]
      header: true,
      
      // dynamicTyping: true automatically converts strings to appropriate types
      // "25" → 25 (number)
      // "true" → true (boolean)
      // "2023-01-01" → remains string (dates need manual handling)
      dynamicTyping: true,
      
      // skipEmptyLines: true removes rows that are completely empty
      // Useful for CSVs with trailing newlines or blank rows
      skipEmptyLines: true,
      
      // transformHeader: function to clean/modify header names
      // Here we trim whitespace: " Name " → "Name"
      // You could also use this to: lowercase, remove special chars, etc.
      transformHeader: (header) => header.trim(),
      
      // complete: callback when parsing finishes successfully
      // 'results' object contains: { data, errors, meta }
      complete: (results) => {
        // Check if there were any parsing errors
        if (results.errors.length > 0) {
          // If errors exist, reject with error details
          reject({
            message: 'CSV parsing encountered errors',
            errors: results.errors
          })
        } else {
          // If successful, resolve with the complete results object
          resolve(results)
        }
      },
      
      // error: callback if parsing fails catastrophically
      // This catches file read errors, encoding issues, etc.
      error: (error) => {
        reject({
          message: 'Failed to parse CSV file',
          error: error.message
        })
      }
    })
  })
}

/**
 * Validate CSV structure and data quality
 * 
 * @param {Array} data - Parsed CSV data (array of objects)
 * @returns {Object} - Validation result with:
 *                     - valid: boolean indicating if data is valid
 *                     - message: error message if invalid
 *                     - warnings: array of non-critical issues
 * 
 * Checks performed:
 * 1. Data exists and is an array
 * 2. Data has at least one row
 * 3. All rows have consistent structure (same keys)
 * 4. Headers exist and are non-empty
 * 5. No completely empty rows
 */
export const validateCSV = (data) => {
  // Initialize validation result object
  const result = {
    valid: true,
    message: '',
    warnings: []
  }

  // Check 1: Verify data exists and is an array
  if (!data || !Array.isArray(data)) {
    return {
      valid: false,
      message: 'Invalid data format. Expected an array of objects.',
      warnings: []
    }
  }

  // Check 2: Verify data has at least one row
  // Minimum 1 row required for meaningful analysis
  if (data.length === 0) {
    return {
      valid: false,
      message: 'CSV file is empty. Please upload a file with data.',
      warnings: []
    }
  }

  // Check 3: Verify all rows have data (not just headers)
  // Get column names from the first row
  const columns = Object.keys(data[0])
  
  // Verify we have at least one column
  if (columns.length === 0) {
    return {
      valid: false,
      message: 'No columns found in CSV file.',
      warnings: []
    }
  }

  // Check 4: Verify column names are not empty
  const emptyHeaders = columns.filter(col => !col || col.trim() === '')
  if (emptyHeaders.length > 0) {
    return {
      valid: false,
      message: 'CSV contains empty column headers. Please ensure all columns have names.',
      warnings: []
    }
  }

  // Check 5: Verify data structure consistency
  // All rows should have the same columns (keys)
  const firstRowKeys = columns.sort()
  let inconsistentRows = 0
  
  data.forEach((row, index) => {
    const rowKeys = Object.keys(row).sort()
    
    // Compare current row's keys with first row's keys
    if (JSON.stringify(rowKeys) !== JSON.stringify(firstRowKeys)) {
      inconsistentRows++
      
      // Add warning for first few inconsistent rows
      if (inconsistentRows <= 3) {
        result.warnings.push(
          `Row ${index + 1} has different columns than the header row`
        )
      }
    }
  })

  // If more than 10% of rows are inconsistent, consider it invalid
  if (inconsistentRows > data.length * 0.1) {
    return {
      valid: false,
      message: `Too many inconsistent rows (${inconsistentRows}/${data.length}). Please check your CSV structure.`,
      warnings: result.warnings
    }
  }

  // Check 6: Count rows with all empty values
  let emptyRows = 0
  data.forEach((row, index) => {
    // Check if all values in the row are null, undefined, or empty string
    const allEmpty = Object.values(row).every(value => 
      value === null || value === undefined || value === ''
    )
    
    if (allEmpty) {
      emptyRows++
      if (emptyRows <= 3) {
        result.warnings.push(`Row ${index + 1} contains all empty values`)
      }
    }
  })

  // If more than 20% rows are empty, add warning
  if (emptyRows > data.length * 0.2) {
    result.warnings.push(
      `${emptyRows} rows (${((emptyRows/data.length)*100).toFixed(1)}%) contain all empty values`
    )
  }

  // Check 7: Warn if dataset is very small
  if (data.length < 5) {
    result.warnings.push(
      'Dataset is very small (less than 5 rows). Analysis may be limited.'
    )
  }

  // Check 8: Warn if dataset is very large
  if (data.length > 10000) {
    result.warnings.push(
      `Large dataset detected (${data.length} rows). Processing may take longer.`
    )
  }

  // Return validation result
  return result
}

/**
 * Infer data types for each column
 * 
 * @param {Array} data - Parsed CSV data (array of objects)
 * @param {Number} sampleSize - Number of rows to sample for type inference (default: 100)
 * @returns {Array} - Array of column objects with:
 *                    - name: column name
 *                    - type: inferred type ('number', 'date', 'boolean', 'string')
 *                    - nullable: whether column contains null/undefined values
 *                    - uniqueCount: number of unique values
 * 
 * Type inference logic:
 * 1. Check if all non-null values are numbers → 'number'
 * 2. Check if all non-null values are valid dates → 'date'
 * 3. Check if all non-null values are booleans → 'boolean'
 * 4. Otherwise → 'string'
 */
export const inferColumnTypes = (data) => {
  // Return empty array if no data
  if (!data || data.length === 0) {
    return []
  }

  // Get column names from first row
  const columns = Object.keys(data[0])
  
  // Determine sample size (use smaller of: 100 rows or total rows)
  const sampleSize = Math.min(100, data.length)
  
  // Sample rows for analysis (first N rows)
  const sample = data.slice(0, sampleSize)

  // Analyze each column
  return columns.map(columnName => {
    // Extract all values for this column from sample
    const values = sample.map(row => row[columnName])
    
    // Filter out null/undefined values for type checking
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '')
    
    // If all values are null, default to string type
    if (nonNullValues.length === 0) {
      return {
        name: columnName,
        type: 'string',
        nullable: true,
        uniqueCount: 0,
        nullCount: values.length,
        sampleValues: []
      }
    }

    // Calculate statistics
    const nullCount = values.length - nonNullValues.length
    const uniqueValues = new Set(nonNullValues)
    const uniqueCount = uniqueValues.size
    
    // Get sample values (first 5 unique values)
    const sampleValues = Array.from(uniqueValues).slice(0, 5)

    // Type inference checks (in order of specificity)
    
    // Check 1: Boolean type
    // If all non-null values are strictly true/false
    const isBoolean = nonNullValues.every(v => 
      typeof v === 'boolean' || v === true || v === false
    )
    
    if (isBoolean) {
      return {
        name: columnName,
        type: 'boolean',
        nullable: nullCount > 0,
        uniqueCount,
        nullCount,
        sampleValues
      }
    }

    // Check 2: Number type
    // If all non-null values are numbers or can be converted to numbers
    const isNumber = nonNullValues.every(v => {
      // Already a number type
      if (typeof v === 'number' && !isNaN(v)) return true
      
      // String that can be converted to number
      if (typeof v === 'string') {
        // Try to convert string to number
        const num = Number(v)
        return !isNaN(num) && v.trim() !== ''
      }
      
      return false
    })
    
    if (isNumber) {
      return {
        name: columnName,
        type: 'number',
        nullable: nullCount > 0,
        uniqueCount,
        nullCount,
        sampleValues,
        // Calculate min/max for numbers
        min: Math.min(...nonNullValues.map(v => Number(v))),
        max: Math.max(...nonNullValues.map(v => Number(v)))
      }
    }

    // Check 3: Date type
    // If all non-null values are valid dates
    const isDate = nonNullValues.every(v => {
      // If already a Date object
      if (v instanceof Date) return !isNaN(v.getTime())
      
      // If string, try to parse as date
      if (typeof v === 'string') {
        const date = new Date(v)
        return !isNaN(date.getTime()) && v.match(/\d/)
      }
      
      return false
    })
    
    if (isDate) {
      // Find date range
      const dates = nonNullValues.map(v => new Date(v))
      const minDate = new Date(Math.min(...dates))
      const maxDate = new Date(Math.max(...dates))
      
      return {
        name: columnName,
        type: 'date',
        nullable: nullCount > 0,
        uniqueCount,
        nullCount,
        sampleValues: sampleValues.map(v => new Date(v).toISOString()),
        minDate: minDate.toISOString(),
        maxDate: maxDate.toISOString()
      }
    }

    // Check 4: Category type (string with limited unique values)
    // If unique count is less than 10% of total values, consider it categorical
    const isCategorical = uniqueCount < Math.max(10, nonNullValues.length * 0.1)
    
    // Default: String type
    return {
      name: columnName,
      type: isCategorical ? 'category' : 'string',
      nullable: nullCount > 0,
      uniqueCount,
      nullCount,
      sampleValues,
      // For categorical data, include all categories
      ...(isCategorical && { categories: Array.from(uniqueValues) })
    }
  })
}

/**
 * Get a summary of the entire dataset
 * 
 * @param {Array} data - Parsed CSV data
 * @returns {Object} - Dataset summary with:
 *                     - totalRows: number of rows
 *                     - totalColumns: number of columns
 *                     - columns: array of column metadata
 *                     - memorySize: estimated memory usage
 *                     - dataQuality: quality score (0-100)
 */
export const getDataSummary = (data) => {
  // Return empty summary if no data
  if (!data || data.length === 0) {
    return {
      totalRows: 0,
      totalColumns: 0,
      columns: [],
      memorySize: 0,
      dataQuality: 0
    }
  }

  // Get column information
  const columns = inferColumnTypes(data)
  
  // Calculate total null values across all columns
  const totalNulls = columns.reduce((sum, col) => sum + (col.nullCount || 0), 0)
  const totalCells = data.length * columns.length
  
  // Calculate data quality score (0-100)
  // Based on: completeness, consistency, and validity
  const completeness = ((totalCells - totalNulls) / totalCells) * 100
  
  // Estimate memory size (rough calculation)
  const memorySizeBytes = JSON.stringify(data).length
  const memorySize = formatBytes(memorySizeBytes) // Convert to human-readable format
  
  return {
    totalRows: data.length,
    totalColumns: columns.length,
    columns,
    memorySize, // Now formatted as "158.67 KB"
    memorySizeBytes, // Keep raw bytes for calculations if needed
    qualityScore: Math.round(completeness), // Use qualityScore for consistency
    dataQuality: Math.round(completeness), // Keep for backward compatibility
    completeness: Math.round(completeness * 10) / 10,
    totalNulls,
    nullPercentage: Math.round((totalNulls / totalCells) * 1000) / 10
  }
}

/**
 * Helper function to format bytes to human-readable format
 * 
 * @param {Number} bytes - Size in bytes
 * @returns {String} - Formatted string (e.g., "1.5 MB")
 */
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Export functions for use in other components
 */
export default {
  parseCSVFile,
  validateCSV,
  inferColumnTypes,
  getDataSummary,
  formatBytes
}