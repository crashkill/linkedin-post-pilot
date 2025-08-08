import { writeFile, access, constants } from 'fs/promises';
import { join } from 'path';

/**
 * Salva uma imagem base64 no diretório src/assets
 */
export const saveImageToAssets = async (
  base64Data: string, 
  filename: string = 'generated-image.png'
): Promise<string> => {
  try {
    // Remove o prefixo data:image se existir
    const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Converte base64 para buffer
    const imageBuffer = Buffer.from(cleanBase64, 'base64');
    
    // Define o caminho do arquivo
    const assetsPath = join(process.cwd(), 'src', 'assets');
    const filePath = join(assetsPath, filename);
    
    // Verifica se o diretório existe e tem permissão de escrita
    try {
      await access(assetsPath, constants.F_OK | constants.W_OK);
    } catch (error) {
      throw new Error(`Sem permissão de escrita no diretório: ${assetsPath}`);
    }
    
    // Salva o arquivo
    await writeFile(filePath, imageBuffer);
    
    console.log(`✅ Imagem salva com sucesso: ${filePath}`);
    return filePath;
    
  } catch (error) {
    console.error('❌ Erro ao salvar imagem:', error);
    throw new Error(`Falha ao salvar imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

/**
 * Gera nome de arquivo único com timestamp
 */
export const generateUniqueFilename = (prefix: string = 'ai-generated'): string => {
  const timestamp = new Date().toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .split('.')[0];
  return `${prefix}_${timestamp}.png`;
};

/**
 * Verifica permissões do diretório assets
 */
export const checkAssetsPermissions = async (): Promise<boolean> => {
  try {
    const assetsPath = join(process.cwd(), 'src', 'assets');
    await access(assetsPath, constants.F_OK | constants.R_OK | constants.W_OK);
    return true;
  } catch (error) {
    console.error('❌ Problema com permissões do diretório assets:', error);
    return false;
  }
};

/**
 * Salva imagem com fallback para download do navegador
 */
export const saveImageWithFallback = async (
  base64Data: string,
  filename?: string
): Promise<{ success: boolean; method: 'file' | 'download'; path?: string }> => {
  const finalFilename = filename || generateUniqueFilename('linkedin-post');
  
  // Tenta salvar no sistema de arquivos primeiro
  try {
    const hasPermissions = await checkAssetsPermissions();
    
    if (hasPermissions) {
      const filePath = await saveImageToAssets(base64Data, finalFilename);
      return { success: true, method: 'file', path: filePath };
    } else {
      throw new Error('Sem permissões para salvar no diretório');
    }
  } catch (error) {
    console.warn('⚠️ Fallback para download do navegador:', error);
    
    // Fallback: usar download do navegador
    if (typeof window !== 'undefined') {
      const { downloadImageFromBase64 } = await import('./imageUtils');
      downloadImageFromBase64(base64Data, finalFilename);
      return { success: true, method: 'download' };
    } else {
      throw new Error('Não foi possível salvar a imagem');
    }
  }
};