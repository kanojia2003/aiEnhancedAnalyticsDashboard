import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Download } from 'lucide-react'
import useStore from '../store/useStore'

const ExportModal = () => {
  const { showExportModal, setShowExportModal } = useStore()

  const exportOptions = [
    { format: 'PDF', description: 'Portable Document Format', icon: '📄' },
    { format: 'CSV', description: 'Comma Separated Values', icon: '📊' },
    { format: 'Excel', description: 'Microsoft Excel Format', icon: '📗' },
    { format: 'JSON', description: 'JavaScript Object Notation', icon: '🔧' },
  ]

  const handleExport = (format) => {
    console.log(`Exporting as ${format}`)
    // Here you would implement the actual export logic
    setShowExportModal(false)
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
            onClick={() => setShowExportModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-gray-800 rounded-2xl p-6 border border-gray-700 z-50"
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
                onClick={() => setShowExportModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Export Options */}
            <div className="space-y-3 mb-6">
              {exportOptions.map((option, index) => (
                <motion.button
                  key={option.format}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleExport(option.format)}
                  className="w-full flex items-center gap-4 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-3xl">{option.icon}</span>
                  <div className="text-left flex-1">
                    <h3 className="text-white font-semibold">{option.format}</h3>
                    <p className="text-sm text-gray-400">{option.description}</p>
                  </div>
                  <Download className="w-5 h-5 text-gray-400" />
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ExportModal
