import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
}

interface LinkedInAuthRequest {
  action: 'authorize' | 'callback' | 'disconnect' | 'auto_connect'
  code?: string
  state?: string
  redirectUri?: string
}

interface LinkedInTokenResponse {
  access_token: string
  expires_in: number
  scope: string
}

interface LinkedInProfile {
  id: string
  firstName: {
    localized: Record<string, string>
  }
  lastName: {
    localized: Record<string, string>
  }
  profilePicture?: {
    'displayImage~': {
      elements: Array<{
        identifiers: Array<{
          identifier: string
        }>
      }>
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verificar se estamos em ambiente local (desenvolvimento)
    const isLocal = Deno.env.get('SUPABASE_URL')?.includes('127.0.0.1') || 
                   Deno.env.get('SUPABASE_URL')?.includes('localhost')
    
    let user = null
    
    if (!isLocal) {
      // Verificar autenticação apenas em produção
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

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )

      if (authError || !authUser) {
        return new Response(
          JSON.stringify({ error: 'Token inválido' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      user = authUser
    } else {
      console.log('🔧 Running in local mode - skipping auth for linkedin-auth')
    }

    // Parse request body
    const { action, code, state, redirectUri }: LinkedInAuthRequest = await req.json()

    // Validar parâmetros obrigatórios
    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Ação não especificada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const clientId = Deno.env.get('LINKEDIN_CLIENT_ID')
    const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET')
    const defaultRedirectUri = Deno.env.get('LINKEDIN_REDIRECT_URI') || 'http://localhost:8080/auth/linkedin/callback'

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: 'Configuração LinkedIn não encontrada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    switch (action) {
      case 'authorize': {
        // Gerar URL de autorização LinkedIn
        const scopes = 'r_liteprofile r_emailaddress w_member_social'
        const stateParam = state || crypto.randomUUID()
        const finalRedirectUri = redirectUri || defaultRedirectUri
        
        const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
        authUrl.searchParams.set('response_type', 'code')
        authUrl.searchParams.set('client_id', clientId)
        authUrl.searchParams.set('redirect_uri', finalRedirectUri)
        authUrl.searchParams.set('state', stateParam)
        authUrl.searchParams.set('scope', scopes)

        return new Response(
          JSON.stringify({ 
            authUrl: authUrl.toString(),
            state: stateParam
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      case 'callback': {
        if (!code) {
          return new Response(
            JSON.stringify({ error: 'Código de autorização não fornecido' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Trocar código por token de acesso
        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri || defaultRedirectUri,
            client_id: clientId,
            client_secret: clientSecret
          })
        })

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.text()
          console.error('Erro ao obter token LinkedIn:', errorData)
          return new Response(
            JSON.stringify({ error: 'Falha ao obter token de acesso' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const tokenData: LinkedInTokenResponse = await tokenResponse.json()

        // Obter perfil do usuário
        const profileResponse = await fetch('https://api.linkedin.com/v2/people/~?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        })

        if (!profileResponse.ok) {
          console.error('Erro ao obter perfil LinkedIn:', await profileResponse.text())
          return new Response(
            JSON.stringify({ error: 'Falha ao obter perfil do usuário' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const profileData: LinkedInProfile = await profileResponse.json()

        // Salvar dados de integração no banco
        const { error: insertError } = await supabase
          .from('linkedin_integrations')
          .upsert({
            user_id: user.id,
            linkedin_id: profileData.id,
            access_token: tokenData.access_token,
            expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
            scope: tokenData.scope,
            profile_data: {
              firstName: profileData.firstName.localized,
              lastName: profileData.lastName.localized,
              profilePicture: profileData.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier
            },
            connected_at: new Date().toISOString(),
            is_active: true
          })

        if (insertError) {
          console.error('Erro ao salvar integração LinkedIn:', insertError)
          return new Response(
            JSON.stringify({ error: 'Falha ao salvar dados de integração' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            profile: {
              id: profileData.id,
              name: `${Object.values(profileData.firstName.localized)[0]} ${Object.values(profileData.lastName.localized)[0]}`,
              profilePicture: profileData.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier
            }
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      case 'auto_connect': {
        // Auto-conectar usando ACCESS_TOKEN do Doppler
        const accessToken = Deno.env.get('LINKEDIN_ACCESS_TOKEN')
        
        if (!accessToken) {
          return new Response(
            JSON.stringify({ error: 'ACCESS_TOKEN do LinkedIn não encontrado no Doppler' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Verificar se já existe integração ativa
        const { data: existingIntegration } = await supabase
          .from('linkedin_integrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        if (existingIntegration) {
          return new Response(
            JSON.stringify({ 
              success: true,
              message: 'Integração LinkedIn já existe',
              profile: existingIntegration.profile_data
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Obter perfil do usuário usando ACCESS_TOKEN
        const profileResponse = await fetch('https://api.linkedin.com/v2/people/~?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })

        if (!profileResponse.ok) {
          console.error('Erro ao obter perfil LinkedIn com ACCESS_TOKEN:', await profileResponse.text())
          return new Response(
            JSON.stringify({ error: 'Falha ao obter perfil do usuário com ACCESS_TOKEN' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const profileData: LinkedInProfile = await profileResponse.json()

        // Salvar dados de integração no banco
        const { error: insertError } = await supabase
          .from('linkedin_integrations')
          .insert({
            user_id: user.id,
            linkedin_id: profileData.id,
            access_token: accessToken,
            expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 dias
            scope: 'r_liteprofile r_emailaddress w_member_social',
            profile_data: {
              firstName: profileData.firstName.localized,
              lastName: profileData.lastName.localized,
              profilePicture: profileData.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier
            },
            connected_at: new Date().toISOString(),
            is_active: true
          })

        if (insertError) {
          console.error('Erro ao salvar integração LinkedIn automática:', insertError)
          return new Response(
            JSON.stringify({ error: 'Falha ao salvar dados de integração automática' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Auto-conexão LinkedIn realizada com sucesso',
            profile: {
              id: profileData.id,
              name: `${Object.values(profileData.firstName.localized)[0]} ${Object.values(profileData.lastName.localized)[0]}`,
              profilePicture: profileData.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier
            }
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      case 'disconnect': {
        // Desconectar conta LinkedIn
        const { error: updateError } = await supabase
          .from('linkedin_integrations')
          .update({ 
            is_active: false,
            disconnected_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Erro ao desconectar LinkedIn:', updateError)
          return new Response(
            JSON.stringify({ error: 'Falha ao desconectar conta' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true }),
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
    console.error('Erro na autenticação LinkedIn:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})