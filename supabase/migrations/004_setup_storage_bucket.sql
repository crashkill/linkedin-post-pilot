-- Migração para configurar Storage bucket para imagens
-- Criado para salvar imagens geradas por IA no Supabase Storage

-- Atualizar tabela images para usar URLs do Storage
ALTER TABLE images ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE images ADD COLUMN IF NOT EXISTS bucket_id TEXT DEFAULT 'images';

-- Comentários para documentação
COMMENT ON COLUMN images.storage_path IS 'Caminho do arquivo no Supabase Storage';
COMMENT ON COLUMN images.bucket_id IS 'ID do bucket onde a imagem está armazenada';

-- Nota: O bucket 'images' deve ser criado manualmente no dashboard do Supabase
-- com as seguintes configurações:
-- - Nome: images
-- - Público: true
-- - Limite de arquivo: 50MB
-- - Tipos MIME permitidos: image/jpeg, image/png, image/webp, image/gif