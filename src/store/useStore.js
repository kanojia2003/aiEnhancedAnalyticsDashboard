import { create } from 'zustand'

const useStore = create((set) => ({
  // Navigation
  currentPage: 'landing', // 'landing', 'dashboard', 'insights', 'reports', 'settings'
  setCurrentPage: (page) => set({ currentPage: page }),
  
  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  // CSV Data
  csvData: null,
  csvHeaders: [],
  fileName: '',
  
  // Set CSV Data
  setCsvData: (data, headers, fileName) => set({
    csvData: data,
    csvHeaders: headers,
    fileName: fileName
  }),
  
  // Clear CSV Data
  clearCsvData: () => set({
    csvData: null,
    csvHeaders: [],
    fileName: ''
  }),
  
  // AI Insights
  aiInsights: null,
  isLoadingInsights: false,
  
  // Set AI Insights
  setAiInsights: (insights) => set({ aiInsights: insights }),
  setLoadingInsights: (loading) => set({ isLoadingInsights: loading }),
  
  // Dark Mode
  darkMode: false,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setDarkMode: (mode) => set({ darkMode: mode }),
  
  // Export Modal
  showExportModal: false,
  setShowExportModal: (show) => set({ showExportModal: show }),
}))

export default useStore
