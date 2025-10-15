import { motion } from 'framer-motion'
import { Upload, BarChart3, Sparkles, ArrowRight } from 'lucide-react'
import useStore from '../store/useStore'

const LandingPage = () => {
  const { setCurrentPage } = useStore()

  const features = [
    {
      icon: Upload,
      title: 'Upload CSV Data',
      description: 'Easily upload your data files and start analyzing instantly',
      color: 'blue'
    },
    {
      icon: BarChart3,
      title: 'Interactive Charts',
      description: 'Visualize your data with beautiful, responsive charts',
      color: 'green'
    },
    {
      icon: Sparkles,
      title: 'AI Insights',
      description: 'Get intelligent recommendations powered by AI',
      color: 'purple'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            AI-Enhanced
            <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Analytics Dashboard
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Transform your data into actionable insights with AI-powered analytics.
            Upload, visualize, and understand your data like never before.
          </p>

          <motion.button
            onClick={() => setCurrentPage('upload')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/50 transition-all"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const colorClasses = {
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-green-600',
              purple: 'from-purple-500 to-purple-600'
            }

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${colorClasses[feature.color]} rounded-xl mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default LandingPage
