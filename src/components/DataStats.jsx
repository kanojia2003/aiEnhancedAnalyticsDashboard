import { motion } from 'framer-motion'
import { 
  FileText, 
  Columns, 
  CheckCircle, 
  HardDrive, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Hash,
  Type
} from 'lucide-react'

/**
 * DataStats Component
 * Displays statistics and metadata about the uploaded CSV data
 * 
 * Props:
 * - summary: Data summary object from getDataSummary()
 * - columns: Column information from inferColumnTypes()
 * - validation: Validation results from validateCSV()
 */
const DataStats = ({ summary, columns, validation }) => {
  // Get type distribution
  const typeDistribution = columns.reduce((acc, col) => {
    acc[col.type] = (acc[col.type] || 0) + 1
    return acc
  }, {})

  // Get icon for column type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'number': return <Hash className="w-4 h-4" />
      case 'date': return <Calendar className="w-4 h-4" />
      case 'boolean': return <CheckCircle className="w-4 h-4" />
      case 'category': return <TrendingUp className="w-4 h-4" />
      default: return <Type className="w-4 h-4" />
    }
  }

  // Get color for column type
  const getTypeColor = (type) => {
    switch (type) {
      case 'number': return 'text-blue-400 bg-blue-500/20'
      case 'date': return 'text-purple-400 bg-purple-500/20'
      case 'boolean': return 'text-green-400 bg-green-500/20'
      case 'category': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Rows</p>
              <p className="text-2xl font-bold text-white">{summary.totalRows.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Total Columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Columns className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Columns</p>
              <p className="text-2xl font-bold text-white">{summary.totalColumns}</p>
            </div>
          </div>
        </motion.div>

        {/* Data Quality */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              summary.qualityScore >= 90 ? 'bg-green-500/20' : 
              summary.qualityScore >= 70 ? 'bg-yellow-500/20' : 
              'bg-red-500/20'
            }`}>
              <CheckCircle className={`w-5 h-5 ${
                summary.qualityScore >= 90 ? 'text-green-400' : 
                summary.qualityScore >= 70 ? 'text-yellow-400' : 
                'text-red-400'
              }`} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Data Quality</p>
              <p className="text-2xl font-bold text-white">{summary.qualityScore}%</p>
            </div>
          </div>
        </motion.div>

        {/* Memory Size */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Memory Size</p>
              <p className="text-2xl font-bold text-white">{summary.memorySize}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Validation Warnings */}
      {validation && !validation.valid && validation.warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-yellow-400 font-semibold mb-2">Data Quality Warnings</h4>
              <ul className="space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-200/80">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Column Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-800 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Column Analysis</h3>
        
        {/* Type Distribution Summary */}
        <div className="mb-6 flex flex-wrap gap-3">
          {Object.entries(typeDistribution).map(([type, count]) => (
            <div
              key={type}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${getTypeColor(type)}`}
            >
              {getTypeIcon(type)}
              <span className="text-sm font-medium capitalize">{type}</span>
              <span className="text-xs opacity-75">({count})</span>
            </div>
          ))}
        </div>

        {/* Column Details */}
        <div className="space-y-3">
          {columns.map((column, index) => (
            <motion.div
              key={column.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.05 }}
              className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-white font-medium">{column.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(column.type)}`}>
                      {column.type}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {/* Unique Values */}
                    {column.uniqueCount !== undefined && (
                      <div>
                        <p className="text-gray-400">Unique Values</p>
                        <p className="text-white font-medium">{column.uniqueCount.toLocaleString()}</p>
                      </div>
                    )}
                    
                    {/* Null Count */}
                    {column.nullCount !== undefined && (
                      <div>
                        <p className="text-gray-400">Null Values</p>
                        <p className={column.nullCount > 0 ? 'text-yellow-400 font-medium' : 'text-white font-medium'}>
                          {column.nullCount}
                        </p>
                      </div>
                    )}
                    
                    {/* Range (for numbers) */}
                    {column.type === 'number' && column.min !== undefined && column.max !== undefined && (
                      <div>
                        <p className="text-gray-400">Range</p>
                        <p className="text-white font-medium font-mono text-xs">
                          {column.min.toLocaleString()} - {column.max.toLocaleString()}
                        </p>
                      </div>
                    )}
                    
                    {/* Sample Values */}
                    {column.sampleValues && column.sampleValues.length > 0 && (
                      <div>
                        <p className="text-gray-400">Sample</p>
                        <p className="text-white font-medium text-xs truncate">
                          {column.sampleValues.slice(0, 2).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default DataStats
