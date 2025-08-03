import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Settings, TrendingUp, Users, Zap, Image, Play, Pause } from "lucide-react";

const Dashboard = () => {
  const stats = [
    { title: "Posts Agendados", value: "12", icon: Calendar, color: "text-primary" },
    { title: "Posts Hoje", value: "3", icon: Clock, color: "text-accent" },
    { title: "Engajamento", value: "+15%", icon: TrendingUp, color: "text-warning" },
    { title: "Alcance", value: "2.4K", icon: Users, color: "text-primary" }
  ];

  const recentPosts = [
    {
      id: 1,
      title: "Tendências em Data Science 2024",
      status: "scheduled",
      time: "10:00",
      engagement: { likes: 45, comments: 12, shares: 8 }
    },
    {
      id: 2,
      title: "Machine Learning na Prática",
      status: "published",
      time: "14:30",
      engagement: { likes: 67, comments: 23, shares: 15 }
    },
    {
      id: 3,
      title: "Automação com Python",
      status: "draft",
      time: "18:00",
      engagement: { likes: 0, comments: 0, shares: 0 }
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
          {stats.map((stat, index) => (
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
          ))}
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
              {recentPosts.slice(0, 3).map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{post.title}</h3>
                      {getStatusBadge(post.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">Agendado para {post.time}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{post.engagement.likes} curtidas</span>
                      <span>{post.engagement.comments} comentários</span>
                      <span>{post.engagement.shares} compartilhamentos</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Image className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
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
                  <Badge variant="outline" className="text-xs">5 agendados</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                  <Clock className="w-4 h-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">16:00 Hoje</p>
                    <p className="text-xs text-muted-foreground">Python Tips & Tricks</p>
                  </div>
                  <Badge variant="default" className="text-xs">Hoje</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Clock className="w-4 h-4" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">09:00 Amanhã</p>
                    <p className="text-xs text-muted-foreground">Data Analytics Trends</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Amanhã</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Clock className="w-4 h-4" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">14:00 Amanhã</p>
                    <p className="text-xs text-muted-foreground">Cloud Computing Guide</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Amanhã</Badge>
                </div>
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