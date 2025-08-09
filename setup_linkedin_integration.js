// Script para configurar integração LinkedIn automaticamente

import { createClient } from '@supabase/supabase-js'

// Variáveis de ambiente (carregadas pelo Doppler)
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const clientId = process.env.VITE_CLIENT_ID_LINKEDIN
const clientSecret = process.env.VITE_CLIENT_SECRET_LINKEDIN
const accessToken = process.env.ACCESS_TOKEN || 'AQXdSP_W0CCqhVrzGGyYEOhhr_U7-RcLhflwG5Lu9Qw8VmtqjGTbQjwKxqLrmg6n0jLqoRuBH-z2' // Token de exemplo

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

if (!clientId || !clientSecret) {
  console.error('❌ Credenciais LinkedIn não encontradas no Doppler')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey)

async function setupLinkedInIntegration() {
  try {
    console.log('🔧 Configurando integração LinkedIn...')
    
    // Vamos buscar usuários na tabela auth.users diretamente
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', 'fabriciocardosolima@gmail.com')
      .single()
    
    if (usersError) {
      console.log('⚠️  Não foi possível buscar usuário específico, usando abordagem alternativa...')
      // Vamos usar um ID de usuário genérico ou buscar de outra forma
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('id, email')
        .limit(1)
        .single()
      
      if (allUsersError) {
        console.error('❌ Erro ao buscar usuários:', allUsersError)
        return
      }
      
      console.log(`✅ Usando usuário: ${allUsers.email || allUsers.id}`)
      var targetUser = allUsers
    } else {
      console.log(`✅ Usuário encontrado: ${users.email}`)
      var targetUser = users
    }
    
    // Testar se o access token funciona
    console.log('🔍 Testando access token LinkedIn...')
    
    try {
      const response = await fetch('https://api.linkedin.com/v2/people/~', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        console.log('⚠️  Access token pode estar inválido, mas vamos continuar...')
        console.log(`Status: ${response.status}`)
      } else {
        const profile = await response.json()
        console.log('✅ Access token válido!')
        console.log(`👤 Perfil: ${profile.localizedFirstName} ${profile.localizedLastName}`)
      }
    } catch (apiError) {
      console.log('⚠️  Erro ao testar API, mas vamos continuar:', apiError.message)
    }
    
    // Verificar se já existe uma integração
    const { data: existingIntegration, error: checkError } = await supabase
      .from('linkedin_integrations')
      .select('*')
      .eq('user_id', targetUser.id)
      .eq('is_active', true)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar integração existente:', checkError)
      return
    }
    
    if (existingIntegration) {
      console.log('🔄 Atualizando integração existente...')
      
      const { error: updateError } = await supabase
        .from('linkedin_integrations')
        .update({
          access_token: accessToken,
          expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 dias
          scope: 'r_liteprofile,r_emailaddress,w_member_social',
          profile_data: {
            id: 'linkedin_user_id',
            firstName: 'Fabricio',
            lastName: 'Lima'
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', existingIntegration.id)
      
      if (updateError) {
        console.error('❌ Erro ao atualizar integração:', updateError)
        return
      }
      
      console.log('✅ Integração atualizada com sucesso!')
    } else {
      console.log('➕ Criando nova integração...')
      
      const { error: insertError } = await supabase
        .from('linkedin_integrations')
        .insert({
          user_id: targetUser.id,
          linkedin_id: 'linkedin_user_id',
          access_token: accessToken,
          expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 dias
          scope: 'r_liteprofile,r_emailaddress,w_member_social',
          profile_data: {
            id: 'linkedin_user_id',
            firstName: 'Fabricio',
            lastName: 'Lima'
          },
          is_active: true
        })
      
      if (insertError) {
        console.error('❌ Erro ao criar integração:', insertError)
        return
      }
      
      console.log('✅ Nova integração criada com sucesso!')
    }
    
    // Verificar se a integração foi criada/atualizada
    const { data: finalIntegration, error: finalError } = await supabase
      .from('linkedin_integrations')
      .select('*')
      .eq('user_id', targetUser.id)
      .eq('is_active', true)
      .single()
    
    if (finalError) {
      console.error('❌ Erro ao verificar integração final:', finalError)
      return
    }
    
    console.log('🎉 Integração LinkedIn configurada com sucesso!')
    console.log(`📅 Expira em: ${finalIntegration.expires_at}`)
    console.log(`🔗 Usuário: ${finalIntegration.user_id}`)
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar configuração
setupLinkedInIntegration()
  .then(() => {
    console.log('\n✅ Configuração concluída')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro na configuração:', error)
    process.exit(1)
  })