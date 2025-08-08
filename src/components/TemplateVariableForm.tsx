import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { templatesService, Template } from '@/services/templatesService';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Copy, Send, Eye, Variable, Hash } from 'lucide-react';

interface TemplateVariableFormProps {
  template: Template;
  onSuccess: () => void;
}

const TemplateVariableForm: React.FC<TemplateVariableFormProps> = ({ template, onSuccess }) => {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Aplicar template com valores das variáveis
  const getFilledContent = () => {
    return templatesService.applyTemplate(template, variableValues);
  };

  // Verificar se todas as variáveis foram preenchidas
  const allVariablesFilled = template.variables.every(variable => 
    variableValues[variable] && variableValues[variable].trim() !== ''
  );

  // Copiar conteúdo para clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Conteúdo copiado para a área de transferência."
      });
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível copiar o conteúdo.",
        variant: "destructive"
      });
    }
  };

  // Copiar post completo
  const copyFullPost = () => {
    const { title, content } = getFilledContent();
    const hashtags = template.hashtags.map(h => `#${h}`).join(' ');
    const fullPost = `${title}\n\n${content}\n\n${hashtags}`;
    copyToClipboard(fullPost);
  };

  // Usar template (navegar para criar post)
  const handleUseTemplate = () => {
    if (!allVariablesFilled) {
      toast({
        title: "Variáveis incompletas",
        description: "Preencha todas as variáveis antes de usar o template.",
        variant: "destructive"
      });
      return;
    }

    const { title, content } = getFilledContent();
    const hashtags = template.hashtags.map(h => `#${h}`).join(' ');
    
    // Salvar no localStorage para usar na página de criação
    const postData = {
      title,
      content: `${content}\n\n${hashtags}`,
      fromTemplate: true,
      templateName: template.name
    };
    
    localStorage.setItem('draftPost', JSON.stringify(postData));
    
    toast({
      title: "Template aplicado!",
      description: "Redirecionando para criar o post..."
    });
    
    // Fechar dialog e navegar
    onSuccess();
    navigate('/create');
  };

  // Preencher com dados de exemplo
  const fillWithExample = () => {
    const exampleData: Record<string, string> = {
      // Exemplos genéricos
      'nome': 'João Silva',
      'empresa': 'Tech Solutions',
      'cargo': 'Desenvolvedor Senior',
      'area_profissional': 'desenvolvimento de software',
      'tecnologia': 'React',
      'projeto': 'sistema de gestão',
      'resultado': 'aumento de 30% na produtividade',
      'dica': 'usar hooks customizados',
      'experiencia': 'migração de sistema legado',
      'conquista': 'promoção para tech lead',
      'desafio': 'implementar arquitetura escalável',
      'aprendizado': 'importância da comunicação em equipe',
      'ferramenta': 'TypeScript',
      'metodologia': 'Scrum',
      'tempo': '6 meses',
      'equipe': '5 desenvolvedores',
      'cliente': 'startup de fintech',
      'problema': 'performance lenta',
      'solucao': 'otimização de queries',
      'beneficio': 'redução de 50% no tempo de resposta'
    };

    const newValues: Record<string, string> = {};
    template.variables.forEach(variable => {
      newValues[variable] = exampleData[variable] || `exemplo_${variable}`;
    });
    
    setVariableValues(newValues);
    
    toast({
      title: "Exemplo preenchido",
      description: "Dados de exemplo foram inseridos nas variáveis."
    });
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
      {/* Header do Template */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                {template.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {template.description}
              </CardDescription>
            </div>
            <Badge className={getCategoryColor(template.category)}>
              {template.category}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Variáveis */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Variable className="w-5 h-5" />
                Preencher Variáveis
              </CardTitle>
              <CardDescription>
                Preencha as variáveis para personalizar o template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {template.variables.length === 0 ? (
                <div className="text-center py-8">
                  <Variable className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Este template não possui variáveis para preencher.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {template.variables.length} variável(is) para preencher
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={fillWithExample}
                    >
                      Preencher Exemplo
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {template.variables.map((variable) => {
                      const isLongText = variable.includes('descricao') || 
                                       variable.includes('conteudo') || 
                                       variable.includes('texto') ||
                                       variable.includes('experiencia') ||
                                       variable.includes('aprendizado');
                      
                      return (
                        <div key={variable} className="space-y-2">
                          <Label htmlFor={variable} className="text-sm font-medium capitalize">
                            {variable.replace(/_/g, ' ')}
                            <span className="text-destructive ml-1">*</span>
                          </Label>
                          {isLongText ? (
                            <Textarea
                              id={variable}
                              value={variableValues[variable] || ''}
                              onChange={(e) => setVariableValues(prev => ({
                                ...prev,
                                [variable]: e.target.value
                              }))}
                              placeholder={`Digite o valor para ${variable.replace(/_/g, ' ')}`}
                              rows={3}
                            />
                          ) : (
                            <Input
                              id={variable}
                              value={variableValues[variable] || ''}
                              onChange={(e) => setVariableValues(prev => ({
                                ...prev,
                                [variable]: e.target.value
                              }))}
                              placeholder={`Digite o valor para ${variable.replace(/_/g, ' ')}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview do Post */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview do Post
              </CardTitle>
              <CardDescription>
                Visualize como ficará o post final
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Título */}
              <div>
                <Label className="text-sm font-medium">Título</Label>
                <div className="mt-1 p-3 bg-background border rounded-md">
                  <p className="font-semibold">{filledContent.title}</p>
                </div>
              </div>
              
              {/* Conteúdo */}
              <div>
                <Label className="text-sm font-medium">Conteúdo</Label>
                <div className="mt-1 p-3 bg-background border rounded-md max-h-48 overflow-y-auto">
                  <p className="whitespace-pre-wrap">{filledContent.content}</p>
                </div>
              </div>
              
              {/* Hashtags */}
              {template.hashtags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Hashtags ({template.hashtags.length})
                  </Label>
                  <div className="mt-1 p-3 bg-background border rounded-md">
                    <div className="flex flex-wrap gap-1">
                      {template.hashtags.map((hashtag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{hashtag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Status de preenchimento */}
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <div className={`w-3 h-3 rounded-full ${
                  allVariablesFilled ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className="text-sm">
                  {allVariablesFilled 
                    ? 'Todas as variáveis preenchidas' 
                    : `${Object.keys(variableValues).filter(k => variableValues[k]?.trim()).length}/${template.variables.length} variáveis preenchidas`
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ações */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 justify-end">
            <Button 
              onClick={() => copyToClipboard(filledContent.title)}
              variant="outline"
              size="sm"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copiar Título
            </Button>
            
            <Button 
              onClick={() => copyToClipboard(filledContent.content)}
              variant="outline"
              size="sm"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copiar Conteúdo
            </Button>
            
            <Button 
              onClick={copyFullPost}
              variant="outline"
              size="sm"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copiar Tudo
            </Button>
            
            <Button 
              onClick={handleUseTemplate}
              disabled={!allVariablesFilled || loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Usar Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateVariableForm;