import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { templatesService, Template } from '@/services/templatesService';
import { Plus, Search, Edit, Trash2, Copy, FileText, Sparkles, Filter, Eye } from 'lucide-react';
import TemplateForm from '@/components/TemplateForm';
import TemplatePreview from '@/components/TemplatePreview';
import TemplateVariableForm from '@/components/TemplateVariableForm';

const Templates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isVariableDialogOpen, setIsVariableDialogOpen] = useState(false);
  const { toast } = useToast();

  // Categorias disponíveis
  const categories = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'carreira', label: 'Carreira' },
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'experiencia', label: 'Experiência' },
    { value: 'conquista', label: 'Conquista' },
    { value: 'dica', label: 'Dica' },
    { value: 'reflexao', label: 'Reflexão' },
    { value: 'networking', label: 'Networking' }
  ];

  // Carregar templates
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await templatesService.getTemplates();
      setTemplates(data);
      setFilteredTemplates(data);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os templates.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar templates
  useEffect(() => {
    let filtered = templates;

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, searchTerm, selectedCategory]);

  // Deletar template
  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await templatesService.deleteTemplate(templateId);
      toast({
        title: "Sucesso",
        description: "Template deletado com sucesso!"
      });
      loadTemplates();
    } catch (error) {
      console.error('Erro ao deletar template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar o template.",
        variant: "destructive"
      });
    }
  };

  // Duplicar template
  const handleDuplicateTemplate = async (template: Template) => {
    try {
      const duplicatedTemplate = {
        name: `${template.name} (Cópia)`,
        description: template.description,
        category: template.category,
        title_template: template.title_template,
        content_template: template.content_template,
        hashtags: template.hashtags,
        variables: template.variables,
        is_public: false
      };
      
      await templatesService.createTemplate(duplicatedTemplate);
      toast({
        title: "Sucesso",
        description: "Template duplicado com sucesso!"
      });
      loadTemplates();
    } catch (error) {
      console.error('Erro ao duplicar template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível duplicar o template.",
        variant: "destructive"
      });
    }
  };

  // Usar template (preencher variáveis)
  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsVariableDialogOpen(true);
  };

  // Visualizar template
  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  // Editar template
  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsEditDialogOpen(true);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            Templates de Posts
          </h1>
          <p className="text-muted-foreground mt-1">
            Crie, gerencie e use templates para seus posts do LinkedIn
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Template</DialogTitle>
              <DialogDescription>
                Crie um template personalizado para seus posts do LinkedIn
              </DialogDescription>
            </DialogHeader>
            <TemplateForm 
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                loadTemplates();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-64">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Templates */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Tente ajustar os filtros ou criar um novo template.'
                : 'Comece criando seu primeiro template personalizado.'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </div>
                  {template.is_public && (
                    <Badge variant="secondary" className="ml-2">
                      Público
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                  <Badge variant="outline">
                    {template.variables.length} variáveis
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-1">
                    {template.hashtags.slice(0, 3).map((hashtag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{hashtag}
                      </Badge>
                    ))}
                    {template.hashtags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.hashtags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      Usar
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handlePreviewTemplate(template)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deletar Template</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja deletar o template "{template.name}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
            <DialogDescription>
              Modifique as informações do template
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <TemplateForm 
              template={selectedTemplate}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedTemplate(null);
                loadTemplates();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Preview */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview do Template</DialogTitle>
            <DialogDescription>
              Visualize como o template ficará quando aplicado
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <TemplatePreview template={selectedTemplate} />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Variáveis */}
      <Dialog open={isVariableDialogOpen} onOpenChange={setIsVariableDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preencher Template</DialogTitle>
            <DialogDescription>
              Preencha as variáveis para gerar seu post personalizado
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <TemplateVariableForm 
              template={selectedTemplate}
              onSuccess={() => {
                setIsVariableDialogOpen(false);
                setSelectedTemplate(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Templates;