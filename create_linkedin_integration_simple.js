// Script simples para criar integração LinkedIn

import { createClient } from '@supabase/supabase-js'

// Variáveis de ambiente (carregadas pelo Doppler)
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const accessToken = 'AQXdSP_W0CCqhVrzGGyYEOhhr_U7-RcLhflwG5Lu9Qw8VmtqjGTbQjwKxqLrmg6n0jLqoRuBH-z2' // Token de exemplo

const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey)

async function createLinkedInIntegration() {
  try {
    console.log('🔧 Criando integração LinkedIn...')
    
    // Primeiro, vamos fazer login com o usuário conhecido
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'fabriciocardosolima@gmail.com',
      password: '123456'
    })
    
    if (authError) {
      console.error('❌ Erro ao fazer login:', authError)
      return
    }
    
    console.log('✅ Login realizado com sucesso!')
    console.log(`👤 Usuário: ${authData.user.email}`)
    
    // Verificar se já existe uma integração
    const { data: existingIntegration, error: checkError } = await supabase
      .from('linkedin_integrations')
      .select('*')
      .eq('user_id', authData.user.id)
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
      
      const { data: newIntegration, error: insertError } = await supabase
        .from('linkedin_integrations')
        .insert({
          user_id: authData.user.id,
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
        .select()
      
      if (insertError) {
        console.error('❌ Erro ao criar integração:', insertError)
        return
      }
      
      console.log('✅ Nova integração criada com sucesso!')
      console.log('📄 Dados da integração:', newIntegration)
    }
    
    // Verificar se a integração foi criada/atualizada
    const { data: finalIntegration, error: finalError } = await supabase
      .from('linkedin_integrations')
      .select('*')
      .eq('user_id', authData.user.id)
      .eq('is_active', true)
      .single()
    
    if (finalError) {
      console.error('❌ Erro ao verificar integração final:', finalError)
      return
    }
    
    console.log('🎉 Integração LinkedIn configurada com sucesso!')
    console.log(`📅 Expira em: ${finalIntegration.expires_at}`)
    console.log(`🔗 Usuário: ${finalIntegration.user_id}`)
    
    // Fazer logout
    await supabase.auth.signOut()
    console.log('👋 Logout realizado')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar criação
createLinkedInIntegration()
  .then(() => {
    console.log('\n✅ Criação concluída')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro na criação:', error)
    process.exit(1)
  })