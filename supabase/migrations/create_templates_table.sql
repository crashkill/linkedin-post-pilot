-- Criar tabela de templates de posts
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  title_template TEXT NOT NULL,
  content_template TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  variables TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON templates(created_by);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_public ON templates(is_public);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem seus próprios templates e templates públicos
CREATE POLICY "Users can view own templates and public templates" ON templates
  FOR SELECT
  USING (
    auth.uid() = created_by OR is_public = true
  );

-- Política para usuários criarem templates
CREATE POLICY "Users can create templates" ON templates
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Política para usuários atualizarem seus próprios templates
CREATE POLICY "Users can update own templates" ON templates
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Política para usuários deletarem seus próprios templates
CREATE POLICY "Users can delete own templates" ON templates
  FOR DELETE
  USING (auth.uid() = created_by);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir templates padrão
INSERT INTO templates (name, description, category, title_template, content_template, hashtags, variables, is_public, created_by)
VALUES 
  (
    'Dica Profissional',
    'Template para compartilhar dicas de carreira e desenvolvimento profissional',
    'carreira',
    '💡 Dica de {{area}}: {{titulo_dica}}',
    '🎯 Hoje quero compartilhar uma dica valiosa sobre {{area}}:

{{conteudo_dica}}

✨ Por que isso funciona:
{{explicacao}}

💪 Minha experiência:
{{experiencia_pessoal}}

E você, já aplicou algo similar? Compartilhe nos comentários! 👇

#{{area}} #DesenvolvimentoProfissional #Carreira',
    ARRAY['carreira', 'desenvolvimentoprofissional', 'dicas'],
    ARRAY['area', 'titulo_dica', 'conteudo_dica', 'explicacao', 'experiencia_pessoal'],
    true,
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'Tendência Tecnológica',
    'Template para discutir tendências e inovações em tecnologia',
    'tecnologia',
    '🚀 {{tecnologia}}: O futuro já chegou?',
    '🔥 {{tecnologia}} está revolucionando {{setor}}!

📊 Dados impressionantes:
{{estatisticas}}

🎯 Principais benefícios:
• {{beneficio1}}
• {{beneficio2}}
• {{beneficio3}}

⚡ Minha visão:
{{opiniao_pessoal}}

🤔 Como você vê o impacto dessa tecnologia no seu setor?

#{{tecnologia}} #Inovacao #Tecnologia #Futuro',
    ARRAY['tecnologia', 'inovacao', 'futuro'],
    ARRAY['tecnologia', 'setor', 'estatisticas', 'beneficio1', 'beneficio2', 'beneficio3', 'opiniao_pessoal'],
    true,
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'Lição Aprendida',
    'Template para compartilhar experiências e lições aprendidas',
    'experiencia',
    '📚 Lição que mudou minha perspectiva sobre {{tema}}',
    '💭 Há {{tempo}}, eu pensava que {{crenca_anterior}}.

Mas então {{evento_mudanca}}...

🔄 O que mudou:
{{nova_perspectiva}}

📈 Resultados dessa mudança:
{{resultados}}

💡 Se eu pudesse dar um conselho para quem está passando por algo similar:
{{conselho}}

🤝 Qual foi uma lição que mudou sua perspectiva recentemente?

#AprendizadoContinuo #{{tema}} #CrescimentoPessoal',
    ARRAY['aprendizadocontinuo', 'crescimentopessoal', 'experiencia'],
    ARRAY['tema', 'tempo', 'crenca_anterior', 'evento_mudanca', 'nova_perspectiva', 'resultados', 'conselho'],
    true,
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'Conquista Profissional',
    'Template para celebrar conquistas e marcos profissionais',
    'conquista',
    '🎉 {{tipo_conquista}}: {{titulo_conquista}}',
    '🏆 Estou muito feliz em compartilhar: {{conquista}}!

🛤️ A jornada até aqui:
{{jornada}}

💪 Principais desafios superados:
• {{desafio1}}
• {{desafio2}}
• {{desafio3}}

🙏 Gratidão especial:
{{agradecimentos}}

🎯 Próximos passos:
{{proximos_passos}}

✨ Para quem está na mesma jornada: {{mensagem_motivacional}}

#{{area}} #Conquista #Gratidao #Motivacao',
    ARRAY['conquista', 'gratidao', 'motivacao'],
    ARRAY['tipo_conquista', 'titulo_conquista', 'conquista', 'jornada', 'desafio1', 'desafio2', 'desafio3', 'agradecimentos', 'proximos_passos', 'mensagem_motivacional', 'area'],
    true,
    '00000000-0000-0000-0000-000000000000'
  );

-- Conceder permissões para as roles anon e authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON templates TO authenticated;
GRANT SELECT ON templates TO anon;