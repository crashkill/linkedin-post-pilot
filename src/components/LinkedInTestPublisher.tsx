import React, { useState } from 'react';
import { Upload, Send, CheckCircle, AlertCircle, Loader2, Cloud } from 'lucide-react';
import { generateLinkedInPostImage, base64ToBlob } from '../utils/generateAndSaveImage';
import { imageStorageService } from '../services/imageStorageService';

interface PublishResult {
  success: boolean;
  message: string;
  imageUrl?: string;
  postId?: string;
}

interface LinkedInAssetResponse {
  value: {
    asset: string;
    uploadMechanism: {
      'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest': {
        uploadUrl: string;
        headers: Record<string, string>;
      };
    };
  };
}

const LinkedInTestPublisher: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [postText, setPostText] = useState(`🚀 O Futuro das IAs Generativas na Tecnologia

As Inteligências Artificiais generativas estão revolucionando a forma como criamos, trabalhamos e inovamos. De códigos a imagens, de textos a vídeos, essas tecnologias estão democratizando a criação de conteúdo e acelerando processos que antes levavam horas ou dias.

🔮 O que esperar para o futuro:
• Integração ainda mais profunda com ferramentas de desenvolvimento
• Personalização extrema baseada em contexto
• Colaboração humano-IA mais fluida e natural
• Automação inteligente de tarefas complexas

💡 A chave não é substituir a criatividade humana, mas amplificá-la. As IAs generativas são ferramentas poderosas que nos permitem focar no que realmente importa: estratégia, inovação e conexões humanas.

🎯 Esta imagem foi gerada por IA e este post foi criado usando automação inteligente - um exemplo prático do futuro que já está aqui!

#IA #InteligenciaArtificial #Tecnologia #Inovacao #Futuro #Automacao #LinkedInPost #AIGenerativa`);
  const [accessToken, setAccessToken] = useState('');
  const [personUrn, setPersonUrn] = useState('');

  /**
   * Gera uma imagem usando MCP-HF
   */
  const handleGenerateImage = async () => {
    setIsGenerating(true);
    try {
      const result = await generateLinkedInPostImage();
      
      if (result.success && result.imageData) {
        setGeneratedImage(result.imageData);
        console.log('✅ Imagem gerada com sucesso!');
      } else {
        throw new Error('Falha na geração da imagem');
      }
    } catch (error) {
      console.error('❌ Erro ao gerar imagem:', error);
      alert('Erro ao gerar imagem. Verifique o console para mais detalhes.');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Faz upload da imagem para o LinkedIn
   */
  const handleUploadImage = async () => {
    if (!generatedImage || !accessToken || !personUrn) {
      alert('Imagem, token de acesso e Person URN são obrigatórios!');
      return;
    }

    setIsUploading(true);
    try {
      // Passo 1: Registrar upload no LinkedIn
      const registerResponse = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner: personUrn,
            serviceRelationships: [{
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent'
            }]
          }
        })
      });

      if (!registerResponse.ok) {
        throw new Error(`Erro no registro: ${registerResponse.status} ${registerResponse.statusText}`);
      }

      const registerData: LinkedInAssetResponse = await registerResponse.json();
      const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      const assetId = registerData.value.asset;

      // Passo 2: Upload da imagem
      const imageBlob = base64ToBlob(generatedImage);
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: imageBlob
      });

      if (!uploadResponse.ok) {
        throw new Error(`Erro no upload: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      setUploadedAssetId(assetId);
      console.log('✅ Upload da imagem concluído!', assetId);
      alert('Upload da imagem concluído com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      alert(`Erro no upload: ${error}`);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Publica o post no LinkedIn
   */
  const handlePublishPost = async () => {
    if (!uploadedAssetId || !accessToken || !personUrn) {
      alert('Upload da imagem, token de acesso e Person URN são obrigatórios!');
      return;
    }

    setIsPublishing(true);
    try {
      const postData = {
        author: personUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: postText
            },
            shareMediaCategory: 'IMAGE',
            media: [{
              status: 'READY',
              description: {
                text: 'Imagem gerada por IA para teste de publicação'
              },
              media: uploadedAssetId,
              title: {
                text: 'Teste de Publicação LinkedIn'
              }
            }]
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na publicação: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      setPublishResult({
        success: true,
        message: 'Post publicado com sucesso!',
        postId: result.id
      });
      
      console.log('✅ Post publicado:', result);
      
    } catch (error) {
      console.error('❌ Erro na publicação:', error);
      setPublishResult({
        success: false,
        message: `Erro na publicação: ${error}`
      });
    } finally {
      setIsPublishing(false);
    }
  };

  /**
   * Salva a imagem gerada no Supabase Storage
   */
  const handleSaveImage = async () => {
    if (!generatedImage) {
      alert('Nenhuma imagem para salvar!');
      return;
    }

    try {
      const result = await imageStorageService.uploadImageFromBase64(generatedImage, {
        fileName: `linkedin_post_${Date.now()}`,
        mimeType: 'image/png',
        promptUsed: 'Ultra-realistic professional photograph of AI developer working on generative AI projects with modern tech workspace',
        aiModel: 'MCP-HF'
      });
      
      if (result.success) {
        alert(`Imagem salva no Supabase com sucesso!\nURL: ${result.url}`);
        console.log('✅ Imagem salva no Supabase:', result);
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar no Supabase:', error);
      alert(`Erro ao salvar imagem no Supabase: ${error}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Send className="w-6 h-6" />
          Teste de Publicação no LinkedIn
        </h2>

        {/* Configurações de API */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Token do LinkedIn
            </label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Seu access token do LinkedIn"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Person URN
            </label>
            <input
              type="text"
              value={personUrn}
              onChange={(e) => setPersonUrn(e.target.value)}
              placeholder="urn:li:person:XXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Texto do Post */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Texto do Post
          </label>
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite o texto do seu post..."
          />
        </div>

        {/* Etapa 1: Gerar Imagem */}
        <div className="border rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
            Gerar Imagem com IA
          </h3>
          <button
            onClick={handleGenerateImage}
            disabled={isGenerating}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isGenerating ? 'Gerando...' : 'Gerar Imagem'}
          </button>
          
          {generatedImage && (
            <div className="mt-4">
              <img
                src={`data:image/png;base64,${generatedImage}`}
                alt="Imagem gerada"
                className="max-w-xs rounded-lg shadow-md"
              />
              <button
                onClick={handleSaveImage}
                className="mt-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
              >
                <Cloud className="w-3 h-3" />
                Salvar no Supabase
              </button>
            </div>
          )}
        </div>

        {/* Etapa 2: Upload da Imagem */}
        <div className="border rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
            Upload da Imagem para LinkedIn
          </h3>
          <button
            onClick={handleUploadImage}
            disabled={!generatedImage || isUploading || !accessToken || !personUrn}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isUploading ? 'Fazendo Upload...' : 'Upload para LinkedIn'}
          </button>
          
          {uploadedAssetId && (
            <div className="mt-2 flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Upload concluído: {uploadedAssetId}</span>
            </div>
          )}
        </div>

        {/* Etapa 3: Publicar Post */}
        <div className="border rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
            Publicar Post
          </h3>
          <button
            onClick={handlePublishPost}
            disabled={!uploadedAssetId || isPublishing || !accessToken || !personUrn}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          >
            {isPublishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isPublishing ? 'Publicando...' : 'Publicar no LinkedIn'}
          </button>
        </div>

        {/* Resultado da Publicação */}
        {publishResult && (
          <div className={`border rounded-lg p-4 ${
            publishResult.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
          }`}>
            <div className="flex items-center gap-2">
              {publishResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`font-medium ${
                publishResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {publishResult.message}
              </span>
            </div>
            {publishResult.postId && (
              <p className="text-sm text-green-700 mt-2">
                ID do Post: {publishResult.postId}
              </p>
            )}
          </div>
        )}

        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-semibold text-blue-800 mb-2">Instruções:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Configure seu Access Token e Person URN do LinkedIn</li>
            <li>2. Gere uma imagem usando IA</li>
            <li>3. Faça upload da imagem para o LinkedIn</li>
            <li>4. Publique o post com a imagem</li>
          </ol>
          <p className="text-xs text-blue-600 mt-2">
            <strong>Nota:</strong> Você precisa de um Access Token válido do LinkedIn com permissões de escrita.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LinkedInTestPublisher;