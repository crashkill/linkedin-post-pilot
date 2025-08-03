import React, { useState, useEffect } from 'react'
import { Bell, X, Heart, MessageCircle, UserPlus, Briefcase } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { cn } from '../lib/utils'

const SmartNotifications = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'like',
      icon: Heart,
      title: 'Ana Silva curtiu seu post',
      message: 'sobre desenvolvimento React',
      time: '2 min',
      unread: true,
      color: 'text-red-400'
    },
    {
      id: 2,
      type: 'comment',
      icon: MessageCircle,
      title: 'João Santos comentou',
      message: 'Excelente artigo! Muito útil.',
      time: '5 min',
      unread: true,
      color: 'text-green-400'
    },
    {
      id: 3,
      type: 'connection',
      icon: UserPlus,
      title: 'Maria Oliveira quer se conectar',
      message: 'Desenvolvedora Frontend na Tech Corp',
      time: '1 h',
      unread: false,
      color: 'text-blue-400'
    },
    {
      id: 4,
      type: 'job',
      icon: Briefcase,
      title: 'Nova vaga disponível',
      message: 'Senior React Developer - RemoteWork',
      time: '3 h',
      unread: false,
      color: 'text-purple-400'
    }
  ])

  const unreadCount = notifications.filter(n => n.unread).length

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, unread: false } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, unread: false }))
    )
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-400 hover:text-white hover:bg-white/10 micro-bounce focus-ring"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center pulse-glow">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notifications Panel */}
          <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-hidden z-50 glass-effect border-white/10 bg-white/5 backdrop-blur-xl card-3d depth-shadow fade-in-up">
            <CardContent className="p-0">
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-semibold text-white gradient-text">Notificações</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs text-blue-400 hover:text-blue-300 magnetic-btn"
                    >
                      Marcar todas como lidas
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="w-6 h-6 text-gray-400 hover:text-white micro-bounce"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma notificação</p>
                  </div>
                ) : (
                  notifications.map((notification, index) => {
                    const IconComponent = notification.icon
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 border-b border-white/5 hover:bg-white/5 transition-all duration-200 cursor-pointer fade-in-up",
                          notification.unread && "bg-blue-500/5"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={cn("p-2 rounded-full bg-white/10", notification.color)}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={cn(
                                "text-sm font-medium truncate",
                                notification.unread ? "text-white" : "text-gray-300"
                              )}>
                                {notification.title}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-400">{notification.time}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeNotification(notification.id)
                                  }}
                                  className="w-4 h-4 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 truncate">
                              {notification.message}
                            </p>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 pulse-glow" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-white/10 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300 text-xs magnetic-btn"
                  >
                    Ver todas as notificações
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default SmartNotifications