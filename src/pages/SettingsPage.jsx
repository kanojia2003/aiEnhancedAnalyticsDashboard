import { motion } from 'framer-motion'
import { Moon, Sun, Bell, Lock, Database, Palette } from 'lucide-react'
import useStore from '../store/useStore'

const SettingsPage = () => {
  const { darkMode, toggleDarkMode } = useStore()

  const settingsSections = [
    {
      title: 'Appearance',
      icon: Palette,
      settings: [
        {
          label: 'Dark Mode',
          description: 'Toggle between light and dark theme',
          type: 'toggle',
          value: darkMode,
          onChange: toggleDarkMode
        },
        {
          label: 'Chart Theme',
          description: 'Choose your preferred chart color scheme',
          type: 'select',
          options: ['Blue', 'Purple', 'Green', 'Custom']
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          label: 'Email Notifications',
          description: 'Receive updates via email',
          type: 'toggle',
          value: true
        },
        {
          label: 'Push Notifications',
          description: 'Get instant browser notifications',
          type: 'toggle',
          value: false
        }
      ]
    },
    {
      title: 'Data & Privacy',
      icon: Database,
      settings: [
        {
          label: 'Data Retention',
          description: 'How long to keep your data',
          type: 'select',
          options: ['30 days', '90 days', '1 year', 'Forever']
        },
        {
          label: 'Auto-save',
          description: 'Automatically save your work',
          type: 'toggle',
          value: true
        }
      ]
    },
    {
      title: 'Security',
      icon: Lock,
      settings: [
        {
          label: 'Two-Factor Authentication',
          description: 'Add an extra layer of security',
          type: 'toggle',
          value: false
        }
      ]
    }
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Customize your dashboard experience</p>
      </div>

      {/* Settings Sections */}
      {settingsSections.map((section, index) => {
        const Icon = section.icon
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
            </div>

            <div className="space-y-4">
              {section.settings.map((setting, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">{setting.label}</h3>
                    <p className="text-sm text-gray-400">{setting.description}</p>
                  </div>

                  {setting.type === 'toggle' && (
                    <button
                      onClick={setting.onChange}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        setting.value ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <motion.div
                        animate={{ x: setting.value ? 24 : 2 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full"
                      />
                    </button>
                  )}

                  {setting.type === 'select' && (
                    <select className="bg-gray-600 text-white border border-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500">
                      {setting.options.map((option, optIdx) => (
                        <option key={optIdx}>{option}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )
      })}

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
      >
        Save Changes
      </motion.button>
    </div>
  )
}

export default SettingsPage
