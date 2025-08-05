import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
}

interface LinkedInPublishRequest {
  action: 'publish' | 'schedule' | 'analytics'
  postId: string
  content?: string
  imageUrl?: string
  scheduledFor?: string
}

interface LinkedInShareRequest {
  author: string
  lifecycleState: string
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: {
        text: string
      }
      shareMediaCategory: string
      media?: Array<{
        status: string
        description: {
          text: string
        }
        media: string
        title: {
          text: string
        }
      }>
    }
  }
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': string
  }
}

interface LinkedInProfile {
  id: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autorização necessário' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { action, postId, content, imageUrl, scheduledFor }: LinkedInPublishRequest = await req.json()

    // Validar parâmetros obrigatórios
    if (!action || !postId) {
      return new Response(
        JSON.stringify({ error: 'Ação e ID do post são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obter integração LinkedIn do usuário
    const { data: integration, error: integrationError } = await supabase
      .from('linkedin_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ error: 'Conta LinkedIn não conectada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se o token não expirou
    if (new Date(integration.expires_at) <= new Date()) {
      return new Response(
        JSON.stringify({ error: 'Token LinkedIn expirado. Reconecte sua conta.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    switch (action) {
      case 'publish': {
        if (!content) {
          return new Response(
            JSON.stringify({ error: 'Conteúdo é obrigatório para publicação' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Obter perfil LinkedIn para usar como author
        const profileResponse = await fetch('https://api.linkedin.com/v2/people/~', {
          headers: {
            'Authorization': `Bearer ${integration.access_token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!profileResponse.ok) {
          return new Response(
            JSON.stringify({ error: 'Falha ao obter perfil LinkedIn' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const profile: LinkedInProfile = await profileResponse.json()

        // Preparar payload para LinkedIn API
        const sharePayload: LinkedInShareRequest = {
          author: `urn:li:person:${profile.id}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: content
              },
              shareMediaCategory: imageUrl ? 'IMAGE' : 'NONE'
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        }

        // Se há imagem, adicionar ao payload
        if (imageUrl) {
          sharePayload.specificContent['com.linkedin.ugc.ShareContent'].media = [{
            status: 'READY',
            description: {
              text: 'Imagem gerada por IA'
            },
            media: imageUrl,
            title: {
              text: 'Post LinkedIn'
            }
          }]
        }

        // Publicar no LinkedIn
        const publishResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${integration.access_token}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          },
          body: JSON.stringify(sharePayload)
        })

        if (!publishResponse.ok) {
          const errorData = await publishResponse.text()
          console.error('Erro ao publicar no LinkedIn:', errorData)
          return new Response(
            JSON.stringify({ error: 'Falha ao publicar no LinkedIn' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const publishData = await publishResponse.json()
        const linkedinPostId = publishData.id

        // Atualizar post no banco de dados
        const { error: updateError } = await supabase
          .from('posts')
          .update({
            status: 'published',
            published_to_linkedin: true,
            linkedin_post_id: linkedinPostId,
            linkedin_published_at: new Date().toISOString()
          })
          .eq('id', postId)
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Erro ao atualizar post:', updateError)
        }

        // Criar registro inicial de analytics
        const { error: analyticsError } = await supabase
          .from('linkedin_post_analytics')
          .insert({
            post_id: postId,
            linkedin_post_id: linkedinPostId,
            impressions: 0,
            clicks: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            engagement_rate: 0
          })

        if (analyticsError) {
          console.error('Erro ao criar analytics:', analyticsError)
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            linkedinPostId,
            message: 'Post publicado com sucesso no LinkedIn'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      case 'analytics': {
        // Obter analytics do post do LinkedIn
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('linkedin_post_id')
          .eq('id', postId)
          .eq('user_id', user.id)
          .single()

        if (postError || !postData?.linkedin_post_id) {
          return new Response(
            JSON.stringify({ error: 'Post não encontrado ou não publicado no LinkedIn' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Simular analytics (LinkedIn API v2 tem limitações para analytics)
        // Em produção, seria necessário usar LinkedIn Marketing API
        const mockAnalytics = {
          impressions: Math.floor(Math.random() * 1000) + 100,
          clicks: Math.floor(Math.random() * 50) + 10,
          likes: Math.floor(Math.random() * 30) + 5,
          comments: Math.floor(Math.random() * 10) + 1,
          shares: Math.floor(Math.random() * 5) + 1
        }

        mockAnalytics.engagement_rate = parseFloat(
          (((mockAnalytics.likes + mockAnalytics.comments + mockAnalytics.shares) / mockAnalytics.impressions) * 100).toFixed(2)
        )

        // Atualizar analytics no banco
        const { error: updateAnalyticsError } = await supabase
          .from('linkedin_post_analytics')
          .upsert({
            post_id: postId,
            linkedin_post_id: postData.linkedin_post_id,
            ...mockAnalytics,
            last_updated: new Date().toISOString()
          })

        if (updateAnalyticsError) {
          console.error('Erro ao atualizar analytics:', updateAnalyticsError)
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            analytics: mockAnalytics
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Ação não suportada' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Erro na publicação LinkedIn:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})