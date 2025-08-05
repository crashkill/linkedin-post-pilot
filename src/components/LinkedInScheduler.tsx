import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Send, X, CheckCircle, AlertCircle } from 'lucide-react'
import { linkedinService } from '../services/linkedinService'
import { toast } from 'sonner'

interface ScheduledPost {
  id: string
  content: string
  image_url?: string
  linkedin_scheduled_for: string
  status: string
  created_at: string
}

interface LinkedInSchedulerProps {
  onRefresh?: () => void
}

const LinkedInScheduler: React.FC<LinkedInSchedulerProps> = ({ onRefresh }) => {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadScheduledPosts()
  }, [])

  const loadScheduledPosts = async () => {
    try {
      setLoading(true)
      const posts = await linkedinService.getScheduledPosts()
      setScheduledPosts(posts || [])
    } catch (error) {
      console.error('Erro ao carregar posts agendados:', error)
      toast.error('Erro ao carregar posts agendados')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSchedule = async (postId: string) => {
    try {
      setProcessing(postId)
      await linkedinService.cancelSchedule(postId)
      toast.success('Agendamento cancelado com sucesso')
      await loadScheduledPosts()
      onRefresh?.()
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error)
      toast.error('Erro ao cancelar agendamento')
    } finally {
      setProcessing(null)
    }
  }

  const handlePublishNow = async (postId: string, content: string, imageUrl?: string) => {
    try {
      setProcessing(postId)
      await linkedinService.publishPost(postId, content, imageUrl)
      toast.success('Post publicado com sucesso no LinkedIn!')
      await loadScheduledPosts()
      onRefresh?.()
    } catch (error) {
      console.error('Erro ao publicar post:', error)
      toast.error('Erro ao publicar post no LinkedIn')
    } finally {
      setProcessing(null)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const isOverdue = (scheduledFor: string) => {
    return new Date(scheduledFor) < new Date()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Posts Agendados</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Posts Agendados</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {scheduledPosts.length}
          </span>
        </div>
        <button
          onClick={loadScheduledPosts}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Atualizar
        </button>
      </div>

      {scheduledPosts.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhum post agendado</p>
          <p className="text-gray-400 text-xs mt-1">
            Agende posts para publicação automática no LinkedIn
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {scheduledPosts.map((post) => {
            const { date, time } = formatDateTime(post.linkedin_scheduled_for)
            const overdue = isOverdue(post.linkedin_scheduled_for)
            
            return (
              <div
                key={post.id}
                className={`border rounded-lg p-4 ${
                  overdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`flex items-center gap-1 text-sm ${
                        overdue ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {overdue ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                        <span className="font-medium">{date}</span>
                        <span>às {time}</span>
                        {overdue && (
                          <span className="text-red-600 font-medium ml-2">
                            (Atrasado)
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-900 text-sm mb-3 line-clamp-3">
                      {post.content}
                    </p>
                    
                    {post.image_url && (
                      <div className="mb-3">
                        <img
                          src={post.image_url}
                          alt="Imagem do post"
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handlePublishNow(post.id, post.content, post.image_url)}
                      disabled={processing === post.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {processing === post.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      Publicar Agora
                    </button>
                    
                    <button
                      onClick={() => handleCancelSchedule(post.id)}
                      disabled={processing === post.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LinkedInScheduler