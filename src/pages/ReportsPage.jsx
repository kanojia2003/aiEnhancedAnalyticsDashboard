import { motion } from 'framer-motion'
import { FileText, Download, Calendar, Filter } from 'lucide-react'
import useStore from '../store/useStore'

const ReportsPage = () => {
  const { setShowExportModal } = useStore()

  const reports = [
    {
      id: 1,
      name: 'Monthly Revenue Report',
      date: '2025-10-01',
      type: 'Revenue',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'User Analytics Summary',
      date: '2025-09-28',
      type: 'Analytics',
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'Performance Metrics Q3',
      date: '2025-09-30',
      type: 'Performance',
      size: '3.2 MB'
    },
    {
      id: 4,
      name: 'Device Distribution Report',
      date: '2025-10-05',
      type: 'Distribution',
      size: '1.5 MB'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
          <p className="text-gray-400">View and export your analytics reports</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Download className="w-5 h-5" />
          Export Report
        </motion.button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date Range
            </label>
            <select className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
              <option>Custom Range</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Report Type
            </label>
            <select className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500">
              <option>All Types</option>
              <option>Revenue</option>
              <option>Analytics</option>
              <option>Performance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Format
            </label>
            <select className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500">
              <option>PDF</option>
              <option>CSV</option>
              <option>Excel</option>
              <option>JSON</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {report.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{report.type}</span>
                    <span>•</span>
                    <span>{report.date}</span>
                    <span>•</span>
                    <span>{report.size}</span>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ReportsPage
