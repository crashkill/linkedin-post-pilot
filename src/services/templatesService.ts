// Serviço para gerenciar templates de posts
import { supabase } from '../lib/supabase'

export interface Template {
  id: string
  name: string
  description: string
  category: string
  title_template: string
  content_template: string
  hashtags: string[]
  variables: string[] // Variáveis que podem ser substituídas no template
  is_public: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface CreateTemplateData {
  name: string
  description: string
  category: string
  title_template: string
  content_template: string
  hashtags: string[]
  variables: string[]
  is_public?: boolean
}

class TemplatesService {
  // Buscar templates do usuário e públicos
  async getTemplates(): Promise<Template[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .or(`created_by.eq.${user.id},is_public.eq.true`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Buscar templates por categoria
  async getTemplatesByCategory(category: string): Promise<Template[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('category', category)
      .or(`created_by.eq.${user.id},is_public.eq.true`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Criar novo template
  async createTemplate(templateData: CreateTemplateData): Promise<Template> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('templates')
      .insert({
        ...templateData,
        created_by: user.id,
        is_public: templateData.is_public || false
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Atualizar template
  async updateTemplate(id: string, templateData: Partial<CreateTemplateData>): Promise<Template> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('templates')
      .update({
        ...templateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('created_by', user.id) // Só pode atualizar próprios templates
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Deletar template
  async deleteTemplate(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id)
      .eq('created_by', user.id) // Só pode deletar próprios templates

    if (error) throw error
  }

  // Aplicar template (substituir variáveis)
  applyTemplate(template: Template, variables: Record<string, string>): { title: string; content: string } {
    let title = template.title_template
    let content = template.content_template

    // Substituir variáveis no formato {{variavel}}
    template.variables.forEach(variable => {
      const value = variables[variable] || `{{${variable}}}`
      const regex = new RegExp(`{{${variable}}}`, 'g')
      title = title.replace(regex, value)
      content = content.replace(regex, value)
    })

    return { title, content }
  }

  // Extrair variáveis de um template
  extractVariables(text: string): string[] {
    const regex = /{{(\w+)}}/g
    const variables: string[] = []
    let match

    while ((match = regex.exec(text)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1])
      }
    }

    return variables
  }

  // Templates pré-definidos
  getDefaultTemplates(): Omit<Template, 'id' | 'created_by' | 'created_at' | 'updated_at'>[] {
    return [
      {
        name: "Dica Profissional",
        description: "Template para compartilhar dicas de carreira e desenvolvimento profissional",
        category: "carreira",
        title_template: "💡 Dica de {{area}}: {{titulo_dica}}",
        content_template: `🎯 Hoje quero compartilhar uma dica valiosa sobre {{area}}:

{{conteudo_dica}}

✨ Por que isso funciona:
{{explicacao}}

💪 Minha experiência:
{{experiencia_pessoal}}

E você, já aplicou algo similar? Compartilhe nos comentários! 👇

#{{area}} #DesenvolvimentoProfissional #Carreira`,
        hashtags: ["carreira", "desenvolvimentoprofissional", "dicas"],
        variables: ["area", "titulo_dica", "conteudo_dica", "explicacao", "experiencia_pessoal"],
        is_public: true
      },
      {
        name: "Tendência Tecnológica",
        description: "Template para discutir tendências e inovações em tecnologia",
        category: "tecnologia",
        title_template: "🚀 {{tecnologia}}: O futuro já chegou?",
        content_template: `🔥 {{tecnologia}} está revolucionando {{setor}}!

📊 Dados impressionantes:
{{estatisticas}}

🎯 Principais benefícios:
• {{beneficio1}}
• {{beneficio2}}
• {{beneficio3}}

⚡ Minha visão:
{{opiniao_pessoal}}

🤔 Como você vê o impacto dessa tecnologia no seu setor?

#{{tecnologia}} #Inovacao #Tecnologia #Futuro`,
        hashtags: ["tecnologia", "inovacao", "futuro"],
        variables: ["tecnologia", "setor", "estatisticas", "beneficio1", "beneficio2", "beneficio3", "opiniao_pessoal"],
        is_public: true
      },
      {
        name: "Lição Aprendida",
        description: "Template para compartilhar experiências e lições aprendidas",
        category: "experiencia",
        title_template: "📚 Lição que mudou minha perspectiva sobre {{tema}}",
        content_template: `💭 Há {{tempo}}, eu pensava que {{crenca_anterior}}.

Mas então {{evento_mudanca}}...

🔄 O que mudou:
{{nova_perspectiva}}

📈 Resultados dessa mudança:
{{resultados}}

💡 Se eu pudesse dar um conselho para quem está passando por algo similar:
{{conselho}}

🤝 Qual foi uma lição que mudou sua perspectiva recentemente?

#AprendizadoContinuo #{{tema}} #CrescimentoPessoal`,
        hashtags: ["aprendizadocontinuo", "crescimentopessoal", "experiencia"],
        variables: ["tema", "tempo", "crenca_anterior", "evento_mudanca", "nova_perspectiva", "resultados", "conselho"],
        is_public: true
      },
      {
        name: "Conquista Profissional",
        description: "Template para celebrar conquistas e marcos profissionais",
        category: "conquista",
        title_template: "🎉 {{tipo_conquista}}: {{titulo_conquista}}",
        content_template: `🏆 Estou muito feliz em compartilhar: {{conquista}}!

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

#{{area}} #Conquista #Gratidao #Motivacao`,
        hashtags: ["conquista", "gratidao", "motivacao"],
        variables: ["tipo_conquista", "titulo_conquista", "conquista", "jornada", "desafio1", "desafio2", "desafio3", "agradecimentos", "proximos_passos", "mensagem_motivacional", "area"],
        is_public: true
      }
    ]
  }
}

export const templatesService = new TemplatesService()