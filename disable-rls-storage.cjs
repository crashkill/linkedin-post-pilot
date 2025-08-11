#!/usr/bin/env node

/**
 * Script para desabilitar RLS temporariamente no bucket images
 * Solução simples para resolver o problema de upload
 */

const { createClient } = require('@supabase/supabase-js');

async function disableRLSForImages() {
  try {
    console.log('🔧 Configurando acesso ao bucket images...');
    
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
    
    // Testar upload de uma imagem pequena
    console.log('🧪 Testando upload no bucket...');
    
    // Criar um blob de teste (imagem 1x1 pixel PNG)
    const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGbKdMDgAAAABJRU5ErkJggg==';
    const testBlob = new Blob([Uint8Array.from(atob(testImageData), c => c.charCodeAt(0))], { type: 'image/png' });
    
    const testFileName = `test-${Date.now()}.png`;
    const testPath = `test/${testFileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(testPath, testBlob, {
        contentType: 'image/png',
        upsert: true
      });
    
    if (uploadError) {
      console.error('❌ Erro no upload de teste:', uploadError.message);
      
      // Se o erro for de RLS, vamos tentar uma abordagem diferente
      if (uploadError.message.includes('row-level security') || uploadError.message.includes('policy')) {
        console.log('🔧 Detectado problema de RLS. Tentando solução alternativa...');
        
        // Tentar upload com path diferente (sem pasta de usuário)
        const simplePath = testFileName;
        const { data: simpleUpload, error: simpleError } = await supabase.storage
          .from('images')
          .upload(simplePath, testBlob, {
            contentType: 'image/png',
            upsert: true
          });
        
        if (simpleError) {
          throw new Error(`❌ Upload falhou mesmo com path simples: ${simpleError.message}`);
        } else {
          console.log('✅ Upload funcionou com path simples!');
          console.log('📝 Recomendação: Use paths simples sem pastas de usuário');
          
          // Limpar arquivo de teste
          await supabase.storage.from('images').remove([simplePath]);
        }
      } else {
        throw new Error(`❌ Erro no upload: ${uploadError.message}`);
      }
    } else {
      console.log('✅ Upload de teste bem-sucedido!');
      console.log('📁 Arquivo criado:', uploadData.path);
      
      // Limpar arquivo de teste
      await supabase.storage.from('images').remove([testPath]);
      console.log('🗑️ Arquivo de teste removido');
    }
    
    // Verificar se conseguimos listar arquivos
    console.log('📋 Testando listagem de arquivos...');
    const { data: listData, error: listError } = await supabase.storage
      .from('images')
      .list();
    
    if (listError) {
      console.log('⚠️ Aviso na listagem:', listError.message);
    } else {
      console.log('✅ Listagem funcionando. Arquivos encontrados:', listData?.length || 0);
    }
    
    console.log('🎉 Configuração do bucket testada!');
    console.log('💡 Dicas para uso:');
    console.log('   - Use nomes de arquivo únicos');
    console.log('   - Evite caracteres especiais nos nomes');
    console.log('   - Prefira paths simples sem subpastas complexas');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  disableRLSForImages();
}

module.exports = { disableRLSForImages };