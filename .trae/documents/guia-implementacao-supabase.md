# Guia de Implementação - Supabase Storage

## 🚀 Guia Prático para Desenvolvedores

Este documento fornece instruções passo a passo para implementar e trabalhar com o sistema de armazenamento de imagens usando Supabase Storage no LinkedIn Post Pilot.

---

## 📋 Pré-requisitos

### **Ambiente de Desenvolvimento**
- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Projeto Supabase configurado

### **Dependências Necessárias**
```bash
npm install @supabase/supabase-js uuid mime-types
npm install -D @types/uuid @types/mime-types
```

---

## ⚙️ Configuração Inicial

### **1. Variáveis de Ambiente**

Crie ou atualize o arquivo `.env`:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
VITE_SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# Storage Configuration
VITE_STORAGE_BUCKET=generated-images
VITE_MAX_FILE_SIZE=10485760
```

### **2. Configuração do Cliente Supabase**

**Arquivo:** `src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  storage: {
    bucketId: 'generated-images'
  }
});
```

---

## 🗄️ Configuração do Banco de Dados

### **1. Executar Migrações SQL**

No painel do Supabase, execute os seguintes comandos SQL:

#### **Criar Bucket de Storage**
```sql
-- Inserir bucket para imagens geradas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-images',
  'generated-images', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);
```

#### **Configurar Políticas RLS**
```sql
-- Política para upload (usuários autenticados)
CREATE POLICY "Users can upload images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'generated-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para visualização pública
CREATE POLICY "Images are publicly viewable" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'generated-images');

-- Política para deletar próprias imagens
CREATE POLICY "Users can delete own images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'generated-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### **Atualizar Tabela de Imagens**
```sql
-- Adicionar campos para Storage
ALTER TABLE images 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS mime_type TEXT;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_images_storage_path ON images(storage_path);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);
```

### **2. Verificar Configuração**

```sql
-- Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'generated-images';

-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

---

## 💻 Implementação do Serviço

### **1. Criar o Image Storage Service**

**Arquivo:** `src/services/imageStorageService.ts`

```typescript
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface ImageMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  storagePath: string;
}

export class ImageStorageService {
  private static readonly BUCKET_NAME = 'generated-images';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png', 
    'image/webp',
    'image/gif'
  ];

  /**
   * Faz upload de uma imagem base64 para o Supabase Storage
   */
  static async uploadImageToSupabase(
    base64Data: string, 
    fileName?: string
  ): Promise<string> {
    try {
      // Validar e processar base64
      const { blob, mimeType } = this.processBase64(base64Data);
      
      // Validações
      this.validateFile(blob, mimeType);
      
      // Gerar path único
      const storagePath = this.generateStoragePath(fileName, mimeType);
      
      // Upload para Supabase
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(storagePath, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Erro no upload: ${error.message}`);
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(storagePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      throw error;
    }
  }

  /**
   * Processa dados base64 e extrai blob e mime type
   */
  private static processBase64(base64Data: string): { blob: Blob; mimeType: string } {
    // Remover prefixo data URL se presente
    const base64Clean = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Extrair mime type
    const mimeTypeMatch = base64Data.match(/^data:([^;]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
    
    // Converter para blob
    const blob = this.base64ToBlob(base64Clean, mimeType);
    
    return { blob, mimeType };
  }

  /**
   * Converte base64 para Blob
   */
  private static base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  /**
   * Valida arquivo antes do upload
   */
  private static validateFile(blob: Blob, mimeType: string): void {
    // Validar tamanho
    if (blob.size > this.MAX_FILE_SIZE) {
      throw new Error(`Arquivo muito grande. Máximo: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Validar tipo
    if (!this.ALLOWED_TYPES.includes(mimeType)) {
      throw new Error(`Tipo de arquivo não permitido: ${mimeType}`);
    }

    // Validar se não está vazio
    if (blob.size === 0) {
      throw new Error('Arquivo está vazio');
    }
  }

  /**
   * Gera path único para storage
   */
  private static generateStoragePath(fileName?: string, mimeType?: string): string {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'anonymous';
    
    const timestamp = Date.now();
    const uuid = uuidv4();
    const extension = this.getExtensionFromMimeType(mimeType || 'image/jpeg');
    
    const cleanFileName = fileName 
      ? fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
      : 'generated_image';
    
    return `${userId}/${timestamp}_${uuid}_${cleanFileName}.${extension}`;
  }

  /**
   * Obtém extensão do arquivo baseado no mime type
   */
  private static getExtensionFromMimeType(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif'
    };
    
    return extensions[mimeType] || 'jpg';
  }

  /**
   * Salva metadados da imagem no banco
   */
  static async saveImageMetadata(
    url: string,
    metadata: Partial<ImageMetadata>,
    postId?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('images')
        .insert({
          post_id: postId,
          url,
          storage_path: metadata.storagePath,
          file_size: metadata.fileSize,
          mime_type: metadata.mimeType,
          prompt_used: metadata.fileName, // Pode ser usado para armazenar o prompt
          ai_model: 'flux-schnell'
        });

      if (error) {
        console.error('Erro ao salvar metadados:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao salvar metadados da imagem:', error);
      throw error;
    }
  }

  /**
   * Lista imagens do usuário
   */
  static async getUserImages(limit = 20): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      throw error;
    }
  }

  /**
   * Deleta imagem do storage e banco
   */
  static async deleteImage(imageId: string): Promise<void> {
    try {
      // Buscar dados da imagem
      const { data: image, error: fetchError } = await supabase
        .from('images')
        .select('storage_path')
        .eq('id', imageId)
        .single();

      if (fetchError || !image) {
        throw new Error('Imagem não encontrada');
      }

      // Deletar do storage
      if (image.storage_path) {
        const { error: storageError } = await supabase.storage
          .from(this.BUCKET_NAME)
          .remove([image.storage_path]);

        if (storageError) {
          console.warn('Erro ao deletar do storage:', storageError);
        }
      }

      // Deletar do banco
      const { error: dbError } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        throw dbError;
      }
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      throw error;
    }
  }
}

