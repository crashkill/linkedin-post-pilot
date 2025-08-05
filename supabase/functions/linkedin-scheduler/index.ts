import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
}

interface SchedulerRequest {
  action: 'check_pending' | 'schedule_post' | 'cancel_schedule'
  postId?: string
  scheduledFor?: string
}

interface PendingPost {
  id: string
  user_id: string
  content: string
  image_url?: string
  scheduled_for: string
  linkedin_scheduled_for: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Para ações de cron job, não precisamos de autenticação de usuário
    if (req.method === 'GET' || req.url.includes('check_pending')) {
      // Verificar posts pendentes para publicação
      const now = new Date().toISOString()
      
      const { data: pendingPosts, error: fetchError } = await supabaseAdmin
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          image_url,
          scheduled_for,
          linkedin_scheduled_for
        `)
        .eq('status', 'scheduled')
        .eq('published_to_linkedin', false)
        .not('linkedin_scheduled_for', 'is', null)
        .lte('linkedin_scheduled_for', now)
        .limit(10)

      if (fetchError) {
        console.error('Erro ao buscar posts pendentes:', fetchError)
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar posts pendentes' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!pendingPosts || pendingPosts.length === 0) {
        return new Response(
          JSON.stringify({ 
            message: 'Nenhum post pendente para publicação',
            processed: 0
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const results = []
      
      // Processar cada post pendente
      for (const post of pendingPosts as PendingPost[]) {
        try {
          // Obter integração LinkedIn do usuário
          const { data: integration, error: integrationError } = await supabaseAdmin
            .from('linkedin_integrations')
            .select('*')
            .eq('user_id', post.user_id)
            .eq('is_active', true)
            .single()

          if (integrationError || !integration) {
            console.error(`Usuário ${post.user_id} não tem integração LinkedIn ativa`)
            
            // Marcar post como falha
            await supabaseAdmin
              .from('posts')
              .update({ 
                status: 'failed',
                error_message: 'Conta LinkedIn não conectada'
              })
              .eq('id', post.id)
            
            results.push({
              postId: post.id,
              status: 'failed',
              error: 'Conta LinkedIn não conectada'
            })
            continue
          }

          // Verificar se o token não expirou
          if (new Date(integration.expires_at) <= new Date()) {
            console.error(`Token LinkedIn do usuário ${post.user_id} expirado`)
            
            // Marcar post como falha
            await supabaseAdmin
              .from('posts')
              .update({ 
                status: 'failed',
                error_message: 'Token LinkedIn expirado'
              })
              .eq('id', post.id)
            
            results.push({
              postId: post.id,
              status: 'failed',
              error: 'Token LinkedIn expirado'
            })
            continue
          }

          // Chamar a função de publicação
          const publishResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/linkedin-publish`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${integration.access_token}`,
              'Content-Type': 'application/json',
              'apikey': Deno.env.get('SUPABASE_ANON_KEY') ?? ''
            },
            body: JSON.stringify({
              action: 'publish',
              postId: post.id,
              content: post.content,
              imageUrl: post.image_url
            })
          })

          if (publishResponse.ok) {
            const publishData = await publishResponse.json()
            results.push({
              postId: post.id,
              status: 'published',
              linkedinPostId: publishData.linkedinPostId
            })
          } else {
            const errorData = await publishResponse.text()
            console.error(`Erro ao publicar post ${post.id}:`, errorData)
            
            // Marcar post como falha
            await supabaseAdmin
              .from('posts')
              .update({ 
                status: 'failed',
                error_message: 'Falha na publicação no LinkedIn'
              })
              .eq('id', post.id)
            
            results.push({
              postId: post.id,
              status: 'failed',
              error: 'Falha na publicação no LinkedIn'
            })
          }
        } catch (error) {
          console.error(`Erro ao processar post ${post.id}:`, error)
          
          // Marcar post como falha
          await supabaseAdmin
            .from('posts')
            .update({ 
              status: 'failed',
              error_message: 'Erro interno no processamento'
            })
            .eq('id', post.id)
          
          results.push({
            postId: post.id,
            status: 'failed',
            error: 'Erro interno no processamento'
          })
        }
      }

      return new Response(
        JSON.stringify({ 
          message: `Processados ${results.length} posts`,
          processed: results.length,
          results
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Para outras ações, verificar autenticação
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

    const { action, postId, scheduledFor }: SchedulerRequest = await req.json()

    switch (action) {
      case 'schedule_post': {
        if (!postId || !scheduledFor) {
          return new Response(
            JSON.stringify({ error: 'ID do post e data de agendamento são obrigatórios' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Validar data de agendamento
        const scheduleDate = new Date(scheduledFor)
        const now = new Date()
        
        if (scheduleDate <= now) {
          return new Response(
            JSON.stringify({ error: 'Data de agendamento deve ser no futuro' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Atualizar post com agendamento
        const { error: updateError } = await supabase
          .from('posts')
          .update({
            status: 'scheduled',
            linkedin_scheduled_for: scheduledFor
          })
          .eq('id', postId)
          .eq('user_id', user.id)

        if (updateError) {
          return new Response(
            JSON.stringify({ error: 'Erro ao agendar post' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Post agendado com sucesso',
            scheduledFor
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'cancel_schedule': {
        if (!postId) {
          return new Response(
            JSON.stringify({ error: 'ID do post é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Cancelar agendamento
        const { error: updateError } = await supabase
          .from('posts')
          .update({
            status: 'draft',
            linkedin_scheduled_for: null
          })
          .eq('id', postId)
          .eq('user_id', user.id)
          .eq('status', 'scheduled')

        if (updateError) {
          return new Response(
            JSON.stringify({ error: 'Erro ao cancelar agendamento' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Agendamento cancelado com sucesso'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Ação não suportada' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Erro no agendador LinkedIn:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})