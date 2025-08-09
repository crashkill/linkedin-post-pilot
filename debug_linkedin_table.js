// Script para debugar tabela linkedin_integrations

import { createClient } from '@supabase/supabase-js'

// Variáveis de ambiente (carregadas pelo Doppler)
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function debugLinkedInTable() {
  try {
    console.log('🔍 Debugando tabela linkedin_integrations...')
    
    // Verificar se a tabela existe e tem dados
    console.log('\n1. Verificando todos os registros na tabela...')
    const { data: allRecords, error: allError } = await supabase
      .from('linkedin_integrations')
      .select('*')
    
    if (allError) {
      console.error('❌ Erro ao buscar todos os registros:', allError)
    } else {
      console.log(`📊 Total de registros: ${allRecords?.length || 0}`)
      if (allRecords && allRecords.length > 0) {
        allRecords.forEach((record, index) => {
          console.log(`\n📄 Registro ${index + 1}:`)
          console.log(`  ID: ${record.id}`)
          console.log(`  User ID: ${record.user_id}`)
          console.log(`  LinkedIn ID: ${record.linkedin_id}`)
          console.log(`  Ativo: ${record.is_active}`)
          console.log(`  Criado em: ${record.created_at}`)
          console.log(`  Expira em: ${record.expires_at}`)
        })
      }
    }
    
    // Verificar registros ativos especificamente
    console.log('\n2. Verificando registros ativos...')
    const { data: activeRecords, error: activeError } = await supabase
      .from('linkedin_integrations')
      .select('*')
      .eq('is_active', true)
    
    if (activeError) {
      console.error('❌ Erro ao buscar registros ativos:', activeError)
    } else {
      console.log(`📊 Registros ativos: ${activeRecords?.length || 0}`)
    }
    
    // Verificar se há problemas de RLS
    console.log('\n3. Testando com diferentes configurações...')
    
    // Tentar com anon key
    const supabaseAnon = createClient(supabaseUrl, supabaseKey)
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('linkedin_integrations')
      .select('*')
      .limit(1)
    
    if (anonError) {
      console.log('⚠️  Erro com anon key:', anonError.message)
    } else {
      console.log(`✅ Anon key funcionou: ${anonData?.length || 0} registros`)
    }
    
    // Verificar permissões da tabela
    console.log('\n4. Verificando permissões da tabela...')
    const { data: permissions, error: permError } = await supabase
      .rpc('check_table_permissions', { table_name: 'linkedin_integrations' })
      .single()
    
    if (permError) {
      console.log('⚠️  Não foi possível verificar permissões:', permError.message)
    } else {
      console.log('📋 Permissões:', permissions)
    }
    
    // Tentar inserir um registro de teste
    console.log('\n5. Testando inserção de registro...')
    const testUserId = '9d8493b3-a810-41a6-9e4a-80c2b45b787d' // ID do usuário conhecido
    
    const { data: insertData, error: insertError } = await supabase
      .from('linkedin_integrations')
      .insert({
        user_id: testUserId,
        linkedin_id: 'test_linkedin_id',
        access_token: 'test_token',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        scope: 'test_scope',
        is_active: true
      })
      .select()
    
    if (insertError) {
      console.error('❌ Erro ao inserir registro de teste:', insertError)
    } else {
      console.log('✅ Registro de teste inserido com sucesso!')
      console.log('📄 Dados inseridos:', insertData)
      
      // Limpar o registro de teste
      if (insertData && insertData.length > 0) {
        await supabase
          .from('linkedin_integrations')
          .delete()
          .eq('id', insertData[0].id)
        console.log('🧹 Registro de teste removido')
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar debug
debugLinkedInTable()
  .then(() => {
    console.log('\n✅ Debug concluído')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro no debug:', error)
    process.exit(1)
  })