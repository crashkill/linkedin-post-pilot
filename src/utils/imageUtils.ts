/**
 * Utilitários para manipulação de imagens
 */

/**
 * Converte uma string base64 em Blob
 */
export const base64ToBlob = (base64: string, mimeType: string = 'image/png'): Blob => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

/**
 * Faz download automático de uma imagem base64
 */
export const downloadImageFromBase64 = (base64: string, filename: string = 'generated-image.png'): void => {
  try {
    // Remove o prefixo data:image se existir
    const cleanBase64 = base64.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Converte para blob
    const blob = base64ToBlob(cleanBase64, 'image/png');
    
    // Cria URL temporária
    const url = URL.createObjectURL(blob);
    
    // Cria elemento de download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Adiciona ao DOM, clica e remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpa a URL temporária
    URL.revokeObjectURL(url);
    
    console.log(`✅ Imagem ${filename} baixada com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao fazer download da imagem:', error);
    throw new Error('Falha ao fazer download da imagem');
  }
};

/**
 * Converte base64 em URL de objeto para exibição
 */
export const base64ToObjectURL = (base64: string): string => {
  try {
    const cleanBase64 = base64.replace(/^data:image\/[a-z]+;base64,/, '');
    const blob = base64ToBlob(cleanBase64, 'image/png');
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('❌ Erro ao converter base64 para URL:', error);
    throw new Error('Falha ao converter imagem');
  }
};

/**
 * Gera nome de arquivo único baseado em timestamp
 */
export const generateImageFilename = (prefix: string = 'ai-generated'): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${prefix}-${timestamp}.png`;
};

/**
 * Valida se uma string é um base64 válido
 */
export const isValidBase64 = (str: string): boolean => {
  try {
    const cleanStr = str.replace(/^data:image\/[a-z]+;base64,/, '');
    return btoa(atob(cleanStr)) === cleanStr;
  } catch (error) {
    return false;
  }
};