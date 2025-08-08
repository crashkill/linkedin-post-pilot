// Serviço para gerenciar upload e download de imagens no Supabase Storage
// Substitui o salvamento local por armazenamento na nuvem

import { supabase } from '../lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export interface ImageUploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

export interface ImageMetadata {
  id?: string
  post_id?: string
  url: string
  storage_path: string
  bucket_id: string
  prompt_used?: string
  ai_model?: string
  file_size?: number
}

class ImageStorageService {
  private readonly BUCKET_NAME = 'images'
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  /**
   * Converte base64 para Blob
   */
  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64.split(',')[1] || base64)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
  }

  /**
   * Gera um nome único para o arquivo
   */
  private generateFileName(originalName?: string, extension?: string): string {
    const timestamp = Date.now()
    const uuid = uuidv4().substring(0, 8)
    const ext = extension || 'png'
    return `${timestamp}_${uuid}.${ext}`
  }

  /**
   * Obtém o caminho completo do arquivo no storage
   */
  private getStoragePath(userId: string, fileName: string): string {
    return `${userId}/${fileName}`
  }

  /**
   * Valida o arquivo antes do upload
   */
  private validateFile(file: Blob, fileName: string): { valid: boolean; error?: string } {
    // Verificar tamanho
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Arquivo muito grande. Máximo permitido: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      }
    }

    // Verificar tipo MIME
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${this.ALLOWED_TYPES.join(', ')}`
      }
    }

    return { valid: true }
  }

  /**
   * Faz upload de uma imagem base64 para o Supabase Storage
   */
  async uploadImageFromBase64(
    base64Data: string,
    options: {
      fileName?: string
      mimeType?: string
      postId?: string
      promptUsed?: string
      aiModel?: string
    } = {}
  ): Promise<ImageUploadResult> {
    try {
      // Verificar se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        }
      }

      // Determinar tipo MIME
      const mimeType = options.mimeType || 'image/png'
      
      // Converter base64 para Blob
      const blob = this.base64ToBlob(base64Data, mimeType)
      
      // Gerar nome do arquivo
      const fileName = this.generateFileName(options.fileName, mimeType.split('/')[1])
      const storagePath = this.getStoragePath(user.id, fileName)
      
      // Validar arquivo
      const validation = this.validateFile(blob, fileName)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Fazer upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(storagePath, blob, {
          contentType: mimeType,
          upsert: false
        })

      if (uploadError) {
        console.error('Erro no upload:', uploadError)
        return {
          success: false,
          error: `Erro no upload: ${uploadError.message}`
        }
      }

      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(storagePath)

      if (!urlData.publicUrl) {
        return {
          success: false,
          error: 'Erro ao obter URL pública da imagem'
        }
      }

      // Salvar metadados no banco de dados se postId for fornecido
      if (options.postId) {
        const imageMetadata: ImageMetadata = {
          post_id: options.postId,
          url: urlData.publicUrl,
          storage_path: storagePath,
          bucket_id: this.BUCKET_NAME,
          prompt_used: options.promptUsed,
          ai_model: options.aiModel,
          file_size: blob.size
        }

        const { error: dbError } = await supabase
          .from('images')
          .insert(imageMetadata)

        if (dbError) {
          console.error('Erro ao salvar metadados:', dbError)
          // Não falha o upload por causa disso, apenas loga o erro
        }
      }

      return {
        success: true,
        url: urlData.publicUrl,
        path: storagePath
      }

    } catch (error) {
      console.error('Erro no upload de imagem:', error)
      return {
        success: false,
        error: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }

  /**
   * Faz upload de um arquivo File para o Supabase Storage
   */
  async uploadImageFromFile(
    file: File,
    options: {
      postId?: string
      promptUsed?: string
      aiModel?: string
    } = {}
  ): Promise<ImageUploadResult> {
    try {
      // Verificar se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        }
      }

      // Validar arquivo
      const validation = this.validateFile(file, file.name)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Gerar nome do arquivo
      const extension = file.name.split('.').pop() || 'png'
      const fileName = this.generateFileName(file.name, extension)
      const storagePath = this.getStoragePath(user.id, fileName)

      // Fazer upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false
        })

      if (uploadError) {
        console.error('Erro no upload:', uploadError)
        return {
          success: false,
          error: `Erro no upload: ${uploadError.message}`
        }
      }

      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(storagePath)

      if (!urlData.publicUrl) {
        return {
          success: false,
          error: 'Erro ao obter URL pública da imagem'
        }
      }

      // Salvar metadados no banco de dados se postId for fornecido
      if (options.postId) {
        const imageMetadata: ImageMetadata = {
          post_id: options.postId,
          url: urlData.publicUrl,
          storage_path: storagePath,
          bucket_id: this.BUCKET_NAME,
          prompt_used: options.promptUsed,
          ai_model: options.aiModel,
          file_size: file.size
        }

        const { error: dbError } = await supabase
          .from('images')
          .insert(imageMetadata)

        if (dbError) {
          console.error('Erro ao salvar metadados:', dbError)
        }
      }

      return {
        success: true,
        url: urlData.publicUrl,
        path: storagePath
      }

    } catch (error) {
      console.error('Erro no upload de imagem:', error)
      return {
        success: false,
        error: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }

  /**
   * Remove uma imagem do Supabase Storage
   */
  async deleteImage(storagePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([storagePath])

      if (error) {
        return {
          success: false,
          error: `Erro ao deletar imagem: ${error.message}`
        }
      }

      // Remover metadados do banco de dados
      await supabase
        .from('images')
        .delete()
        .eq('storage_path', storagePath)

      return { success: true }

    } catch (error) {
      console.error('Erro ao deletar imagem:', error)
      return {
        success: false,
        error: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }

  /**
   * Lista imagens de um usuário
   */
  async listUserImages(userId?: string): Promise<ImageMetadata[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const targetUserId = userId || user?.id

      if (!targetUserId) {
        return []
      }

      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('bucket_id', this.BUCKET_NAME)
        .like('storage_path', `${targetUserId}/%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao listar imagens:', error)
        return []
      }

      return data || []

    } catch (error) {
      console.error('Erro ao listar imagens:', error)
      return []
    }
  }

  /**
   * Obtém metadados de uma imagem específica
   */
  async getImageMetadata(imageId: string): Promise<ImageMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('id', imageId)
        .single()

      if (error) {
        console.error('Erro ao obter metadados:', error)
        return null
      }

      return data

    } catch (error) {
      console.error('Erro ao obter metadados:', error)
      return null
    }
  }
}

// Exportar instância singleton
export const imageStorageService = new ImageStorageService()
export default imageStorageService