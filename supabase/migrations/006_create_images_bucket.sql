-- Criar bucket para armazenar imagens dos posts
-- Esta migração cria o bucket 'images' no Supabase Storage

-- Inserir bucket na tabela storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images', 
  true,
  52428800, -- 50MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas RLS para o bucket images
-- Política para permitir SELECT (visualização) para usuários autenticados e anônimos
CREATE POLICY "Allow public read access on images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Política para permitir INSERT (upload) para usuários autenticados
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir UPDATE para usuários autenticados (apenas seus próprios arquivos)
CREATE POLICY "Allow authenticated users to update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
) WITH CHECK (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir DELETE para usuários autenticados (apenas seus próprios arquivos)
CREATE POLICY "Allow authenticated users to delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Comentários para documentação
COMMENT ON POLICY "Allow public read access on images" ON storage.objects IS 'Permite acesso público de leitura para imagens';
COMMENT ON POLICY "Allow authenticated users to upload images" ON storage.objects IS 'Permite upload de imagens para usuários autenticados';
COMMENT ON POLICY "Allow authenticated users to update their own images" ON storage.objects IS 'Permite atualização de imagens próprias';
COMMENT ON POLICY "Allow authenticated users to delete their own images" ON storage.objects IS 'Permite exclusão de imagens próprias';