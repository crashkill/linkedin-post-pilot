// Serviço de IA para geração de conteúdo e imagens
// Integra com Groq, Hugging Face e Google AI Studio

class AIService {
  constructor() {
    // Configuração das APIs - usando variáveis do Doppler via process.env
    this.groqApiKey = import.meta.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    this.huggingfaceApiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY;
  }

  // Gerar conteúdo de texto usando Groq (Llama)
  async generateContent(prompt, options = {}) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em criação de conteúdo para LinkedIn. Crie posts profissionais, engajantes e relevantes sobre tecnologia, automação e IA.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: options.maxTokens || 500,
          temperature: options.temperature || 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API Groq: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      throw error;
    }
  }

  // Gerar conteúdo usando Google Gemini (alternativa)
  async generateContentWithGemini(prompt, options = {}) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Você é um especialista em criação de conteúdo para LinkedIn. ${prompt}`
            }]
          }],
          generationConfig: {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxTokens || 500
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API Gemini: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Erro ao gerar conteúdo com Gemini:', error);
      throw error;
    }
  }

  // Gerar imagem usando Hugging Face (Stable Diffusion)
  async generateImage(prompt, options = {}) {
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.huggingfaceApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `Professional LinkedIn post image: ${prompt}, high quality, modern, clean design, technology theme`,
          parameters: {
            negative_prompt: 'blurry, low quality, distorted, ugly',
            num_inference_steps: options.steps || 20,
            guidance_scale: options.guidance || 7.5
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API Hugging Face: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      throw error;
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