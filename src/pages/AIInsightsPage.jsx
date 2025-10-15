import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'

const AIInsightsPage = () => {
  const insights = [
    {
      id: 1,
      type: 'positive',
      icon: TrendingUp,
      title: 'Revenue Growth Detected',
      description: 'Your revenue has increased by 23% compared to last month. The upward trend is consistent across all product categories.',
      confidence: 95,
      color: 'green'
    },
    {
      id: 2,
      type: 'warning',
      icon: AlertCircle,
      title: 'User Engagement Drop',
      description: 'There\'s a 12% decrease in user engagement on mobile devices. Consider optimizing mobile experience.',
      confidence: 87,
      color: 'yellow'
    },
    {
      id: 3,
      type: 'positive',
      icon: CheckCircle,
      title: 'Performance Optimization',
      description: 'Your application performance has improved by 18%. Page load times are now 30% faster than industry average.',
      confidence: 92,
      color: 'blue'
    },
    {
      id: 4,
      type: 'negative',
      icon: TrendingDown,
      title: 'Conversion Rate Alert',
      description: 'Conversion rates have dropped by 8% in the last week. Peak decline observed during weekend hours.',
      confidence: 89,
      color: 'red'
    }
  ]

  const recommendations = [
    'Focus marketing efforts on high-performing product categories',
    'Implement mobile-first design improvements',
    'Optimize checkout process to improve conversion rates',
    'Increase content engagement on weekends',
    'Consider A/B testing for landing pages'
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Insights</h1>
          <p className="text-gray-400">Auto-generated insights from your data</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Sparkles className="w-5 h-5" />
          Generate New Insights
        </motion.button>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          const colorClasses = {
            green: 'bg-green-500/20 text-green-400 border-green-500/30',
            yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            red: 'bg-red-500/20 text-red-400 border-red-500/30'
          }

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[insight.color].split(' ')[0]}`}>
                  <Icon className={`w-6 h-6 ${colorClasses[insight.color].split(' ')[1]}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {insight.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {insight.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      AI Confidence
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorClasses[insight.color].split(' ')[0]}`}
                          style={{ width: `${insight.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">
                        {insight.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          AI Recommendations
        </h3>
        <div className="space-y-3">
          {recommendations.map((recommendation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
              <p className="text-gray-300">{recommendation}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default AIInsightsPage
