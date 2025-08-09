import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, X, Save, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { templatesService } from '@/services/templatesService';

interface TemplateFormProps {
  template?: any;
  onSave?: (template: any) => void;
  onCancel?: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ template, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    title_template: '',
    content_template: '',
    hashtags: [] as string[],
    variables: [] as string[],
    is_public: false
  });

  const [newHashtag, setNewHashtag] = useState('');
  const [newVariable, setNewVariable] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'Profissional',
    'Marketing',
    'Vendas',
    'Tecnologia',
    'Educacao',
    'Inspiracional',
    'Networking',
    'Carreira',
    'Empreendedorismo',
    'Lideranca'
  ];

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        description: template.description || '',
        category: template.category || '',
        title_template: template.title_template || '',
        content_template: template.content_template || '',
        hashtags: template.hashtags || [],
        variables: template.variables || [],
        is_public: template.is_public || false
      });
    }
  }, [template]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addHashtag = () => {
    if (newHashtag.trim() && !formData.hashtags.includes(newHashtag.trim())) {
      const hashtag = newHashtag.trim().startsWith('#') ? newHashtag.trim() : `#${newHashtag.trim()}`;
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, hashtag]
      }));
      setNewHashtag('');
    }
  };

  const removeHashtag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter((_, i) => i !== index)
    }));
  };

  const addVariable = () => {
    if (newVariable.trim() && !formData.variables.includes(newVariable.trim())) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, newVariable.trim()]
      }));
      setNewVariable('');
    }
  };

  const removeVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const detectVariables = () => {
    const content = `${formData.title_template} ${formData.content_template}`;
    const variableRegex = /{{(\w+)}}/g;
    const matches = content.match(variableRegex);
    
    if (matches) {
      const newVariables = matches
        .map(match => match.replace(/[{}]/g, ''))
        .filter(variable => !formData.variables.includes(variable));
      
      if (newVariables.length > 0) {
        setFormData(prev => ({
          ...prev,
          variables: [...prev.variables, ...newVariables]
        }));
        toast.success(`${newVariables.length} nova(s) variavel(is) detectada(s)!`);
      } else {
        toast.info('Nenhuma nova variavel encontrada.');
      }
    } else {
      toast.info('Nenhuma variavel encontrada no template.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome do template e obrigatorio');
      return;
    }

    if (!formData.content_template.trim()) {
      toast.error('Conteudo do template e obrigatorio');
      return;
    }

    setIsLoading(true);
    
    try {
      let result;
      if (template?.id) {
        result = await templatesService.updateTemplate(template.id, formData);
        toast.success('Template atualizado com sucesso!');
      } else {
        result = await templatesService.createTemplate(formData);
        toast.success('Template criado com sucesso!');
      }
      
      if (onSave) {
        onSave(result);
      }
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast.error('Erro ao salvar template. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basico</TabsTrigger>
          <TabsTrigger value="content">Conteudo</TabsTrigger>
          <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
          <TabsTrigger value="variables">Variaveis</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informacoes Basicas</CardTitle>
              <CardDescription>
                Configure as informacoes principais do template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Template</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Post de Networking"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descricao</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva o proposito deste template..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => handleInputChange('is_public', checked)}
                />
                <Label htmlFor="is_public">Template publico</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conteudo do Template</CardTitle>
              <CardDescription>
                Defina o titulo e conteudo do post. Use {{variavel}} para campos dinamicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title_template">Titulo do Post</Label>
                <Input
                  id="title_template"
                  value={formData.title_template}
                  onChange={(e) => handleInputChange('title_template', e.target.value)}
                  placeholder="Ex: {{nome}} compartilha insights sobre {{topico}}"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content_template">Conteudo do Post</Label>
                <Textarea
                  id="content_template"
                  value={formData.content_template}
                  onChange={(e) => handleInputChange('content_template', e.target.value)}
                  placeholder="Escreva o conteudo do post aqui...\n\nUse {{variavel}} para campos que serao preenchidos dinamicamente."
                  rows={8}
                  required
                />
              </div>

              <Button type="button" onClick={detectVariables} variant="outline" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Detectar Variaveis
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hashtags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hashtags</CardTitle>
              <CardDescription>
                Adicione hashtags relevantes para este template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  placeholder="Digite uma hashtag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                />
                <Button type="button" onClick={addHashtag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.hashtags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.hashtags.map((hashtag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {hashtag}
                      <button
                        type="button"
                        onClick={() => removeHashtag(index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma hashtag adicionada ainda.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Variaveis</CardTitle>
              <CardDescription>
                Defina as variaveis que serao substituidas no template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newVariable}
                  onChange={(e) => setNewVariable(e.target.value)}
                  placeholder="Digite o nome da variavel (sem {{}})"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariable())}
                />
                <Button type="button" onClick={addVariable} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.variables.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {formData.variables.map((variable, index) => (
                    <Badge key={index} variant="outline" className="flex items-center justify-between">
                      {variable}
                      <button
                        type="button"
                        onClick={() => removeVariable(index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma variavel definida ainda. Use o botao "Detectar Variaveis" na aba Conteudo.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {isLoading ? 'Salvando...' : template?.id ? 'Atualizar Template' : 'Criar Template'}
        </Button>
      </div>
    </form>
  );
};

export default TemplateForm;