#!/usr/bin/env node

/**
 * Script para corrigir políticas RLS do Supabase Storage
 * Executa a Edge Function fix-storage-policies
 */

const { createClient } = require('@supabase/supabase-js');

async function fixStoragePolicies() {
  try {
    console.log('🔧 Corrigindo políticas RLS do Supabase Storage...');
    
    // Configurar cliente Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('❌ Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fazer login como usuário de teste
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'fabriciocardosolima@gmail.com',
      password: '123456'
    });
    
    if (authError) {
      throw new Error(`❌ Erro na autenticação: ${authError.message}`);
    }
    
    console.log('✅ Usuário autenticado com sucesso');
    
    // Chamar Edge Function para corrigir as políticas
    const { data, error } = await supabase.functions.invoke('fix-storage-policies', {
      body: {}
    });
    
    if (error) {
      throw new Error(`❌ Erro na Edge Function: ${error.message}`);
    }
    
    console.log('✅ Resposta da Edge Function:', data);
    
    if (data.success) {
      console.log('🎉 Políticas RLS corrigidas com sucesso!');
      console.log('🔐 Novas políticas aplicadas:');
      data.policies.forEach(policy => {
        console.log(`   - ${policy}`);
      });
      console.log('📝 Nota:', data.note);
    } else {
      throw new Error(`❌ Falha na correção: ${data.error || 'Erro desconhecido'}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixStoragePolicies();
}

module.exports = { fixStoragePolicies };