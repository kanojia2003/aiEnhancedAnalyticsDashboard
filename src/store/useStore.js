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

}))

export default useStore
