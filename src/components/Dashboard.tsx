import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, Users, Zap, Image, Play, Pause, Loader2 } from "lucide-react";
import { postsService, type Post } from "../services/postsService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../hooks/useAuth";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({
    scheduled: 0,
    today: 0,
    totalEngagement: 0,
    totalReach: 0
  });
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar todos os posts
      const allPosts = await postsService.getUserPosts();
      setPosts(allPosts);
      
      // Calcular estatísticas básicas
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const scheduledPosts = allPosts.filter(post => post.status === 'scheduled');
      const todayPosts = allPosts.filter(post => {
        if (!post.scheduled_for) return false;
        const postDate = new Date(post.scheduled_for);
        return postDate >= today && postDate < tomorrow;
      });
      
      // Buscar métricas do LinkedIn Analytics
      let analytics = {
        totalEngagement: 0,
        totalReach: 0,
        totalImpressions: 0,
        totalClicks: 0
      };
      
      try {
        analytics = await postsService.getLinkedInAnalytics();
      } catch (error) {
        console.warn('Erro ao carregar analytics do LinkedIn:', error);
        // Usar métricas básicas dos posts como fallback
        analytics.totalEngagement = allPosts.reduce((sum, post) => 
          sum + (post.likes || 0) + (post.comments || 0) + (post.shares || 0), 0
        );
        analytics.totalReach = allPosts.reduce((sum, post) => sum + (post.views || 0), 0);
      }
      
      setStats({
        scheduled: scheduledPosts.length,
        today: todayPosts.length,
        totalEngagement: analytics.totalEngagement,
        totalReach: analytics.totalReach
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

  // Carregar dados ao montar o componente, mas apenas após autenticação
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadDashboardData();
    }
  }, [authLoading, isAuthenticated]);

  // Posts recentes (últimos 5 posts)
  const recentPosts = posts
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    .slice(0, 5);

  // Próximos posts agendados
  const upcomingPosts = posts
    .filter(post => post.status === 'scheduled' && post.scheduled_for)
    .sort((a, b) => new Date(a.scheduled_for!).getTime() - new Date(b.scheduled_for!).getTime())
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

        {/* Automação LinkedIn Ativa */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-500" />
                Status da Automação
              </CardTitle>
              <CardDescription>
                Sistema de publicação automática no LinkedIn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Automação Ativa</span>
                </div>
                <Badge variant="default" className="bg-green-500">
                  Conectado
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Posts são publicados automaticamente conforme agendamento
              </p>
            </CardContent>
          </Card>
        </div>

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
                        {post.scheduled_for 
                          ? `Agendado para ${new Date(post.scheduled_for).toLocaleString('pt-BR')}`
                          : post.published_at 
                          ? `Publicado em ${new Date(post.published_at).toLocaleString('pt-BR')}`
                          : `Criado em ${new Date(post.created_at || '').toLocaleString('pt-BR')}`
                        }
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{post.engagement_metrics?.likes || 0} curtidas</span>
                        <span>{post.engagement_metrics?.comments || 0} comentários</span>
                        <span>{post.engagement_metrics?.shares || 0} compartilhamentos</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {post.image_url && (
                        <Button variant="outline" size="sm">
                          <Image className="w-4 h-4" />
                        </Button>
                      )}

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
                    const scheduledDate = new Date(post.scheduled_for!);
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