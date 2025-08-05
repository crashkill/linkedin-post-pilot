import React, { useState, useEffect } from 'react'
import { BarChart3, Eye, MousePointer, Heart, MessageCircle, Share2, TrendingUp, RefreshCw } from 'lucide-react'
import { linkedinService } from '../services/linkedinService'
import { toast } from 'sonner'

interface PostAnalytics {
  post_id: string
  linkedin_post_id: string
  impressions: number
  clicks: number
  likes: number
  comments: number
  shares: number
  engagement_rate: number
  last_updated: string
}

interface PostWithAnalytics {
  id: string
  content: string
  image_url?: string
  published_to_linkedin: boolean
  linkedin_published_at?: string
  analytics?: PostAnalytics
}

interface LinkedInAnalyticsProps {
  posts: PostWithAnalytics[]
  onRefresh?: () => void
}

const LinkedInAnalytics: React.FC<LinkedInAnalyticsProps> = ({ posts, onRefresh }) => {
  const [analytics, setAnalytics] = useState<Record<string, PostAnalytics>>({})
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState<string | null>(null)

  const linkedinPosts = posts.filter(post => post.published_to_linkedin)

  useEffect(() => {
    loadAllAnalytics()
  }, [linkedinPosts.length])

  const loadAllAnalytics = async () => {
    if (linkedinPosts.length === 0) return
    
    try {
      setLoading(true)
      const analyticsData: Record<string, PostAnalytics> = {}
      
      for (const post of linkedinPosts) {
        try {
          const data = await linkedinService.getPostAnalytics(post.id)
          if (data) {
            analyticsData[post.id] = data
          }
        } catch (error) {
          console.error(`Erro ao carregar analytics do post ${post.id}:`, error)
        }
      }
      
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
      toast.error('Erro ao carregar analytics')
    } finally {
      setLoading(false)
    }
  }

  const refreshPostAnalytics = async (postId: string) => {
    try {
      setRefreshing(postId)
      
      // Primeiro atualizar os analytics via API
      await linkedinService.publishPost(postId, '', '', 'analytics')
      
      // Depois buscar os dados atualizados
      const data = await linkedinService.getPostAnalytics(postId)
      if (data) {
        setAnalytics(prev => ({ ...prev, [postId]: data }))
        toast.success('Analytics atualizados')
      }
    } catch (error) {
      console.error('Erro ao atualizar analytics:', error)
      toast.error('Erro ao atualizar analytics')
    } finally {
      setRefreshing(null)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getTotalMetrics = () => {
    const totals = {
      impressions: 0,
      clicks: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      posts: linkedinPosts.length
    }

    Object.values(analytics).forEach(data => {
      totals.impressions += data.impressions
      totals.clicks += data.clicks
      totals.likes += data.likes
      totals.comments += data.comments
      totals.shares += data.shares
    })

    const avgEngagementRate = Object.values(analytics).length > 0
      ? Object.values(analytics).reduce((sum, data) => sum + data.engagement_rate, 0) / Object.values(analytics).length
      : 0

    return { ...totals, avgEngagementRate }
  }

  const totals = getTotalMetrics()

  if (linkedinPosts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Analytics LinkedIn</h3>
        </div>
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhum post publicado no LinkedIn</p>
          <p className="text-gray-400 text-xs mt-1">
            Publique posts no LinkedIn para ver as métricas
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Analytics LinkedIn</h3>
        </div>
        <button
          onClick={loadAllAnalytics}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Métricas Totais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Impressões</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{formatNumber(totals.impressions)}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">Curtidas</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{formatNumber(totals.likes)}</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Comentários</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{formatNumber(totals.comments)}</p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Engajamento</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">{totals.avgEngagementRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Lista de Posts com Analytics */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Posts Publicados ({totals.posts})</h4>
        
        {loading && Object.keys(analytics).length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          linkedinPosts.map((post) => {
            const postAnalytics = analytics[post.id]
            
            return (
              <div key={post.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 mb-2 line-clamp-2">
                      {post.content}
                    </p>
                    {post.linkedin_published_at && (
                      <p className="text-xs text-gray-500">
                        Publicado em {formatDate(post.linkedin_published_at)}
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => refreshPostAnalytics(post.id)}
                    disabled={refreshing === post.id}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${refreshing === post.id ? 'animate-spin' : ''}`} />
                    Atualizar
                  </button>
                </div>
                
                {postAnalytics ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Eye className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">Impressões</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatNumber(postAnalytics.impressions)}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Heart className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">Curtidas</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatNumber(postAnalytics.likes)}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <MessageCircle className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">Comentários</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatNumber(postAnalytics.comments)}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Share2 className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">Compartilhamentos</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatNumber(postAnalytics.shares)}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">Engajamento</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {postAnalytics.engagement_rate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-gray-500">Carregando analytics...</p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default LinkedInAnalytics