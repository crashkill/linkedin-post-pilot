import React, { useState, useEffect, useRef } from 'react'
import { Search, Filter, X, TrendingUp, Users, Hash, Calendar } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { cn } from '../lib/utils'

const SmartSearch = ({ searchTerm, onSearchChange, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeFilters, setActiveFilters] = useState([])
  const inputRef = useRef(null)
  const searchRef = useRef(null)

  const suggestions = [
    { type: 'trending', icon: TrendingUp, text: 'React 18 features', category: 'Trending' },
    { type: 'people', icon: Users, text: 'Desenvolvedores Frontend', category: 'Pessoas' },
    { type: 'hashtag', icon: Hash, text: '#javascript', category: 'Hashtags' },
    { type: 'hashtag', icon: Hash, text: '#react', category: 'Hashtags' },
    { type: 'trending', icon: TrendingUp, text: 'Next.js 14', category: 'Trending' },
    { type: 'people', icon: Users, text: 'Tech Leaders', category: 'Pessoas' }
  ]

  const filters = [
    { id: 'posts', label: 'Posts', icon: TrendingUp, color: 'blue' },
    { id: 'people', label: 'Pessoas', icon: Users, color: 'green' },
    { id: 'companies', label: 'Empresas', icon: Calendar, color: 'purple' },
    { id: 'hashtags', label: 'Hashtags', icon: Hash, color: 'yellow' }
  ]

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.text.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleFilter = (filterId) => {
    setActiveFilters(prev => 
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    )
  }

  const handleSuggestionClick = (suggestion) => {
    onSearchChange(suggestion.text)
    setShowSuggestions(false)
    setIsExpanded(false)
  }

  const clearSearch = () => {
    onSearchChange('')
    setActiveFilters([])
    inputRef.current?.focus()
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
        setIsExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      {/* Main Search Input */}
      <div className={cn(
        'relative transition-all duration-300',
        isExpanded ? 'w-full' : 'w-64 md:w-80'
      )}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Buscar posts, pessoas, empresas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => {
              setShowSuggestions(true)
              setIsExpanded(true)
            }}
            className="pl-10 pr-20 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-blue-400/50 transition-all duration-300 focus-ring"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="w-6 h-6 text-gray-400 hover:text-white micro-bounce"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-6 h-6 text-gray-400 hover:text-blue-400 micro-bounce"
            >
              <Filter className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {activeFilters.map(filterId => {
              const filter = filters.find(f => f.id === filterId)
              return (
                <span
                  key={filterId}
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full pulse-glow"
                >
                  <filter.icon className="w-3 h-3" />
                  <span>{filter.label}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFilter(filterId)}
                    className="w-3 h-3 text-blue-300 hover:text-white"
                  >
                    <X className="w-2 h-2" />
                  </Button>
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Search Suggestions & Filters */}
      {(showSuggestions || isExpanded) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 glass-effect border-white/10 bg-white/5 backdrop-blur-xl card-3d depth-shadow fade-in-up">
          <CardContent className="p-0">
            {/* Filters */}
            {isExpanded && (
              <div className="p-4 border-b border-white/10">
                <h4 className="text-sm font-medium text-white mb-3 gradient-text">Filtrar por:</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.map(filter => {
                    const isActive = activeFilters.includes(filter.id)
                    return (
                      <Button
                        key={filter.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFilter(filter.id)}
                        className={cn(
                          'flex items-center space-x-2 text-xs transition-all duration-200 magnetic-btn',
                          isActive
                            ? 'bg-blue-500/20 text-blue-300 pulse-glow'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        )}
                      >
                        <filter.icon className="w-3 h-3" />
                        <span>{filter.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {showSuggestions && (
              <div className="max-h-64 overflow-y-auto">
                {searchTerm ? (
                  filteredSuggestions.length > 0 ? (
                    <div className="p-2">
                      <h4 className="text-xs font-medium text-gray-400 px-2 py-1 mb-1">Sugestões</h4>
                      {filteredSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-white/5 rounded-lg transition-all duration-200 fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="p-1 rounded bg-white/10">
                            <suggestion.icon className="w-3 h-3 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-white">{suggestion.text}</p>
                            <p className="text-xs text-gray-400">{suggestion.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma sugestão encontrada</p>
                    </div>
                  )
                ) : (
                  <div className="p-2">
                    <h4 className="text-xs font-medium text-gray-400 px-2 py-1 mb-1">Populares</h4>
                    {suggestions.slice(0, 4).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-white/5 rounded-lg transition-all duration-200 fade-in-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="p-1 rounded bg-white/10">
                          <suggestion.icon className="w-3 h-3 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white">{suggestion.text}</p>
                          <p className="text-xs text-gray-400">{suggestion.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SmartSearch