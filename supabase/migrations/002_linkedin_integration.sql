-- Criar tabela para integração LinkedIn
CREATE TABLE linkedin_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  linkedin_id VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT NOT NULL,
  profile_data JSONB,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  disconnected_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_linkedin_integrations_user_id ON linkedin_integrations(user_id);
CREATE INDEX idx_linkedin_integrations_linkedin_id ON linkedin_integrations(linkedin_id);
CREATE INDEX idx_linkedin_integrations_active ON linkedin_integrations(user_id, is_active);

-- RLS (Row Level Security)
ALTER TABLE linkedin_integrations ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados verem apenas seus próprios dados
CREATE POLICY "Users can view own LinkedIn integrations" ON linkedin_integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own LinkedIn integrations" ON linkedin_integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own LinkedIn integrations" ON linkedin_integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own LinkedIn integrations" ON linkedin_integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_linkedin_integrations_updated_at
  BEFORE UPDATE ON linkedin_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Adicionar coluna para armazenar dados de agendamento
ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS published_to_linkedin BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS linkedin_post_id VARCHAR(255);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS linkedin_published_at TIMESTAMP WITH TIME ZONE;

-- Índices para posts agendados
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_for ON posts(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_linkedin_published ON posts(published_to_linkedin, linkedin_published_at);

-- Tabela para analytics de posts LinkedIn
CREATE TABLE linkedin_post_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  linkedin_post_id VARCHAR(255) NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para analytics
CREATE INDEX idx_linkedin_analytics_post_id ON linkedin_post_analytics(post_id);
CREATE INDEX idx_linkedin_analytics_linkedin_post_id ON linkedin_post_analytics(linkedin_post_id);

-- RLS para analytics
ALTER TABLE linkedin_post_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analytics of own posts" ON linkedin_post_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = linkedin_post_analytics.post_id 
      AND posts.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert analytics" ON linkedin_post_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update analytics" ON linkedin_post_analytics
  FOR UPDATE USING (true);