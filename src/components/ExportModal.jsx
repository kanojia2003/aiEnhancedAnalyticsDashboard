import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import useStore from '../store/useStore'
import {
  exportToCSV,
  exportToJSON,
  exportToExcel,
  exportToPDF,
  prepareExportData,
} from '../utils/exportHelpers'

const ExportModal = () => {
  const {
    showExportModal,
    setShowExportModal,
    csvData,
    dataStats,
    chartConfigs,
    aiInsights,
    aiRecommendations,
    aiPredictions,
    aiAnomalies,
  } = useStore()

  const [exportStatus, setExportStatus] = useState(null) // { type: 'success' | 'error', message: '' }
  const [isExporting, setIsExporting] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState(null)

  const exportOptions = [
    {
      format: 'PDF',
      description: 'Complete report with charts & insights',
      icon: '📄',
      color: 'red',
    },
    {
      format: 'CSV',
      description: 'Raw data in spreadsheet format',
      icon: '📊',
      color: 'green',
    },
    {
      format: 'Excel',
      description: 'Enhanced spreadsheet format',
      icon: '📗',
      color: 'emerald',
    },
    {
      format: 'JSON',
      description: 'Complete data package with metadata',
      icon: '🔧',
      color: 'blue',
    },
  ]

  const handleExport = async (format) => {
    // Check if data exists
    if (!csvData || csvData.length === 0) {
      setExportStatus({
        type: 'error',
        message: 'No data to export. Please upload a CSV file first.',
      })
      return
    }

    setIsExporting(true)
    setSelectedFormat(format)
    setExportStatus(null)

    try {
      let result

      switch (format) {
        case 'PDF': {
          // Export as PDF with charts and insights
          const exportData = {
            csvData,
            dataStats,
            aiInsights,
            aiRecommendations,
            chartConfigs,
            includeCharts: true,
            includeInsights: true,
            includeData: false, // Don't include full data table to keep PDF manageable
          }
          result = await exportToPDF(exportData)
          break
        }

        case 'CSV': {
          // Export raw CSV data
          const filename = `analytics-data-${new Date().toISOString().split('T')[0]}.csv`
          result = exportToCSV(csvData, filename)
          break
        }

        case 'Excel': {
          // Export as Excel format
          const filename = `analytics-data-${new Date().toISOString().split('T')[0]}.xlsx`
          result = exportToExcel(csvData, filename)
          break
        }

        case 'JSON': {
          // Export complete data package
          const completeData = prepareExportData({
            csvData,
            dataStats,
            chartConfigs,
            aiInsights,
            aiRecommendations,
            aiPredictions,
            aiAnomalies,
          })
          const filename = `analytics-complete-${new Date().toISOString().split('T')[0]}.json`
          result = exportToJSON(completeData, filename)
          break
        }

        default:
          throw new Error('Unknown export format')
      }

      if (result.success) {
        setExportStatus({
          type: 'success',
          message: result.message || `Successfully exported as ${format}!`,
        })

        // Close modal after 2 seconds on success
        setTimeout(() => {
          setShowExportModal(false)
          setExportStatus(null)
          setSelectedFormat(null)
        }, 2000)
      } else {
        setExportStatus({
          type: 'error',
          message: result.error || 'Export failed. Please try again.',
        })
      }
    } catch (error) {
      console.error('Export error:', error)
      setExportStatus({
        type: 'error',
        message: `Export failed: ${error.message}`,
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <AnimatePresence>
      {showExportModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isExporting && setShowExportModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center"
          />

          {/* Modal Container - Centered */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg mx-4 bg-gray-800 rounded-2xl p-6 border border-gray-700 pointer-events-auto"
            >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Export Report</h2>
                  <p className="text-sm text-gray-400">Choose your preferred format</p>
                </div>
              </div>
              <button
                onClick={() => !isExporting && setShowExportModal(false)}
                disabled={isExporting}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Export Status Message */}
            <AnimatePresence>
              {exportStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
                    exportStatus.type === 'success'
                      ? 'bg-green-500/20 border border-green-500/50'
                      : 'bg-red-500/20 border border-red-500/50'
                  }`}
                >
                  {exportStatus.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <p
                    className={`text-sm ${
                      exportStatus.type === 'success' ? 'text-green-300' : 'text-red-300'
                    }`}
                  >
                    {exportStatus.message}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Data Info */}
            {csvData && csvData.length > 0 && (
              <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-blue-400">
                    {csvData.length.toLocaleString()}
                  </span>{' '}
                  rows •{' '}
                  <span className="font-semibold text-blue-400">
                    {Object.keys(csvData[0] || {}).length}
                  </span>{' '}
                  columns
                  {chartConfigs && chartConfigs.length > 0 && (
                    <>
                      {' '}
                      •{' '}
                      <span className="font-semibold text-blue-400">
                        {chartConfigs.length}
                      </span>{' '}
                      charts
                    </>
                  )}
                  {aiInsights && aiInsights.length > 0 && (
                    <>
                      {' '}
                      •{' '}
                      <span className="font-semibold text-blue-400">
                        {aiInsights.length}
                      </span>{' '}
                      insights
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Export Options */}
            <div className="space-y-3 mb-6">
              {exportOptions.map((option, index) => (
                <motion.button
                  key={option.format}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleExport(option.format)}
                  disabled={isExporting}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all ${
                    isExporting && selectedFormat === option.format
                      ? 'bg-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="text-3xl">{option.icon}</span>
                  <div className="text-left flex-1">
                    <h3 className="text-white font-semibold">{option.format}</h3>
                    <p className="text-sm text-gray-400">{option.description}</p>
                  </div>
                  {isExporting && selectedFormat === option.format ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Download className="w-5 h-5 text-gray-400" />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                disabled={isExporting}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ExportModal
