import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Inicializar cliente Supabase com service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('🔧 Corrigindo políticas RLS do Storage...')

    // Remover políticas existentes que podem estar conflitando
    const dropPoliciesSQL = `
      -- Remover políticas existentes
      DROP POLICY IF EXISTS "Allow public read access on images" ON storage.objects;
      DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
      DROP POLICY IF EXISTS "Allow authenticated users to update their own images" ON storage.objects;
      DROP POLICY IF EXISTS "Allow authenticated users to delete their own images" ON storage.objects;
      DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
      DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
      DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
    `

    const { error: dropError } = await supabaseClient.rpc('exec_sql', {
      sql: dropPoliciesSQL
    })

    if (dropError) {
      console.log('⚠️ Erro ao remover políticas antigas (pode ser normal):', dropError.message)
    } else {
      console.log('✅ Políticas antigas removidas')
    }

    // Criar novas políticas mais permissivas
    const createPoliciesSQL = `
      -- Política 1: Leitura pública para todas as imagens
      CREATE POLICY "images_public_read" ON storage.objects
      FOR SELECT USING (bucket_id = 'images');

      -- Política 2: Upload para usuários autenticados (sem restrição de pasta)
      CREATE POLICY "images_authenticated_upload" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'images' 
        AND auth.role() = 'authenticated'
      );

      -- Política 3: Update para usuários autenticados (sem restrição de pasta)
      CREATE POLICY "images_authenticated_update" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'images' 
        AND auth.role() = 'authenticated'
      ) WITH CHECK (
        bucket_id = 'images' 
        AND auth.role() = 'authenticated'
      );

      -- Política 4: Delete para usuários autenticados (sem restrição de pasta)
      CREATE POLICY "images_authenticated_delete" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'images' 
        AND auth.role() = 'authenticated'
      );
    `

    const { error: createError } = await supabaseClient.rpc('exec_sql', {
      sql: createPoliciesSQL
    })

    if (createError) {
      console.error('Erro ao criar políticas:', createError)
      return new Response(
        JSON.stringify({ error: `Erro ao criar políticas: ${createError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Novas políticas RLS criadas com sucesso')

    // Verificar se o bucket está acessível
    const { data: listData, error: listError } = await supabaseClient.storage
      .from('images')
      .list()

    if (listError) {
      console.error('Erro ao verificar bucket:', listError)
      return new Response(
        JSON.stringify({ error: `Erro ao verificar bucket: ${listError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Bucket "images" acessível e funcionando')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Políticas RLS do Storage corrigidas com sucesso!',
        policies: [
          'images_public_read - Leitura pública',
          'images_authenticated_upload - Upload para autenticados',
          'images_authenticated_update - Update para autenticados',
          'images_authenticated_delete - Delete para autenticados'
        ],
        note: 'Políticas mais permissivas aplicadas para resolver problemas de RLS'
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error('Erro na correção das políticas:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})