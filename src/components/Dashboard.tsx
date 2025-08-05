import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Settings, TrendingUp, Users, Zap, Image, Play, Pause, Loader2 } from "lucide-react";
import { postsService, type Post } from "../services/postsService";
import { useToast } from "@/hooks/use-toast";
import LinkedInStatus from "./LinkedInStatus";
import LinkedInScheduler from "./LinkedInScheduler";
import LinkedInAnalytics from "./LinkedInAnalytics";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [stats, setStats] = useState({
    scheduled: 0,
    today: 0,
    totalEngagement: 0,
    totalReach: 0
  });
  const { toast } = useToast();

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar todos os posts
      const allPosts = await postsService.getUserPosts();
      setPosts(allPosts);
      
      // Calcular estatísticas
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const scheduledPosts = allPosts.filter(post => post.status === 'scheduled');
      const todayPosts = allPosts.filter(post => {
        if (!post.scheduledFor) return false;
        const postDate = new Date(post.scheduledFor);
        return postDate >= today && postDate < tomorrow;
      });
      
      const totalEngagement = allPosts.reduce((sum, post) => 
        sum + (post.likes || 0) + (post.comments || 0) + (post.shares || 0), 0
      );
      
      const totalReach = allPosts.reduce((sum, post) => sum + (post.views || 0), 0);
      
      setStats({
        scheduled: scheduledPosts.length,
        today: todayPosts.length,
        totalEngagement,
        totalReach
      });
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Posts recentes (últimos 5 posts)
  const recentPosts = posts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Próximos posts agendados
  const upcomingPosts = posts
    .filter(post => post.status === 'scheduled' && post.scheduledFor)
    .sort((a, b) => new Date(a.scheduledFor!).getTime() - new Date(b.scheduledFor!).getTime())
    .slice(0, 3);

  // Estatísticas para os cards
  const statsCards = [
    { title: "Posts Agendados", value: stats.scheduled.toString(), icon: Calendar, color: "text-primary" },
    { title: "Posts Hoje", value: stats.today.toString(), icon: Clock, color: "text-accent" },
    { title: "Engajamento Total", value: stats.totalEngagement.toString(), icon: TrendingUp, color: "text-warning" },
    { title: "Alcance Total", value: stats.totalReach.toString(), icon: Users, color: "text-primary" }
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              LinkedIn Post Pilot
            </h1>
            <p className="text-muted-foreground mt-2">
              Automatize seus posts no LinkedIn com inteligência artificial
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="lg">
              <Settings className="w-4 h-4" />
              Configurações
            </Button>
            <Button variant="hero" size="lg">
              <Zap className="w-4 h-4" />
              Novo Post
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                      <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                    </div>
                    <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            statsCards.map((stat, index) => (
              <Card key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* LinkedIn Integration Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <LinkedInStatus onConnectionChange={setLinkedinConnected} />
          <div className="lg:col-span-2">
            <LinkedInScheduler onRefresh={loadDashboardData} />
          </div>
        </div>

        {/* LinkedIn Analytics */}
        {linkedinConnected && (
          <div className="mb-8">
            <LinkedInAnalytics posts={posts} onRefresh={loadDashboardData} />
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Posts Recentes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Posts Recentes
                </div>
                <Button variant="outline" size="sm">
                  Ver Todos
                </Button>
              </CardTitle>
              <CardDescription>
                Gerencie seus posts automáticos do LinkedIn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <div className="space-y-2">
                      <div className="h-5 w-3/4 bg-muted-foreground/20 animate-pulse rounded"></div>
                      <div className="h-4 w-1/2 bg-muted-foreground/20 animate-pulse rounded"></div>
                      <div className="h-3 w-full bg-muted-foreground/20 animate-pulse rounded"></div>
                    </div>
                  </div>
                ))
              ) : recentPosts.length > 0 ? (
                recentPosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{post.title}</h3>
                        {getStatusBadge(post.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {post.scheduledFor 
                          ? `Agendado para ${new Date(post.scheduledFor).toLocaleString('pt-BR')}`
                          : post.publishedAt 
                          ? `Publicado em ${new Date(post.publishedAt).toLocaleString('pt-BR')}`
                          : `Criado em ${new Date(post.createdAt).toLocaleString('pt-BR')}`
                        }
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{post.likes || 0} curtidas</span>
                        <span>{post.comments || 0} comentários</span>
                        <span>{post.shares || 0} compartilhamentos</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {post.imageUrl && (
                        <Button variant="outline" size="sm">
                          <Image className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum post encontrado</p>
                  <p className="text-sm text-muted-foreground mt-1">Crie seu primeiro post para começar</p>
                </div>
              )}
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Calendar className="w-4 h-4" />
                  Ver Todos os Posts
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status da Automação */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Status da Automação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                  <div>
                    <p className="font-medium">Posts Automáticos</p>
                    <p className="text-sm text-muted-foreground">3 posts/dia</p>
                  </div>
                  <Button variant="success" size="sm">
                    <Play className="w-4 h-4" />
                    Ativo
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Geração de Imagens</p>
                    <p className="text-sm text-muted-foreground">IA habilitada</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Image className="w-4 h-4" />
                    Configurar
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Webhooks</p>
                    <p className="text-sm text-muted-foreground">2 configurados</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                    Gerenciar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Próximos Posts</span>
                  <Badge variant="outline" className="text-xs">
                    {isLoading ? '...' : `${stats.scheduled} agendados`}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <div className="space-y-2">
                        <div className="h-4 w-1/2 bg-muted-foreground/20 animate-pulse rounded"></div>
                        <div className="h-3 w-3/4 bg-muted-foreground/20 animate-pulse rounded"></div>
                      </div>
                    </div>
                  ))
                ) : upcomingPosts.length > 0 ? (
                  upcomingPosts.map((post, index) => {
                    const scheduledDate = new Date(post.scheduledFor!);
                    const today = new Date();
                    const isToday = scheduledDate.toDateString() === today.toDateString();
                    const isTomorrow = scheduledDate.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();
                    
                    let dateLabel = scheduledDate.toLocaleDateString('pt-BR');
                    if (isToday) dateLabel = 'Hoje';
                    else if (isTomorrow) dateLabel = 'Amanhã';
                    
                    return (
                      <div key={post.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                        index === 0 ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Clock className={`w-4 h-4 ${
                          index === 0 ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {scheduledDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} {dateLabel}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {post.title}
                          </p>
                        </div>
                        <Badge 
                          variant={index === 0 ? 'default' : 'outline'} 
                          className="text-xs"
                        >
                          {dateLabel}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">Nenhum post agendado</p>
                    <p className="text-xs text-muted-foreground mt-1">Agende posts para vê-los aqui</p>
                  </div>
                )}
                <div className="pt-3 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    <Calendar className="w-4 h-4" />
                    Ver Cronograma Completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;