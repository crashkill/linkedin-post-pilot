import React, { useState, useEffect } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

const ThemeToggle = () => {
  const [theme, setTheme] = useState('system')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system'
    setTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (newTheme) => {
    const root = document.documentElement
    
    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(systemDark)
      root.classList.toggle('dark', systemDark)
    } else {
      const isDarkTheme = newTheme === 'dark'
      setIsDark(isDarkTheme)
      root.classList.toggle('dark', isDarkTheme)
    }
  }

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  const themes = [
    { value: 'light', icon: Sun, label: 'Claro' },
    { value: 'dark', icon: Moon, label: 'Escuro' },
    { value: 'system', icon: Monitor, label: 'Sistema' }
  ]

  return (
    <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1 glass-effect">
      {themes.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          onClick={() => handleThemeChange(value)}
          className={cn(
            "flex items-center space-x-1 px-2 py-1 text-xs transition-all duration-200 magnetic-btn focus-ring",
            theme === value 
              ? "bg-blue-500/20 text-blue-300 pulse-glow" 
              : "text-gray-400 hover:text-white hover:bg-white/10"
          )}
          title={label}
        >
          <Icon className="w-3 h-3" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  )
}

export default ThemeToggle