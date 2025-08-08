import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { templatesService, Template } from '@/services/templatesService';
import { Eye, Code, Sparkles, Hash, Variable, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TemplatePreviewProps {
  template: Template;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template }) => {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState<'template' | 'filled'>('template');
  const { toast } = useToast();

  const getFilledContent = () => {
    if (previewMode === 'template') {
      return {
        title: template.title_template,
        content: template.content_template
      };
    }

    return templatesService.applyTemplate(template, variableValues);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Conteudo copiado para a area de transferencia."
      });
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast({
        title: "Erro",
        description: "Nao foi possivel copiar o conteudo.",
        variant: "destructive"
      });
    }
  };

  const copyFullPost = () => {
    const { title, content } = getFilledContent();
    const hashtags = template.hashtags.map(h => `#${h}`).join(' ');
    const fullPost = `${title}\n\n${content}\n\n${hashtags}`;
    copyToClipboard(fullPost);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      carreira: 'bg-blue-100 text-blue-800',
      tecnologia: 'bg-purple-100 text-purple-800',
      experiencia: 'bg-green-100 text-green-800',
      conquista: 'bg-yellow-100 text-yellow-800',
      dica: 'bg-orange-100 text-orange-800',
      reflexao: 'bg-pink-100 text-pink-800',
      networking: 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filledContent = getFilledContent();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{template.name}</CardTitle>
              <CardDescription className="mt-1">
                {template.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {template.is_public && (
                <Badge variant="secondary">Publico</Badge>
              )}
              <Badge className={getCategoryColor(template.category)}>
                {template.category}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="template" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Template
          </TabsTrigger>
          <TabsTrigger value="variables" className="flex items-center gap-2">
            <Variable className="h-4 w-4" />
            Variaveis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Conteudo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Titulo</Label>
                <Textarea
                  value={template.title_template}
                  readOnly
                  className="mt-1 min-h-[60px] resize-none"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Conteudo</Label>
                <Textarea
                  value={template.content_template}
                  readOnly
                  className="mt-1 min-h-[200px] resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Variable className="h-5 w-5" />
                Variaveis ({template.variables.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {template.variables.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {template.variables.map((variable, index) => (
                    <Badge key={index} variant="outline" className="justify-center">
                      {variable}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma variavel definida
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Hashtags ({template.hashtags.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {template.hashtags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {template.hashtags.map((hashtag, index) => (
                    <Badge key={index} variant="secondary">
                      #{hashtag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma hashtag definida
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Preencher Variaveis
              </CardTitle>
              <CardDescription>
                Preencha as variaveis para ver o preview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {template.variables.length > 0 ? (
                <div className="grid gap-4">
                  {template.variables.map((variable, index) => (
                    <div key={index}>
                      <Label htmlFor={`var-${variable}`} className="text-sm font-medium">
                        {variable}
                      </Label>
                      <Input
                        id={`var-${variable}`}
                        value={variableValues[variable] || ''}
                        onChange={(e) => setVariableValues(prev => ({
                          ...prev,
                          [variable]: e.target.value
                        }))}
                        placeholder={`Digite o valor para ${variable}`}
                        className="mt-1"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPreviewMode('template')}
                      size="sm"
                    >
                      Ver Template
                    </Button>
                    <Button
                      onClick={() => setPreviewMode('filled')}
                      size="sm"
                    >
                      Ver Preview
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Este template nao possui variaveis para preencher.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Como o post ficara no LinkedIn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Titulo</Label>
                <Textarea
                  value={filledContent.title}
                  readOnly
                  className="mt-1 min-h-[60px] resize-none bg-gray-50"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Conteudo</Label>
                <Textarea
                  value={filledContent.content}
                  readOnly
                  className="mt-1 min-h-[200px] resize-none bg-gray-50"
                />
              </div>
              {template.hashtags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Hashtags</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    {template.hashtags.map(h => `#${h}`).join(' ')}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(filledContent.title)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Titulo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(filledContent.content)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Conteudo
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={copyFullPost}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Post Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplatePreview;