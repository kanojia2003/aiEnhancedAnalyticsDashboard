import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, X, CheckCircle } from 'lucide-react'
import useStore from '../store/useStore'

const UploadDataPage = () => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const { setCurrentPage } = useStore()

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      setUploadedFile(file)
    } else {
      alert('Please upload a CSV file')
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
  }

  const processFile = () => {
    // Here you would parse the CSV using PapaParse
    // For now, just navigate to dashboard
    setCurrentPage('dashboard')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Upload Your Data</h1>
        <p className="text-gray-400">Upload a CSV file to start analyzing your data</p>
      </div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-2xl p-8 border border-gray-700"
      >
        <form
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onSubmit={(e) => e.preventDefault()}
        >
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full">
                <Upload className="w-8 h-8 text-blue-400" />
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Drop your CSV file here
                </h3>
                <p className="text-gray-400">
                  or <span className="text-blue-400 hover:text-blue-300">browse</span> to choose a file
                </p>
              </div>

              <p className="text-sm text-gray-500">
                Supported format: CSV (Max 10MB)
              </p>
            </div>
          </div>
        </form>

        {/* Uploaded File */}
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 bg-gray-700 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-400">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <button
                  onClick={removeFile}
                  className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex gap-4"
          >
            <button
              onClick={processFile}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Process & Analyze
            </button>
            <button
              onClick={removeFile}
              className="px-6 py-3 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
      >
        <h3 className="text-lg font-semibold text-white mb-4">File Requirements</h3>
        <ul className="space-y-2 text-gray-400">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            File format must be CSV
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            Maximum file size: 10MB
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            First row should contain column headers
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            Data should be properly formatted with no missing values
          </li>
        </ul>
      </motion.div>
    </div>
  )
}

export default UploadDataPage
