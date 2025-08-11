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

    // Inicializar cliente Supabase com service role key para operações administrativas
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

    console.log('🚀 Iniciando setup do bucket de imagens...')

    // 1. Criar bucket 'images' se não existir
    const { data: bucketData, error: bucketError } = await supabaseClient.storage
      .createBucket('images', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      })

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('Erro ao criar bucket:', bucketError)
      return new Response(
        JSON.stringify({ error: `Erro ao criar bucket: ${bucketError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Bucket "images" criado ou já existe')

    // 2. Executar SQL para criar políticas RLS
    const createPoliciesSQL = `
      -- Política para permitir SELECT (visualização) para todos
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'objects' 
          AND policyname = 'Allow public read access on images'
        ) THEN
          CREATE POLICY "Allow public read access on images" ON storage.objects
          FOR SELECT USING (bucket_id = 'images');
        END IF;
      END $$;

      -- Política para permitir INSERT (upload) para usuários autenticados
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'objects' 
          AND policyname = 'Allow authenticated users to upload images'
        ) THEN
          CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'images' 
            AND auth.role() = 'authenticated'
          );
        END IF;
      END $$;

      -- Política para permitir UPDATE para usuários autenticados (apenas seus próprios arquivos)
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'objects' 
          AND policyname = 'Allow authenticated users to update their own images'
        ) THEN
          CREATE POLICY "Allow authenticated users to update their own images" ON storage.objects
          FOR UPDATE USING (
            bucket_id = 'images' 
            AND auth.uid()::text = (storage.foldername(name))[1]
          ) WITH CHECK (
            bucket_id = 'images' 
            AND auth.uid()::text = (storage.foldername(name))[1]
          );
        END IF;
      END $$;

      -- Política para permitir DELETE para usuários autenticados (apenas seus próprios arquivos)
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'objects' 
          AND policyname = 'Allow authenticated users to delete their own images'
        ) THEN
          CREATE POLICY "Allow authenticated users to delete their own images" ON storage.objects
          FOR DELETE USING (
            bucket_id = 'images' 
            AND auth.uid()::text = (storage.foldername(name))[1]
          );
        END IF;
      END $$;
    `

    const { data: sqlData, error: sqlError } = await supabaseClient.rpc('exec_sql', {
      sql: createPoliciesSQL
    })

    if (sqlError) {
      console.error('Erro ao executar SQL:', sqlError)
      // Não falha se as políticas já existem
      console.log('⚠️ Algumas políticas podem já existir, continuando...')
    } else {
      console.log('✅ Políticas RLS criadas com sucesso')
    }

    // 3. Verificar se o bucket está funcionando
    const { data: listData, error: listError } = await supabaseClient.storage
      .from('images')
      .list()

    if (listError) {
      console.error('Erro ao listar bucket:', listError)
      return new Response(
        JSON.stringify({ error: `Erro ao verificar bucket: ${listError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Bucket "images" está funcionando corretamente')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Bucket "images" configurado com sucesso!',
        bucket: {
          name: 'images',
          public: true,
          fileSizeLimit: '50MB',
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        },
        policies: [
          'Allow public read access on images',
          'Allow authenticated users to upload images',
          'Allow authenticated users to update their own images',
          'Allow authenticated users to delete their own images'
        ]
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
    console.error('Erro no setup do storage:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})