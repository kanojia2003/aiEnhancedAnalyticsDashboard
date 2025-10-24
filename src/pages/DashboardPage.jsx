import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Upload,
  AlertCircle,
  LayoutGrid,
} from 'lucide-react';
import useStore from '../store/useStore';
import ChartConfigurator from '../components/ChartConfigurator';
import ChartGrid from '../components/ChartGrid';

const DashboardPage = () => {
  const { 
    csvData, 
    dataColumns, 
    dataStats,
    chartConfigs, 
    addChartConfig, 
    updateChartConfig, 
    removeChartConfig, 
    setCurrentPage 
  } = useStore();
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [editingChart, setEditingChart] = useState(null);

  // Handle opening configurator for new chart
  const handleAddChart = () => {
    setEditingChart(null);
    setShowConfigurator(true);
  };

  // Handle opening configurator for editing
  const handleEditChart = (config) => {
    setEditingChart(config);
    setShowConfigurator(true);
  };

  // Handle saving chart config
  const handleSaveChart = (config) => {
    if (editingChart) {
      updateChartConfig(editingChart.id, config);
    } else {
      addChartConfig(config);
    }
    setShowConfigurator(false);
    setEditingChart(null);
  };

  // Handle deleting chart
  const handleDeleteChart = (id) => {
    if (confirm('Are you sure you want to delete this chart?')) {
      removeChartConfig(id);
    }
  };

  // Handle chart reorder
  const handleChartReorder = (newOrder) => {
    // Update the order in store
    newOrder.forEach((config, index) => {
      updateChartConfig(config.id, { ...config, order: index });
    });
  };

  // Note: Refresh button removed (was non-functional)

  // No data uploaded state
  if (!csvData || csvData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Upload className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h2 className="text-2xl font-bold text-white mb-2">No Data Available</h2>
          <p className="text-gray-400 mb-6">Upload CSV data to create dynamic charts</p>
          <button
            onClick={() => setCurrentPage('upload')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Stats */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">
            {chartConfigs.length > 0
              ? `Displaying ${chartConfigs.length} chart${chartConfigs.length !== 1 ? 's' : ''} from ${dataStats?.totalRows || 0} rows`
              : 'Create charts to visualize your data'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {chartConfigs.length > 0 && (
            <>
              {/* Refresh removed - not required */}
            </>
          )}
          <button
            onClick={handleAddChart}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Chart</span>
          </button>
        </div>
      </div>

      {/* Data Summary Cards (when charts exist) */}
      {chartConfigs.length > 0 && dataStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Charts</p>
                <p className="text-2xl font-bold text-white">{chartConfigs.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Data Rows</p>
                <p className="text-2xl font-bold text-white">{dataStats.totalRows?.toLocaleString?.()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Columns</p>
                <p className="text-2xl font-bold text-white">{dataStats.totalColumns}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">Data Quality</p>
                <p className="text-2xl font-bold text-white">{dataStats.qualityScore}%</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Charts Grid or Empty State */}
      {chartConfigs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl p-12 border border-gray-700 text-center"
        >
          <div className="max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-white mb-2">No Charts Created Yet</h3>
            <p className="text-gray-400 mb-6">
              Start by creating your first chart to visualize your CSV data
            </p>
            <button
              onClick={handleAddChart}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create First Chart
            </button>
          </div>
        </motion.div>
      ) : (
        <ChartGrid
          configs={chartConfigs}
          data={csvData}
          onEdit={handleEditChart}
          onDelete={handleDeleteChart}
          onReorder={handleChartReorder}
        />
      )}

      {/* Chart Configurator Modal */}
      {showConfigurator && (
        <ChartConfigurator
          data={csvData}
          columns={dataColumns}
          initialConfig={editingChart}
          onSave={handleSaveChart}
          onCancel={() => {
            setShowConfigurator(false);
            setEditingChart(null);
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;
