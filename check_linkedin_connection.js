// Script para verificar conexão LinkedIn e diagnosticar problemas

import { createClient } from '@supabase/supabase-js'

// Variáveis de ambiente (carregadas pelo Doppler)
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

// Usar service role key para ter acesso completo
const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkLinkedInConnection() {
  try {
    console.log('🔍 Verificando conexões LinkedIn...')
    
    // Fazer login primeiro para contornar RLS
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'fabriciocardosolima@gmail.com',
      password: '123456'
    })
    
    if (authError) {
      console.error('❌ Erro ao fazer login:', authError)
      return
    }
    
    console.log('✅ Login realizado para verificação')
    
    // Verificar se existem integrações LinkedIn
    const { data: integrations, error: integrationsError } = await supabase
      .from('linkedin_integrations')
      .select('*')
      .eq('is_active', true)
    
    if (integrationsError) {
      console.error('❌ Erro ao buscar integrações:', integrationsError)
      return
    }
    
    console.log(`📊 Encontradas ${integrations?.length || 0} integrações ativas`)
    
    if (!integrations || integrations.length === 0) {
      console.log('⚠️  Nenhuma integração LinkedIn ativa encontrada')
      console.log('💡 Isso explica por que o post não foi publicado!')
      return
    }
    
    // Verificar cada integração
    for (const integration of integrations) {
      console.log(`\n🔗 Verificando integração para usuário: ${integration.user_id}`)
      console.log(`📅 Conectado em: ${integration.connected_at}`)
      console.log(`⏰ Expira em: ${integration.expires_at}`)
      
      // Verificar se o token expirou
      const now = new Date()
      const expiresAt = new Date(integration.expires_at)
      
      if (expiresAt <= now) {
        console.log('❌ Token expirado!')
        continue
      }
      
      console.log('✅ Token ainda válido')
      
      // Testar conexão com LinkedIn API
      try {
        const response = await fetch('https://api.linkedin.com/v2/people/~', {
          headers: {
            'Authorization': `Bearer ${integration.access_token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const profile = await response.json()
          console.log('✅ Conexão com LinkedIn API funcionando')
          console.log(`👤 Perfil: ${profile.localizedFirstName} ${profile.localizedLastName}`)
        } else {
          console.log('❌ Falha na conexão com LinkedIn API')
          console.log(`Status: ${response.status}`)
          const errorText = await response.text()
          console.log(`Erro: ${errorText}`)
        }
      } catch (apiError) {
        console.log('❌ Erro ao testar API LinkedIn:', apiError.message)
      }
    }
    
    // Verificar posts recentes
    console.log('\n📝 Verificando posts recentes...')
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (postsError) {
      console.error('❌ Erro ao buscar posts:', postsError)
      return
    }
    
    console.log(`📊 Encontrados ${posts?.length || 0} posts recentes`)
    
    if (posts && posts.length > 0) {
      for (const post of posts) {
        console.log(`\n📄 Post: ${post.title}`)
        console.log(`📅 Criado: ${post.created_at}`)
        console.log(`📊 Status: ${post.status}`)
        console.log(`🔗 Publicado no LinkedIn: ${post.published_to_linkedin ? 'Sim' : 'Não'}`)
        if (post.linkedin_post_id) {
          console.log(`🆔 LinkedIn Post ID: ${post.linkedin_post_id}`)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar verificação
checkLinkedInConnection()
  .then(() => {
    console.log('\n✅ Verificação concluída')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro na verificação:', error)
    process.exit(1)
  })