-- Configuração de políticas RLS para o bucket 'images' no Supabase Storage
-- Esta migração deve ser executada após a criação manual do bucket 'images' no dashboard

-- IMPORTANTE: Esta migração não pode criar políticas de Storage via SQL
-- As políticas RLS para Storage devem ser configuradas manualmente no dashboard do Supabase

-- Instruções para configurar manualmente no dashboard do Supabase:
-- 1. Acesse o dashboard do Supabase
-- 2. Vá para Storage > Buckets
-- 3. Crie um bucket chamado 'images' se não existir
-- 4. Configure as seguintes políticas RLS:

-- POLÍTICA 1: Upload de imagens (INSERT)
-- Nome: Users can upload their own images
-- Operação: INSERT
-- Target roles: authenticated
-- USING expression: auth.uid()::text = (storage.foldername(name))[1]
-- WITH CHECK expression: auth.uid()::text = (storage.foldername(name))[1]

-- POLÍTICA 2: Visualização de imagens (SELECT)
-- Nome: Users can view their own images
-- Operação: SELECT
-- Target roles: authenticated
-- USING expression: auth.uid()::text = (storage.foldername(name))[1]

-- POLÍTICA 3: Exclusão de imagens (DELETE)
-- Nome: Users can delete their own images
-- Operação: DELETE
-- Target roles: authenticated
-- USING expression: auth.uid()::text = (storage.foldername(name))[1]

-- POLÍTICA 4 (OPCIONAL): Acesso público de leitura
-- Nome: Public read access to images
-- Operação: SELECT
-- Target roles: anon, authenticated
-- USING expression: true

-- Esta migração apenas documenta as configurações necessárias
-- As políticas devem ser criadas manualmente no dashboard
SELECT 'Storage policies must be configured manually in Supabase dashboard' as notice;