// Exportar funções principais para compatibilidade
export const uploadImageToSupabase = ImageStorageService.uploadImageToSupabase;
export const saveImageMetadata = ImageStorageService.saveImageMetadata;
export const getUserImages = ImageStorageService.getUserImages;
export const deleteImage = ImageStorageService.deleteImage;
```

---

## 🔧 Integração com Componentes

### **1. Atualizar LinkedInTestPublisher**

**Arquivo:** `src/components/LinkedInTestPublisher.tsx`

```typescript
import { ImageStorageService } from '../services/imageStorageService';

// No componente, substituir a função handleSaveImage:
const handleSaveImage = async () => {
  if (!generatedImage) {
    alert('Nenhuma imagem para salvar');
    return;
  }

  try {
    setIsLoading(true);
    setStatus('Salvando imagem no Supabase...');
    
    // Upload para Supabase Storage
    const imageUrl = await ImageStorageService.uploadImageToSupabase(
      generatedImage,
      `linkedin_post_${Date.now()}`
    );
    
    // Salvar metadados no banco
    await ImageStorageService.saveImageMetadata(imageUrl, {
      fileName: `linkedin_post_${Date.now()}.jpg`,
      fileSize: 0, // Será calculado automaticamente
      mimeType: 'image/jpeg',
      uploadedAt: new Date().toISOString(),
      storagePath: '' // Será preenchido automaticamente
    });
    
    setImageUrl(imageUrl);
    setStatus('✅ Imagem salva com sucesso no Supabase!');
    
  } catch (error) {
    console.error('Erro ao salvar imagem:', error);
    setStatus(`❌ Erro ao salvar: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};
```

### **2. Criar Hook Personalizado**

**Arquivo:** `src/hooks/useImageStorage.ts`

```typescript
import { useState, useCallback } from 'react';
import { ImageStorageService } from '../services/imageStorageService';

export interface UseImageStorageReturn {
  uploadImage: (base64: string, fileName?: string) => Promise<string>;
  deleteImage: (imageId: string) => Promise<void>;
  getUserImages: () => Promise<any[]>;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

export const useImageStorage = (): UseImageStorageReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(async (base64: string, fileName?: string): Promise<string> => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);
      
      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);
      
      const url = await ImageStorageService.uploadImageToSupabase(base64, fileName);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      return url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  const deleteImage = useCallback(async (imageId: string): Promise<void> => {
    try {
      setError(null);
      await ImageStorageService.deleteImage(imageId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar');
      throw err;
    }
  }, []);

  const getUserImages = useCallback(async (): Promise<any[]> => {
    try {
      setError(null);
      return await ImageStorageService.getUserImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar imagens');
      throw err;
    }
  }, []);

  return {
    uploadImage,
    deleteImage,
    getUserImages,
    isUploading,
    uploadProgress,
    error
  };
};
```

---

## 🧪 Testes

### **1. Testes Unitários**

**Arquivo:** `src/services/__tests__/imageStorageService.test.ts`

```typescript
import { ImageStorageService } from '../imageStorageService';
import { supabase } from '../../lib/supabase';

// Mock do Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn()
      }))
    },
    auth: {
      getUser: jest.fn(() => ({
        data: { user: { id: 'test-user-id' } }
      }))
    }
  }
}));

describe('ImageStorageService', () => {
  const mockBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadImageToSupabase', () => {
    it('deve fazer upload com sucesso', async () => {
      const mockUpload = jest.fn().mockResolvedValue({
        data: { path: 'test-path' },
        error: null
      });
      
      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://test-url.com/image.jpg' }
      });
      
      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl
      });
      
      const result = await ImageStorageService.uploadImageToSupabase(mockBase64);
      
      expect(result).toBe('https://test-url.com/image.jpg');
      expect(mockUpload).toHaveBeenCalled();
      expect(mockGetPublicUrl).toHaveBeenCalled();
    });
    
    it('deve falhar com arquivo muito grande', async () => {
      // Criar base64 que resulte em arquivo > 10MB
      const largeBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(15000000);
      
      await expect(
        ImageStorageService.uploadImageToSupabase(largeBase64)
      ).rejects.toThrow('Arquivo muito grande');
    });
    
    it('deve falhar com tipo de arquivo inválido', async () => {
      const invalidBase64 = 'data:text/plain;base64,dGVzdA==';
      
      await expect(
        ImageStorageService.uploadImageToSupabase(invalidBase64)
      ).rejects.toThrow('Tipo de arquivo não permitido');
    });
  });
});
```

### **2. Testes de Integração**

**Arquivo:** `src/services/__tests__/imageStorage.integration.test.ts`

```typescript
import { ImageStorageService } from '../imageStorageService';
import { supabase } from '../../lib/supabase';

describe('ImageStorageService Integration', () => {
  // Usar dados reais do Supabase em ambiente de teste
  const testBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...';
  
  beforeAll(async () => {
    // Autenticar usuário de teste
    await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword'
    });
  });
  
  afterAll(async () => {
    // Limpar dados de teste
    await supabase.auth.signOut();
  });
  
  it('deve fazer upload completo e salvar metadados', async () => {
    // Upload da imagem
    const imageUrl = await ImageStorageService.uploadImageToSupabase(
      testBase64,
      'test-image'
    );
    
    expect(imageUrl).toMatch(/https:\/\/.*\.supabase\.co/);
    
    // Verificar se a imagem é acessível
    const response = await fetch(imageUrl);
    expect(response.ok).toBe(true);
    expect(response.headers.get('content-type')).toMatch(/image/);
    
    // Salvar metadados
    await ImageStorageService.saveImageMetadata(imageUrl, {
      fileName: 'test-image.jpg',
      fileSize: 1024,
      mimeType: 'image/jpeg',
      uploadedAt: new Date().toISOString(),
      storagePath: 'test-path'
    });
    
    // Verificar se foi salvo no banco
    const images = await ImageStorageService.getUserImages(1);
    expect(images).toHaveLength(1);
    expect(images[0].url).toBe(imageUrl);
  });
});
```

---

## 🚀 Deploy e Produção

### **1. Variáveis de Ambiente de Produção**

```bash
# Produção
VITE_SUPABASE_URL=https://seu-projeto-prod.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-prod
VITE_STORAGE_BUCKET=generated-images
VITE_MAX_FILE_SIZE=10485760

# Configurações de Performance
VITE_ENABLE_IMAGE_COMPRESSION=true
VITE_COMPRESSION_QUALITY=0.8
VITE_ENABLE_CACHE=true
```

### **2. Configurações de Build**

**Arquivo:** `vite.config.ts`
```typescript
export default defineConfig({
  // ... outras configurações
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'supabase': ['@supabase/supabase-js'],
          'image-utils': ['uuid', 'mime-types']
        }
      }
    }
  }
});
```

### **3. Monitoramento**

```typescript
// Adicionar ao serviço
static async getStorageStats(): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('images')
      .select('file_size, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    if (error) throw error;
    
    const totalSize = data.reduce((sum, img) => sum + (img.file_size || 0), 0);
    const totalImages = data.length;
    
    return {
      totalImages,
      totalSize,
      averageSize: totalSize / totalImages,
      last30Days: data.length
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return null;
  }
}
```

---

## 🔍 Troubleshooting

### **Problemas Comuns**

#### **1. Erro de Autenticação**
```
Error: Invalid JWT token
```
**Solução:**
```typescript
// Verificar se o usuário está autenticado
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  throw new Error('Usuário não autenticado');
}
```

#### **2. Erro de Permissão**
```
Error: new row violates row-level security policy
```
**Solução:**
- Verificar se as políticas RLS estão configuradas corretamente
- Confirmar se o usuário tem permissão para o bucket

#### **3. Arquivo Muito Grande**
```
Error: File size exceeds limit
```
**Solução:**
```typescript
// Implementar compressão automática
if (blob.size > MAX_SIZE) {
  blob = await compressImage(blob, 0.8);
}
```

#### **4. Tipo MIME Inválido**
```
Error: File type not allowed
```
**Solução:**
- Verificar se o tipo está na lista de permitidos
- Atualizar a configuração do bucket se necessário

### **Debug Mode**

```typescript
// Adicionar logs detalhados
const DEBUG = import.meta.env.DEV;

if (DEBUG) {
  console.log('Upload iniciado:', {
    fileSize: blob.size,
    mimeType,
    storagePath
  });
}
```

---

## 📚 Recursos Adicionais

### **Documentação Oficial**
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Security](https://supabase.com/docs/guides/storage/security)

### **Ferramentas Úteis**
- [Supabase CLI](https://supabase.com/docs/reference/cli)
- [Storage Explorer](https://supabase.com/dashboard/project/_/storage/buckets)
- [SQL Editor](https://supabase.com/dashboard/project/_/sql)

### **Comunidade**
- [Discord do Supabase](https://discord.supabase.com/)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

---

**Versão do Guia:** 1.0.0  
**Última Atualização:** Janeiro 2025  
**Autor:** Equipe LinkedIn Post Pilot