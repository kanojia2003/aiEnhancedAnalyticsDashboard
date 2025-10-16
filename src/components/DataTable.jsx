import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react'

/**
 * DataTable Component
 * Displays CSV data in a paginated, searchable table
 * 
 * Props:
 * - data: Array of data objects
 * - columns: Array of column configurations with type info
 * - rowsPerPage: Number of rows per page (default: 10)
 */
const DataTable = ({ data = [], columns = [], rowsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // Filter data based on search term
  const filteredData = data.filter(row => {
    if (!searchTerm) return true
    return Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Sort data based on sort configuration
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0
    
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    
    // Handle null/undefined values
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1
    
    // Compare values
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentData = sortedData.slice(startIndex, endIndex)

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Get column type badge color
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'number': return 'bg-blue-500/20 text-blue-400'
      case 'date': return 'bg-purple-500/20 text-purple-400'
      case 'boolean': return 'bg-green-500/20 text-green-400'
      case 'category': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  // Format cell value based on type
  const formatCellValue = (value, type) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-500 italic">null</span>
    }
    
    if (type === 'boolean') {
      return value ? (
        <span className="text-green-400">✓ True</span>
      ) : (
        <span className="text-red-400">✗ False</span>
      )
    }
    
    if (type === 'number') {
      return <span className="text-blue-400 font-mono">{value}</span>
    }
    
    if (type === 'date') {
      return <span className="text-purple-400">{value}</span>
    }
    
    return String(value)
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            placeholder="Search across all columns..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-gray-400">
          Showing {startIndex + 1}-{Math.min(endIndex, sortedData.length)} of {sortedData.length} rows
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-semibold text-gray-400">#</span>
                </th>
                {columns.map((column) => (
                  <th
                    key={column.name}
                    className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700/50 transition-colors group"
                    onClick={() => handleSort(column.name)}
                  >
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">
                            {column.name}
                          </span>
                          {sortConfig.key === column.name && (
                            <span className="text-blue-400 text-xs">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${getTypeBadgeColor(column.type)}`}>
                          {column.type}
                        </span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-400">
                    {searchTerm ? 'No results found' : 'No data available'}
                  </td>
                </tr>
              ) : (
                currentData.map((row, index) => (
                  <motion.tr
                    key={startIndex + index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                      {startIndex + index + 1}
                    </td>
                    {columns.map((column) => (
                      <td key={column.name} className="px-4 py-3 text-sm text-gray-300">
                        {formatCellValue(row[column.name], column.type)}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="flex items-center gap-2">
            {/* First Page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            
            {/* Previous Page */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            {/* Next Page */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            {/* Last Page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
