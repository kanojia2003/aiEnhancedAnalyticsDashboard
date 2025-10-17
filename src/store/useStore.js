import { create } from 'zustand'

const useStore = create((set) => ({
  // Navigation
  currentPage: 'landing', // 'landing', 'dashboard', 'insights', 'reports', 'settings'
  setCurrentPage: (page) => set({ currentPage: page }),
  
  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  //New state for csv data
  uploadedFiles:  [],
  csvData: null,
  dataHeaders: [],
  dataStats: {},
  isProcessing: false,
  uploadError: null,

  //New actions for csv data
  setUploadedFiles: (files) => set({ uploadedFiles: files }),
  addUploadedFile: (file) => set((state) => ({
    uploadedFiles: [...state.uploadedFiles, file]
  })),
  removeUploadedFile: (fileId) => set((state) => ({
    uploadedFiles: state.uploadedFiles.filter(file => file.id !== fileId)
  })),
  setCsvData: (data) => set({ csvData: data }),
  setDataColumns: (columns) => set({ dataColumns: columns }),
  setDataStats: (stats) => set({ dataStats: stats }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  setUploadError: (error) => set({ uploadError: error }),
  clearAllData: () => set({
    uploadedFiles: [],
    csvData: null,
    dataColumns: [],
    dataStats: {},
    uploadError: null
  }),
  
  // Dark Mode
  darkMode: false,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setDarkMode: (mode) => set({ darkMode: mode }),
  
  // Chart Configurations
  chartConfigs: [],
  addChartConfig: (config) => set((state) => ({
    chartConfigs: [...state.chartConfigs, config]
  })),
  updateChartConfig: (id, updatedConfig) => set((state) => ({
    chartConfigs: state.chartConfigs.map(config => 
      config.id === id ? { ...config, ...updatedConfig } : config
    )
  })),
  removeChartConfig: (id) => set((state) => ({
    chartConfigs: state.chartConfigs.filter(config => config.id !== id)
  })),
  clearChartConfigs: () => set({ chartConfigs: [] }),

  // AI Insights State
  aiInsights: [],                  // Array of generated insights
  aiInsightsLoading: false,        // Loading state for insights generation
  aiInsightsError: null,           // Error message if generation fails
  aiInsightsLastUpdated: null,     // Timestamp of last generation
  aiRecommendations: [],           // AI-generated recommendations
  aiPredictions: null,             // Trend predictions
  aiAnomalies: [],                 // Detected anomalies
  
  // AI Chat State
  aiChatMessages: [],              // Chat history
  aiChatLoading: false,            // Loading state for chat
  
  // AI Configuration
  openaiApiKey: null,              // User's API key (runtime override)
  aiProvider: 'openai',            // AI provider (future: support others)
  aiAutoGenerate: false,           // Auto-generate insights on data upload (disabled to avoid rate limits)
  
  // AI Actions
  setAiInsights: (insights) => set({ 
    aiInsights: insights,
    aiInsightsLastUpdated: new Date().toISOString()
  }),
  setAiInsightsLoading: (loading) => set({ aiInsightsLoading: loading }),
  setAiInsightsError: (error) => set({ aiInsightsError: error }),
  setAiRecommendations: (recommendations) => set({ aiRecommendations: recommendations }),
  setAiPredictions: (predictions) => set({ aiPredictions: predictions }),
  setAiAnomalies: (anomalies) => set({ aiAnomalies: anomalies }),
  clearAiInsights: () => set({ 
    aiInsights: [],
    aiRecommendations: [],
    aiPredictions: null,
    aiAnomalies: [],
    aiInsightsError: null
  }),
  
  // AI Chat Actions
  addChatMessage: (message) => set((state) => ({ 
    aiChatMessages: [...state.aiChatMessages, {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    }]
  })),
  clearChatMessages: () => set({ aiChatMessages: [] }),
  setAiChatLoading: (loading) => set({ aiChatLoading: loading }),
  
  // API Key Management
  setOpenaiApiKey: (key) => set({ openaiApiKey: key }),
  setAiAutoGenerate: (auto) => set({ aiAutoGenerate: auto }),

}))

export default useStore
