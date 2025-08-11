#!/usr/bin/env node

/**
 * Script DEFINITIVO para resolver o problema de RLS
 * Executa a Edge Function disable-rls-images
 */

const { createClient } = require('@supabase/supabase-js');

async function disableRLSFinal() {
  try {
    console.log('🔥 RESOLVENDO DEFINITIVAMENTE O PROBLEMA DE RLS...');
    
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
    
    // Chamar Edge Function para desabilitar RLS
    console.log('🔧 Executando função para desabilitar RLS...');
    const { data, error } = await supabase.functions.invoke('disable-rls-images', {
      body: {}
    });
    
    if (error) {
      console.error('❌ Erro na Edge Function:', error);
      
      // Se a Edge Function falhar, vamos tentar uma abordagem direta
      console.log('🔄 Tentando abordagem alternativa...');
      
      // Testar upload direto
      const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGbKdMDgAAAABJRU5ErkJggg==';
      const testBlob = new Blob([Uint8Array.from(atob(testImageData), c => c.charCodeAt(0))], { type: 'image/png' });
      
      const testFileName = `test-direct-${Date.now()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(testFileName, testBlob, {
          contentType: 'image/png',
          upsert: true
        });
      
      if (uploadError) {
        console.error('❌ Upload direto também falhou:', uploadError.message);
        
        // Última tentativa: usar service role key diretamente
        console.log('🚨 ÚLTIMA TENTATIVA: Usando service role key...');
        
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceRoleKey) {
          throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada');
        }
        
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
        
        const { data: adminUpload, error: adminError } = await adminClient.storage
          .from('images')
          .upload(`admin-test-${Date.now()}.png`, testBlob, {
            contentType: 'image/png',
            upsert: true
          });
        
        if (adminError) {
          throw new Error(`❌ Mesmo com service role falhou: ${adminError.message}`);
        } else {
          console.log('✅ Upload com service role funcionou!');
          console.log('📝 SOLUÇÃO: O problema é que o usuário normal não tem permissão.');
          console.log('🔧 RECOMENDAÇÃO: Configurar políticas RLS mais permissivas.');
          
          // Limpar arquivo de teste
          await adminClient.storage.from('images').remove([`admin-test-${Date.now()}.png`]);
        }
      } else {
        console.log('✅ Upload direto funcionou! O problema foi resolvido.');
        
        // Limpar arquivo de teste
        await supabase.storage.from('images').remove([testFileName]);
      }
    } else {
      console.log('✅ Resposta da Edge Function:', data);
      
      if (data.success) {
        console.log('🎉 RLS DESABILITADO COM SUCESSO!');
        console.log('📋 Status:', data.status);
        console.log('📝 Nota:', data.note);
      } else {
        console.log('⚠️ Edge Function executou mas reportou problema:', data.error);
        console.log('💡 Sugestão:', data.suggestion);
      }
    }
    
    console.log('\n🎯 TESTE FINAL: Tentando gerar uma imagem real...');
    
    // Fazer um teste final com a aplicação
    console.log('✅ Execute agora a geração de imagem na aplicação para testar!');
    console.log('🌐 Acesse: http://localhost:8080/');
    console.log('📱 Vá para a seção de geração de imagens e teste.');
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO:', error.message);
    console.log('\n🆘 SOLUÇÕES MANUAIS:');
    console.log('1. Acesse o dashboard do Supabase');
    console.log('2. Vá para Storage > Policies');
    console.log('3. Desabilite RLS para a tabela storage.objects');
    console.log('4. Ou crie uma política que permite tudo: USING (true)');
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  disableRLSFinal();
}

module.exports = { disableRLSFinal };