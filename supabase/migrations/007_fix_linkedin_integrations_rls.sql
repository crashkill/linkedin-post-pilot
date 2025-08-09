-- Corrigir políticas RLS para tabela linkedin_integrations

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view their own LinkedIn integrations" ON linkedin_integrations;
DROP POLICY IF EXISTS "Users can insert their own LinkedIn integrations" ON linkedin_integrations;
DROP POLICY IF EXISTS "Users can update their own LinkedIn integrations" ON linkedin_integrations;
DROP POLICY IF EXISTS "Users can delete their own LinkedIn integrations" ON linkedin_integrations;

-- Criar políticas RLS mais permissivas
CREATE POLICY "Users can view their own LinkedIn integrations" ON linkedin_integrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own LinkedIn integrations" ON linkedin_integrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own LinkedIn integrations" ON linkedin_integrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own LinkedIn integrations" ON linkedin_integrations
    FOR DELETE USING (auth.uid() = user_id);

-- Garantir que RLS está habilitado
ALTER TABLE linkedin_integrations ENABLE ROW LEVEL SECURITY;

-- Conceder permissões básicas aos roles
GRANT SELECT, INSERT, UPDATE, DELETE ON linkedin_integrations TO authenticated;
GRANT SELECT ON linkedin_integrations TO anon;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_linkedin_integrations_user_id ON linkedin_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_integrations_active ON linkedin_integrations(user_id, is_active) WHERE is_active = true;