import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Plus, Filter, Search, Edit, Trash2, Share, Eye, TrendingUp, MessageCircle, Heart, Sparkles, Wand2, Image } from "lucide-react";
import aiService from "../services/aiService.js";
import { useToast } from "@/hooks/use-toast";

const Posts = () => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "",
    scheduledDate: "",
    aiTopic: ""
  });
  const [generatedImage, setGeneratedImage] = useState(null);
  const { toast } = useToast();

  const posts = [
    {
      id: 1,
      title: "Tendências em Data Science 2024",
      content: "A inteligência artificial está moldando o futuro da análise de dados. Confira as principais tendências que vão dominar 2024...",
      status: "scheduled",
      scheduledDate: "2024-01-15",
      scheduledTime: "10:00",
      category: "tecnologia",
      engagement: { likes: 45, comments: 12, shares: 8, views: 1200 },
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Machine Learning na Prática",
      content: "Como aplicar machine learning em projetos reais. Um guia prático com exemplos de implementação...",
      status: "published",
      scheduledDate: "2024-01-14",
      scheduledTime: "14:30",
      category: "educacao",
      engagement: { likes: 67, comments: 23, shares: 15, views: 2100 },
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Automação com Python",
      content: "Descubra como automatizar tarefas repetitivas usando Python. Scripts úteis para o dia a dia...",
      status: "draft",
      scheduledDate: "2024-01-16",
      scheduledTime: "18:00",
      category: "programacao",
      engagement: { likes: 0, comments: 0, shares: 0, views: 0 },
      image: "/placeholder.svg"
    },
    {
      id: 4,
      title: "Cloud Computing para Iniciantes",
      content: "Entenda os conceitos básicos de computação em nuvem e como começar sua jornada...",
      status: "published",
      scheduledDate: "2024-01-13",
      scheduledTime: "09:15",
      category: "tecnologia",
      engagement: { likes: 89, comments: 34, shares: 21, views: 3200 },
      image: "/placeholder.svg"
    },
    {
      id: 5,
      title: "Carreira em Tech: Dicas Essenciais",
      content: "Conselhos práticos para quem quer ingressar ou crescer na área de tecnologia...",
      status: "scheduled",
      scheduledDate: "2024-01-17",
      scheduledTime: "16:30",
      category: "carreira",
      engagement: { likes: 0, comments: 0, shares: 0, views: 0 },
      image: "/placeholder.svg"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="default">Agendado</Badge>;
      case "published":
        return <Badge variant="success">Publicado</Badge>;
      case "draft":
        return <Badge variant="outline">Rascunho</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      tecnologia: "bg-primary/10 text-primary",
      educacao: "bg-accent/10 text-accent",
      programacao: "bg-warning/10 text-warning",
      carreira: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
    };
    return colors[category as keyof typeof colors] || "bg-muted text-muted-foreground";
  };

  const filteredPosts = posts.filter(post => {
    const matchesTab = selectedTab === "all" || post.status === selectedTab;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Funções para geração com IA
  const generatePostWithAI = async () => {
    if (!newPost.aiTopic.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um tópico para gerar o post.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await aiService.generateCompletePost(newPost.aiTopic, newPost.category || "tecnologia");
      
      setNewPost(prev => ({
        ...prev,
        title: result.title,
        content: result.content
      }));
      
      if (result.imageUrl) {
        setGeneratedImage(result.imageUrl);
      }
      
      toast({
        title: "Sucesso!",
        description: "Post gerado com IA com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao gerar post:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar post com IA. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImageOnly = async () => {
    if (!newPost.content.trim()) {
      toast({
        title: "Erro",
        description: "Adicione conteúdo ao post antes de gerar uma imagem.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const imageUrl = await aiService.generateImage(newPost.content);
      setGeneratedImage(imageUrl);
      
      toast({
        title: "Sucesso!",
        description: "Imagem gerada com IA!"
      });
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const improveContent = async () => {
    if (!newPost.content.trim()) {
      toast({
        title: "Erro",
        description: "Adicione conteúdo para melhorar.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const improvedContent = await aiService.improveContent(newPost.content);
      setNewPost(prev => ({ ...prev, content: improvedContent }));
      
      toast({
        title: "Sucesso!",
        description: "Conteúdo melhorado com IA!"
      });
    } catch (error) {
      console.error('Erro ao melhorar conteúdo:', error);
      toast({
        title: "Erro",
        description: "Erro ao melhorar conteúdo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setNewPost({
      title: "",
      content: "",
      category: "",
      scheduledDate: "",
      aiTopic: ""
    });
    setGeneratedImage(null);
  };

  const tabCounts = {
    all: posts.length,
    published: posts.filter(p => p.status === "published").length,
    scheduled: posts.filter(p => p.status === "scheduled").length,
    draft: posts.filter(p => p.status === "draft").length
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Gerenciar Posts
            </h1>
            <p className="text-muted-foreground mt-2">
              Crie, edite e agende seus posts no LinkedIn
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="hero" size="lg" onClick={resetForm}>
                <Plus className="w-4 h-4" />
                Novo Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Criar Novo Post com IA
                </DialogTitle>
                <DialogDescription>
                  Use IA para gerar conteúdo incrível para o LinkedIn
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="ai-generate" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ai-generate" className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    Gerar com IA
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Criar Manualmente
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="ai-generate" className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      Geração Automática com IA
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Tópico do Post</label>
                        <Input 
                          placeholder="Ex: Tendências de IA em 2024, Dicas de carreira em tech..."
                          value={newPost.aiTopic}
                          onChange={(e) => setNewPost(prev => ({ ...prev, aiTopic: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Categoria</label>
                        <Select value={newPost.category} onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tecnologia">Tecnologia</SelectItem>
                            <SelectItem value="negocios">Negócios</SelectItem>
                            <SelectItem value="carreira">Carreira</SelectItem>
                            <SelectItem value="inovacao">Inovação</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="lideranca">Liderança</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={generatePostWithAI}
                        disabled={isGenerating || !newPost.aiTopic.trim()}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 mr-2" />
                            Gerar Post Completo
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Resultado da geração */}
                  {(newPost.title || newPost.content) && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Título Gerado</label>
                        <Input 
                          value={newPost.title}
                          onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Título do post"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Conteúdo Gerado</label>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={improveContent}
                            disabled={isGenerating}
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            Melhorar
                          </Button>
                        </div>
                        <Textarea 
                          value={newPost.content}
                          onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Conteúdo do post"
                          className="min-h-[150px]"
                        />
                      </div>
                      
                      {/* Seção de imagem */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Imagem</label>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={generateImageOnly}
                            disabled={isGenerating || !newPost.content.trim()}
                          >
                            <Image className="h-3 w-3 mr-1" />
                            Gerar Imagem
                          </Button>
                        </div>
                        {generatedImage && (
                          <div className="border rounded-lg p-2">
                            <img 
                              src={generatedImage} 
                              alt="Imagem gerada" 
                              className="w-full max-w-md mx-auto rounded"
                              onError={(e) => {
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = 'none';
                                 toast({
                                   title: "Erro",
                                   description: "Erro ao carregar imagem gerada.",
                                   variant: "destructive"
                                 });
                               }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="manual" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Título</label>
                    <Input 
                      placeholder="Digite o título do post"
                      value={newPost.title}
                      onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Conteúdo</label>
                    <Textarea 
                      placeholder="Escreva o conteúdo do seu post..."
                      className="min-h-[120px]"
                      value={newPost.content}
                      onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Categoria</label>
                      <Select value={newPost.category} onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tecnologia">Tecnologia</SelectItem>
                          <SelectItem value="negocios">Negócios</SelectItem>
                          <SelectItem value="carreira">Carreira</SelectItem>
                          <SelectItem value="inovacao">Inovação</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="lideranca">Liderança</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Data de Publicação</label>
                      <Input 
                        type="datetime-local" 
                        value={newPost.scheduledDate}
                        onChange={(e) => setNewPost(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={resetForm}>Limpar</Button>
                <Button variant="outline">Salvar como Rascunho</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Publicar Agora</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                  Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todos ({tabCounts.all})</TabsTrigger>
            <TabsTrigger value="published">Publicados ({tabCounts.published})</TabsTrigger>
            <TabsTrigger value="scheduled">Agendados ({tabCounts.scheduled})</TabsTrigger>
            <TabsTrigger value="draft">Rascunhos ({tabCounts.draft})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            <div className="grid gap-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="w-32 h-24 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center">
                        <Eye className="w-8 h-8 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-semibold hover:text-primary cursor-pointer">
                                {post.title}
                              </h3>
                              {getStatusBadge(post.status)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                                {post.category}
                              </span>
                            </div>
                            <p className="text-muted-foreground line-clamp-2">
                              {post.content}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Share className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(post.scheduledDate).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {post.scheduledTime}
                            </div>
                          </div>

                          {post.status === "published" && (
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Eye className="w-4 h-4" />
                                {post.engagement.views}
                              </div>
                              <div className="flex items-center gap-1 text-red-600">
                                <Heart className="w-4 h-4" />
                                {post.engagement.likes}
                              </div>
                              <div className="flex items-center gap-1 text-blue-600">
                                <MessageCircle className="w-4 h-4" />
                                {post.engagement.comments}
                              </div>
                              <div className="flex items-center gap-1 text-green-600">
                                <Share className="w-4 h-4" />
                                {post.engagement.shares}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <Calendar className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Nenhum post encontrado</h3>
                      <p className="text-muted-foreground">
                        {searchTerm ? "Tente ajustar sua busca" : "Comece criando seu primeiro post"}
                      </p>
                    </div>
                    {!searchTerm && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="hero">
                            <Plus className="w-4 h-4" />
                            Criar Primeiro Post
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Posts;