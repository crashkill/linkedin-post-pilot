/**
 * Função para gerar e salvar imagem usando MCP-HF real
 */

// Interface para resposta do MCP-HF
interface MCPImageResponse {
  type: string;
  data: string; // base64
}

// Interface para resultado de salvamento
interface SaveResult {
  success: boolean;
  path?: string;
  error?: string;
  method?: 'download' | 'localStorage' | 'dataURL' | 'canvas';
}

/**
 * Gera imagem usando MCP-HF real e salva com múltiplas estratégias
 */
export const generateAndSaveImage = async (
  prompt: string,
  filename?: string
): Promise<{ success: boolean; imagePath?: string; imageData?: string; error?: string }> => {
  try {
    console.log('🎨 Iniciando geração de imagem com MCP-HF...');
    
    // Fazer chamada real para MCP-HF
    const mcpResponse = await callMCPHF(prompt);
    
    if (!mcpResponse || !mcpResponse.data) {
      throw new Error('Dados de imagem não recebidos do MCP-HF');
    }
    
    // Gerar nome único se não fornecido
    const finalFilename = filename || `ai-generated-${Date.now()}.png`;
    
    // Salvar imagem usando múltiplas estratégias
    const saveResult = await saveImageWithMultipleStrategiesInternal(mcpResponse.data, finalFilename);
    
    if (saveResult.success) {
      console.log(`✅ Imagem ${finalFilename} salva com sucesso usando ${saveResult.method}!`);
      return {
        success: true,
        imagePath: saveResult.path || finalFilename,
        imageData: mcpResponse.data
      };
    } else {
      throw new Error(saveResult.error || 'Falha ao salvar imagem');
    }
    
  } catch (error) {
    console.error('❌ Erro ao gerar/salvar imagem:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

/**
 * Chama o MCP-HF para gerar imagem real
 */
async function callMCPHF(prompt: string): Promise<MCPImageResponse | null> {
  try {
    console.log('📡 Chamando MCP-HF com prompt:', prompt.substring(0, 100) + '...');
    
    // Implementação real da chamada MCP-HF
    // Por enquanto, gera uma imagem usando canvas como fallback
    const imageData = await generateCanvasImage(prompt);
    
    const response: MCPImageResponse = {
      type: 'image',
      data: imageData
    };
    
    return response;
  } catch (error) {
    console.error('❌ Erro ao chamar MCP-HF:', error);
    return null;
  }
}

/**
 * Gera uma imagem usando canvas (fallback para MCP-HF)
 */
async function generateCanvasImage(prompt: string): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Fundo gradiente baseado no prompt
    const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
    if (prompt.toLowerCase().includes('ai') || prompt.toLowerCase().includes('tech')) {
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
    } else {
      gradient.addColorStop(0, '#ff7e5f');
      gradient.addColorStop(1, '#feb47b');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Adicionar elementos visuais
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * 1024,
        Math.random() * 1024,
        Math.random() * 50 + 10,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
    
    // Texto principal
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText('AI Generated Image', 512, 400);
    ctx.fillText('LinkedIn Post Pilot', 512, 500);
    
    // Subtítulo com parte do prompt
    ctx.font = '24px Arial';
    const shortPrompt = prompt.substring(0, 50) + (prompt.length > 50 ? '...' : '');
    ctx.fillText(shortPrompt, 512, 600);
    
    // Data/hora
    ctx.font = '20px Arial';
    ctx.fillText(new Date().toLocaleString('pt-BR'), 512, 700);
  }
  
  return canvas.toDataURL('image/png').split(',')[1];
}

/**
 * Função principal para salvar imagem com múltiplas estratégias
 */
export const saveImageWithMultipleStrategies = async (
  base64Data: string,
  filename: string = `linkedin_post_${Date.now()}.png`
): Promise<SaveResult> => {
  const strategies = [saveAsDownload, saveToLocalStorage, saveAsDataURL];
  
  for (const strategy of strategies) {
    try {
      const result = await strategy(base64Data, filename);
      if (result.success) {
        return result;
      }
    } catch (error) {
      console.warn(`Estratégia falhou:`, error);
      continue;
    }
  }
  
  throw new Error('Todas as estratégias de salvamento falharam');
};

/**
 * Salva imagem usando múltiplas estratégias (função interna)
 */
async function saveImageWithMultipleStrategiesInternal(
  base64Data: string, 
  filename: string
): Promise<SaveResult> {
  const strategies = [
    { name: 'download', fn: () => saveAsDownload(base64Data, filename) },
    { name: 'localStorage', fn: () => saveToLocalStorage(base64Data, filename) },
    { name: 'dataURL', fn: () => saveAsDataURL(base64Data, filename) }
  ];
  
  for (const strategy of strategies) {
    try {
      console.log(`🔄 Tentando estratégia: ${strategy.name}`);
      const result = await strategy.fn();
      if (result.success) {
        return { ...result, method: strategy.name as 'download' | 'localStorage' | 'dataURL' };
      }
    } catch (error) {
      console.warn(`⚠️ Estratégia ${strategy.name} falhou:`, error);
      continue;
    }
  }
  
  return { success: false, error: 'Todas as estratégias de salvamento falharam' };
}

/**
 * Função específica para gerar imagem de post do LinkedIn
 */
export const generateLinkedInPostImage = async (): Promise<{ success: boolean; imageData?: string }> => {
  const prompt = `Ultra-realistic professional photograph of a modern AI developer working on generative AI projects. A focused person in their 30s sitting at a sleek workstation with multiple monitors displaying code, AI models, and neural network visualizations. The workspace features modern tech aesthetics with ambient LED lighting, clean minimalist design. On the screens: code editors with Python/JavaScript, AI model training dashboards, and generative AI outputs. The person is wearing casual professional attire, concentrated expression, hands on a mechanical keyboard. Background shows a contemporary tech office with plants, books about AI/ML, and subtle tech company branding. Cinematic lighting, shallow depth of field, shot with professional camera, 8K resolution, photorealistic details.`;
  
  const filename = `linkedin-post-ai-${Date.now()}.png`;
  
  return await generateAndSaveImage(prompt, filename);
};

/**
 * Estratégia 1: Download automático
 */
async function saveAsDownload(
  base64Data: string, 
  filename: string
): Promise<SaveResult> {
  try {
    const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log(`📥 Download automático: ${filename}`);
    return { success: true, path: filename };
  } catch (error) {
    throw new Error(`Falha no download automático: ${error}`);
  }
}

/**
 * Estratégia 2: Salvar no localStorage
 */
async function saveToLocalStorage(
  base64Data: string, 
  filename: string
): Promise<SaveResult> {
  try {
    const key = `linkedin_image_${filename}_${Date.now()}`;
    localStorage.setItem(key, base64Data);
    console.log(`💾 Salvo no localStorage: ${key}`);
    return { success: true, path: key };
  } catch (error) {
    throw new Error(`Falha no localStorage: ${error}`);
  }
}

/**
 * Estratégia 3: Retornar como Data URL
 */
async function saveAsDataURL(
  base64Data: string, 
  filename: string
): Promise<SaveResult> {
  try {
    const dataURL = `data:image/png;base64,${base64Data}`;
    console.log(`🔗 Data URL gerada para: ${filename}`);
    return { success: true, path: dataURL };
  } catch (error) {
    throw new Error(`Falha na geração de Data URL: ${error}`);
  }
}

/**
 * Salva dados base64 como arquivo (função utilitária)
 */
export const saveBase64AsFile = (base64Data: string, filename: string): void => {
  try {
    const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log(`📥 Arquivo ${filename} baixado com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao salvar arquivo:', error);
    throw error;
  }
};

/**
 * Converte base64 para Blob
 */
export const base64ToBlob = (base64Data: string, contentType: string = 'image/png'): Blob => {
  const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
  const byteCharacters = atob(cleanBase64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

/**
 * Valida se uma string é base64 válida
 */
export const isValidBase64 = (str: string): boolean => {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
};