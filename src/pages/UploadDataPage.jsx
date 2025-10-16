import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, Eye } from 'lucide-react'
import useStore from '../store/useStore'
// Import CSV parser utilities
import { parseCSVFile, validateCSV, inferColumnTypes, getDataSummary } from '../utils/csvParser'
// Import new components
import DataTable from '../components/DataTable'
import DataStats from '../components/DataStats'

const UploadDataPage = () => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingError, setProcessingError] = useState(null)
  const [processingResults, setProcessingResults] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  
  const { 
    setCurrentPage, 
    setCsvData, 
    setDataColumns, 
    setDataStats,
    setUploadError 
  } = useStore()

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
    // Reset previous state
    setProcessingError(null)
    setProcessingResults(null)
    setShowPreview(false)
    
    // Validate file type
    if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
      setProcessingError('Invalid file type. Please upload a CSV file.')
      return
    }
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      setProcessingError('File is too large. Maximum size is 10MB.')
      return
    }
    
    setUploadedFile(file)
  }

  const removeFile = () => {
    setUploadedFile(null)
    setProcessingError(null)
    setProcessingResults(null)
    setShowPreview(false)
  }

  const processFile = async () => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    setProcessingError(null)
    
    try {
      console.log('📄 Starting CSV parsing...')
      
      // Step 1: Parse CSV file
      const parseResult = await parseCSVFile(uploadedFile)
      
      if (parseResult.errors && parseResult.errors.length > 0) {
        throw new Error(`CSV parsing failed: ${parseResult.errors[0].message}`)
      }
      
      const { data } = parseResult
      
      if (!data || data.length === 0) {
        throw new Error('CSV file is empty or contains no valid data')
      }
      
      console.log('✅ Parsing complete! Rows:', data.length)
      
      // Step 2: Validate data
      console.log('🔍 Validating data...')
      const validation = validateCSV(data)
      console.log('Validation result:', validation)
      
      // Step 3: Infer column types
      console.log('🔬 Inferring column types...')
      const columns = inferColumnTypes(data)
      console.log('Column types:', columns)
      
      // Step 4: Generate summary statistics
      console.log('📊 Generating summary...')
      const summary = getDataSummary(data)
      console.log('Summary:', summary)
      
      // Store results
      const results = {
        data,
        columns,
        validation,
        summary,
        fileName: uploadedFile.name
      }
      
      setProcessingResults(results)
      
      // Save to Zustand store
      setCsvData(data)
      setDataColumns(columns)
      setDataStats(summary)
      
      console.log('🎉 Processing complete!')
      
      // Show preview
      setShowPreview(true)
      
    } catch (error) {
      console.error('❌ Error processing CSV:', error)
      setProcessingError(error.message || 'Failed to process CSV file')
      setUploadError(error.message)
    } finally {
      setIsProcessing(false)
    }
  }
  
  const navigateToDashboard = () => {
    setCurrentPage('dashboard')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Upload Your Data</h1>
        <p className="text-gray-400">Upload a CSV file to start analyzing your data</p>
      </div>
      
      {/* Processing Error */}
      {processingError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-red-400 font-semibold mb-1">Error Processing File</h4>
              <p className="text-red-200/80 text-sm">{processingError}</p>
            </div>
          </div>
        </motion.div>
      )}

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
        {uploadedFile && !processingResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex gap-4"
          >
            <button
              onClick={processFile}
              disabled={isProcessing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process & Analyze'
              )}
            </button>
            <button
              onClick={removeFile}
              disabled={isProcessing}
              className="px-6 py-3 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </motion.div>
        )}
        
        {/* Success & Navigate to Dashboard */}
        {processingResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex gap-4"
          >
            <button
              onClick={navigateToDashboard}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              View in Dashboard
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-6 py-3 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2"
            >
              <Eye className="w-5 h-5" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              onClick={removeFile}
              className="px-6 py-3 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            >
              Upload New
            </button>
          </motion.div>
        )}
      </motion.div>
      
      {/* Processing Results */}
      {processingResults && showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Data Statistics */}
          <DataStats
            summary={processingResults.summary}
            columns={processingResults.columns}
            validation={processingResults.validation}
          />
          
          {/* Data Preview Table */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white mb-1">Data Preview</h3>
              <p className="text-sm text-gray-400">
                Showing first {Math.min(processingResults.data.length, 10)} rows of {processingResults.data.length} total
              </p>
            </div>
            
            <DataTable
              data={processingResults.data}
              columns={processingResults.columns}
              rowsPerPage={10}
            />
          </div>
        </motion.div>
      )}

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
