import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Download, ImageIcon, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadImageFromBase64, generateImageFilename, isValidBase64 } from '@/utils/imageUtils';

interface ImageGeneratorProps {
  onImageGenerated?: (imageData: string) => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onImageGenerated }) => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt necessário",
        description: "Por favor, descreva a imagem que você deseja gerar.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simular chamada para MCP-HF (substituir pela implementação real)
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          width: 1024,
          height: 1024,
          num_inference_steps: 4,
          randomize_seed: true
        })
      });

      if (!response.ok) {
        throw new Error('Falha na geração da imagem');
      }

      const data = await response.json();
      
      if (data.image && isValidBase64(data.image)) {
        setGeneratedImage(data.image);
        
        // Criar preview da imagem
        const imageUrl = `data:image/png;base64,${data.image}`;
        setImagePreview(imageUrl);
        
        // Callback para componente pai
        if (onImageGenerated) {
          onImageGenerated(data.image);
        }
        
        toast({
          title: "✅ Imagem gerada com sucesso!",
          description: "Sua imagem ultra-realista foi criada. Clique em 'Baixar' para salvá-la.",
        });
      } else {
        throw new Error('Dados de imagem inválidos recebidos');
      }
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      toast({
        title: "❌ Erro na geração",
        description: "Não foi possível gerar a imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) {
      toast({
        title: "Nenhuma imagem disponível",
        description: "Gere uma imagem primeiro antes de fazer o download.",
        variant: "destructive"
      });
      return;
    }

    try {
      const filename = generateImageFilename('linkedin-post-ai');
      downloadImageFromBase64(generatedImage, filename);
      
      toast({
        title: "📥 Download iniciado",
        description: `Imagem ${filename} está sendo baixada.`,
      });
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "❌ Erro no download",
        description: "Não foi possível baixar a imagem. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const suggestedPrompts = [
    "Ultra-realistic professional photograph of a modern AI developer working on generative AI projects",
    "Cinematic shot of a futuristic workspace with AI technology and holographic displays",
    "Professional headshot of a tech entrepreneur in a modern office environment",
    "High-tech laboratory with AI researchers working on neural networks"
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Gerador de Imagens IA Ultra-Realistas
        </CardTitle>
        <CardDescription>
          Crie imagens profissionais ultra-realistas para seus posts do LinkedIn usando IA generativa
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Campo de Prompt */}
        <div className="space-y-2">
          <Label htmlFor="prompt">Descrição da Imagem</Label>
          <Textarea
            id="prompt"
            placeholder="Descreva detalhadamente a imagem que você deseja gerar..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Prompts Sugeridos */}
        <div className="space-y-2">
          <Label>Prompts Sugeridos:</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestedPrompts.map((suggestedPrompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-left h-auto p-3 whitespace-normal"
                onClick={() => setPrompt(suggestedPrompt)}
              >
                {suggestedPrompt}
              </Button>
            ))}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3">
          <Button 
            onClick={generateImage} 
            disabled={isGenerating || !prompt.trim()}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando Imagem...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" />
                Gerar Imagem
              </>
            )}
          </Button>
          
          {generatedImage && (
            <Button 
              onClick={downloadImage}
              variant="outline"
              className="flex-shrink-0"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
          )}
        </div>

        {/* Preview da Imagem */}
        {imagePreview && (
          <div className="space-y-3">
            <Label>Imagem Gerada:</Label>
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <img 
                src={imagePreview} 
                alt="Imagem gerada por IA" 
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              ✨ Imagem ultra-realista gerada com sucesso! Clique em "Baixar" para salvar.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <div className="text-center">
              <p className="font-medium">Gerando sua imagem ultra-realista...</p>
              <p className="text-sm text-muted-foreground">
                Isso pode levar alguns segundos. Por favor, aguarde.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageGenerator;