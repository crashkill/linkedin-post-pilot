#!/usr/bin/env node

/**
 * Script para configurar o bucket 'images' no Supabase Storage
 * Executa a Edge Function setup-storage-bucket
 */

const { createClient } = require('@supabase/supabase-js');

async function setupStorageBucket() {
  try {
    console.log('🚀 Configurando bucket de imagens no Supabase Storage...');
    
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
    
    // Chamar Edge Function para configurar o bucket
    const { data, error } = await supabase.functions.invoke('setup-storage-bucket', {
      body: {}
    });
    
    if (error) {
      throw new Error(`❌ Erro na Edge Function: ${error.message}`);
    }
    
    console.log('✅ Resposta da Edge Function:', data);
    
    if (data.success) {
      console.log('🎉 Bucket "images" configurado com sucesso!');
      console.log('📋 Configurações:');
      console.log(`   - Nome: ${data.bucket.name}`);
      console.log(`   - Público: ${data.bucket.public}`);
      console.log(`   - Limite: ${data.bucket.fileSizeLimit}`);
      console.log(`   - Tipos: ${data.bucket.allowedTypes.join(', ')}`);
      console.log('🔐 Políticas RLS criadas:');
      data.policies.forEach(policy => {
        console.log(`   - ${policy}`);
      });
    } else {
      throw new Error(`❌ Falha na configuração: ${data.error || 'Erro desconhecido'}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupStorageBucket();
}

module.exports = { setupStorageBucket };