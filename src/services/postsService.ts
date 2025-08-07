// Serviço de Posts para integração com Supabase
// Gerencia todas as operações CRUD dos posts

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export interface Post {
  id?: string
  user_id?: string
  title: string
  content: string
  category: string
  status: 'draft' | 'scheduled' | 'published'
  scheduled_for?: string
  image_url?: string
  hashtags?: string[]
  engagement_metrics?: {
    likes: number
    comments: number
    shares: number
    views: number
  }
  created_at?: string
  updated_at?: string
}

export interface CreatePostData {
  title: string
  content: string
  category: string
  status?: 'draft' | 'scheduled' | 'published'
  scheduled_for?: string
  image_url?: string
  hashtags?: string[]
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string
}

class PostsService {
  // Criar um novo post
  async createPost(postData: CreatePostData): Promise<Post> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        ...postData,
        user_id: user.id,
        status: postData.status || 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar post:', error)
      throw new Error(`Erro ao criar post: ${error.message}`)
    }

    return data
  }

  // Buscar todos os posts do usuário
  async getUserPosts(): Promise<Post[]> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar posts:', error)
      throw new Error(`Erro ao buscar posts: ${error.message}`)
    }

    return data || []
  }

  // Buscar post por ID
  async getPostById(id: string): Promise<Post | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Post não encontrado
      }
      console.error('Erro ao buscar post:', error)
      throw new Error(`Erro ao buscar post: ${error.message}`)
    }

    return data
  }

  // Atualizar post
  async updatePost(updateData: UpdatePostData): Promise<Post> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { id, ...postData } = updateData

    const { data, error } = await supabase
      .from('posts')
      .update({
        ...postData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar post:', error)
      throw new Error(`Erro ao atualizar post: ${error.message}`)
    }

    return data
  }

  // Deletar post
  async deletePost(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao deletar post:', error)
      throw new Error(`Erro ao deletar post: ${error.message}`)
    }
  }

  // Buscar posts por status
  async getPostsByStatus(status: 'draft' | 'scheduled' | 'published'): Promise<Post[]> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar posts por status:', error)
      throw new Error(`Erro ao buscar posts por status: ${error.message}`)
    }

    return data || []
  }

  // Buscar posts por categoria
  async getPostsByCategory(category: string): Promise<Post[]> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar posts por categoria:', error)
      throw new Error(`Erro ao buscar posts por categoria: ${error.message}`)
    }

    return data || []
  }

  // Atualizar métricas de engajamento
  async updateEngagementMetrics(
    id: string, 
    metrics: { likes?: number; comments?: number; shares?: number; views?: number }
  ): Promise<Post> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Primeiro, buscar as métricas atuais
    const currentPost = await this.getPostById(id)
    if (!currentPost) {
      throw new Error('Post não encontrado')
    }

    const updatedMetrics = {
      ...currentPost.engagement_metrics,
      ...metrics
    }

    const { data, error } = await supabase
      .from('posts')
      .update({
        engagement_metrics: updatedMetrics,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar métricas:', error)
      throw new Error(`Erro ao atualizar métricas: ${error.message}`)
    }

    return data
  }

  // Buscar estatísticas do usuário
  async getUserStats(): Promise<{
    totalPosts: number
    draftPosts: number
    scheduledPosts: number
    publishedPosts: number
    totalEngagement: {
      likes: number
      comments: number
      shares: number
      views: number
    }
  }> {
    const posts = await this.getUserPosts()
    
    const stats = {
      totalPosts: posts.length,
      draftPosts: posts.filter(p => p.status === 'draft').length,
      scheduledPosts: posts.filter(p => p.status === 'scheduled').length,
      publishedPosts: posts.filter(p => p.status === 'published').length,
      totalEngagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0
      }
    }

    // Calcular engajamento total
    posts.forEach(post => {
      if (post.engagement_metrics) {
        stats.totalEngagement.likes += post.engagement_metrics.likes || 0
        stats.totalEngagement.comments += post.engagement_metrics.comments || 0
        stats.totalEngagement.shares += post.engagement_metrics.shares || 0
        stats.totalEngagement.views += post.engagement_metrics.views || 0
      }
    })

    return stats
  }

  // Buscar posts recentes (últimos 5)
  async getRecentPosts(): Promise<Post[]> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Erro ao buscar posts recentes:', error)
      throw new Error(`Erro ao buscar posts recentes: ${error.message}`)
    }

    return data || []
  }
}

// Exportar instância única do serviço
export const postsService = new PostsService()
export default postsService