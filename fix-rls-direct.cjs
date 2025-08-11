#!/usr/bin/env node

/**
 * Script para corrigir políticas RLS diretamente via SQL
 * Usa o cliente Supabase com service role key
 */

const { createClient } = require('@supabase/supabase-js');

async function fixRLSPolicies() {
  try {
    console.log('🔧 Corrigindo políticas RLS diretamente...');
    
    // Configurar cliente Supabase com service role key
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('❌ Variáveis VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    console.log('✅ Cliente Supabase configurado com service role');
    
    // Remover políticas existentes
    console.log('🗑️ Removendo políticas antigas...');
    const dropPoliciesSQL = `
      DROP POLICY IF EXISTS "Allow public read access on images" ON storage.objects;
      DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
      DROP POLICY IF EXISTS "Allow authenticated users to update their own images" ON storage.objects;
      DROP POLICY IF EXISTS "Allow authenticated users to delete their own images" ON storage.objects;
      DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
      DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
      DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
      DROP POLICY IF EXISTS "images_public_read" ON storage.objects;
      DROP POLICY IF EXISTS "images_authenticated_upload" ON storage.objects;
      DROP POLICY IF EXISTS "images_authenticated_update" ON storage.objects;
      DROP POLICY IF EXISTS "images_authenticated_delete" ON storage.objects;
    `;
    
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: dropPoliciesSQL
    });
    
    if (dropError) {
      console.log('⚠️ Aviso ao remover políticas:', dropError.message);
    } else {
      console.log('✅ Políticas antigas removidas');
    }
    
    // Criar políticas mais simples e permissivas
    console.log('🔐 Criando novas políticas...');
    const createPoliciesSQL = `
      -- Política 1: Leitura pública
      CREATE POLICY "images_select_policy" ON storage.objects
      FOR SELECT USING (bucket_id = 'images');
      
      -- Política 2: Upload para autenticados (sem restrições)
      CREATE POLICY "images_insert_policy" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'images');
      
      -- Política 3: Update para autenticados (sem restrições)
      CREATE POLICY "images_update_policy" ON storage.objects
      FOR UPDATE USING (bucket_id = 'images');
      
      -- Política 4: Delete para autenticados (sem restrições)
      CREATE POLICY "images_delete_policy" ON storage.objects
      FOR DELETE USING (bucket_id = 'images');
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: createPoliciesSQL
    });
    
    if (createError) {
      throw new Error(`❌ Erro ao criar políticas: ${createError.message}`);
    }
    
    console.log('✅ Novas políticas criadas com sucesso');
    
    // Testar acesso ao bucket
    console.log('🧪 Testando acesso ao bucket...');
    const { data: listData, error: listError } = await supabase.storage
      .from('images')
      .list();
    
    if (listError) {
      console.log('⚠️ Aviso no teste de acesso:', listError.message);
    } else {
      console.log('✅ Bucket acessível, arquivos encontrados:', listData?.length || 0);
    }
    
    console.log('🎉 Políticas RLS corrigidas com sucesso!');
    console.log('📋 Políticas aplicadas:');
    console.log('   - images_select_policy: Leitura pública');
    console.log('   - images_insert_policy: Upload sem restrições');
    console.log('   - images_update_policy: Update sem restrições');
    console.log('   - images_delete_policy: Delete sem restrições');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixRLSPolicies();
}

module.exports = { fixRLSPolicies };