// Serviço de IA para geração de conteúdo e imagens
// Integra com Groq, Hugging Face e Google AI Studio via Supabase Edge Functions

import { supabase } from '../lib/supabase'

class AIService {
  constructor() {
    // Usar cliente Supabase centralizado
    this.supabase = supabase
    
    // URLs das Edge Functions - usar local em desenvolvimento
    const isDev = import.meta.env.DEV || window.location.hostname === 'localhost'
    this.baseUrl = isDev 
      ? (import.meta.env.VITE_SUPABASE_URL_LOCAL || 'http://127.0.0.1:54321')
      : import.meta.env.VITE_SUPABASE_URL
    
    this.groqUrl = `${this.baseUrl}/functions/v1/groq-proxy`
    this.geminiUrl = `${this.baseUrl}/functions/v1/gemini-proxy`
    this.huggingfaceUrl = `${this.baseUrl}/functions/v1/huggingface-proxy`
    
    console.log('🚀 AIService initialized with baseUrl:', this.baseUrl)
    console.log('🔧 isDev:', isDev)
    console.log('🌐 hostname:', window.location.hostname)
  }

  // Método auxiliar para fazer requisições autenticadas
  async makeAuthenticatedRequest(url, body) {
    const { data: { session } } = await this.supabase.auth.getSession()
    
    if (!session) {
      throw new Error('Usuário não autenticado')
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Gerar conteúdo de texto usando Groq (Llama) via proxy
  async generateContent(prompt, options = {}) {
    try {
      const data = await this.makeAuthenticatedRequest(this.groqUrl, {
        prompt,
        options
      })
      
      return data.content
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error)
      // Fallback para Gemini em caso de erro
      try {
        console.log('Tentando fallback para Gemini...')
        return await this.generateContentWithGemini(prompt, options)
      } catch (fallbackError) {
        console.error('Erro no fallback para Gemini:', fallbackError)
        throw error
      }
    }
  }

  // Gerar conteúdo usando Google Gemini (alternativa) via proxy
  async generateContentWithGemini(prompt, options = {}) {
    try {
      const data = await this.makeAuthenticatedRequest(this.geminiUrl, {
        prompt,
        options
      })
      
      return data.content
    } catch (error) {
      console.error('Erro ao gerar conteúdo com Gemini:', error)
      throw error
    }
  }

  // Gerar imagem usando Hugging Face (Stable Diffusion) via proxy
  async generateImage(prompt, options = {}) {
    try {
      const data = await this.makeAuthenticatedRequest(this.huggingfaceUrl, {
        prompt,
        options
      })
      
      return data.imageUrl
    } catch (error) {
      console.error('Erro ao gerar imagem:', error)
      throw error
    }
  }

  // Gerar post completo com conteúdo e imagem
  async generateCompletePost(topic, options = {}) {
    try {
      // Gerar conteúdo
      const contentPrompt = `Crie um post profissional para LinkedIn sobre: ${topic}. 
      O post deve:
      - Ter entre 100-200 palavras
      - Incluir hashtags relevantes
      - Ser engajante e profissional
      - Focar em insights valiosos
      - Incluir uma call-to-action sutil`;

      const content = await this.generateContent(contentPrompt, options);

      // Gerar prompt para imagem baseado no conteúdo
      const imagePrompt = `${topic}, technology, automation, AI, professional, modern design`;
      
      let imageUrl = null;
      try {
        imageUrl = await this.generateImage(imagePrompt, options);
      } catch (imageError) {
        console.warn('Não foi possível gerar imagem, continuando apenas com texto:', imageError);
      }

      return {
        content,
        imageUrl,
        topic,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao gerar post completo:', error);
      throw error;
    }
  }

  // Melhorar conteúdo existente
  async improveContent(originalContent, improvements = []) {
    try {
      const improvementText = improvements.length > 0 
        ? improvements.join(', ') 
        : 'mais engajante, profissional e com melhor estrutura';

      const prompt = `Melhore este post do LinkedIn tornando-o ${improvementText}:

"${originalContent}"

Mantenha o tom profissional e adicione valor ao conteúdo.`;

      return await this.generateContent(prompt);
    } catch (error) {
      console.error('Erro ao melhorar conteúdo:', error);
      throw error;
    }
  }

  // Gerar hashtags relevantes
  async generateHashtags(content, maxHashtags = 10) {
    try {
      const prompt = `Baseado neste conteúdo, gere ${maxHashtags} hashtags relevantes para LinkedIn:

"${content}"

Retorne apenas as hashtags separadas por espaço, começando com #.`;

      const hashtags = await this.generateContent(prompt, { maxTokens: 100 });
      return hashtags.trim().split(' ').filter(tag => tag.startsWith('#'));
    } catch (error) {
      console.error('Erro ao gerar hashtags:', error);
      return [];
    }
  }
}

export default new AIService();