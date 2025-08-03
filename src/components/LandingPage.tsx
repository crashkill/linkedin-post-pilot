import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Calendar, 
  Image, 
  TrendingUp, 
  Clock, 
  Users, 
  Sparkles, 
  CheckCircle,
  ArrowRight,
  Play
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import aiAutomation from "@/assets/ai-automation.jpg";

const LandingPage = () => {
  const features = [
    {
      icon: Zap,
      title: "Automação Inteligente",
      description: "IA gera conteúdo relevante sobre tecnologia automaticamente",
      color: "text-primary"
    },
    {
      icon: Calendar,
      title: "Agendamento Avançado",
      description: "3 posts diários programados nos melhores horários",
      color: "text-accent"
    },
    {
      icon: Image,
      title: "Imagens com IA",
      description: "Geração automática de imagens personalizadas para cada post",
      color: "text-warning"
    },
    {
      icon: TrendingUp,
      title: "Analytics Detalhados",
      description: "Acompanhe o desempenho e engajamento em tempo real",
      color: "text-primary"
    }
  ];

  const benefits = [
    "Economia de 5+ horas por semana",
    "Aumento de 40% no engajamento",
    "Presença consistente no LinkedIn",
    "Conteúdo sempre relevante e atualizado",
    "Integração total com LinkedIn API",
    "Suporte a webhooks personalizados"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `linear-gradient(rgba(13, 21, 42, 0.85), rgba(13, 21, 42, 0.85)), url(${heroBg})` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-secondary opacity-90"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <Badge variant="default" className="mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 mr-2" />
            Powered by AI
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              LinkedIn Post
            </span>
            <br />
            <span className="text-foreground">Pilot</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in">
            Automatize seus posts no LinkedIn com inteligência artificial. 
            3 posts diários sobre tecnologia, com imagens geradas por IA.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6">
              <Play className="w-5 h-5 mr-2" />
              Começar Agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              <Calendar className="w-5 h-5 mr-2" />
              Ver Demo
            </Button>
          </div>
          
          <div className="mt-12 flex justify-center items-center gap-8 text-sm text-muted-foreground animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>Setup em 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>Sem compromisso</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>Suporte completo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Recursos
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Automação Completa para seu LinkedIn
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nossa plataforma combina inteligência artificial com automação avançada 
              para maximizar sua presença profissional no LinkedIn.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center group hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className={`w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="success" className="mb-4">
                Benefícios
              </Badge>
              <h2 className="text-4xl font-bold mb-6">
                Transforme sua Presença Digital
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Com nossa automação inteligente, você mantém uma presença consistente 
                e profissional no LinkedIn, sem esforço manual.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Button variant="premium" size="lg">
                <Zap className="w-5 h-5 mr-2" />
                Começar Automação
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl"></div>
              <img 
                src={aiAutomation} 
                alt="IA Automation" 
                className="relative z-10 rounded-2xl shadow-elegant animate-float"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                10K+
              </div>
              <p className="text-muted-foreground">Posts Automatizados</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                500+
              </div>
              <p className="text-muted-foreground">Profissionais Ativos</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                95%
              </div>
              <p className="text-muted-foreground">Taxa de Satisfação</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para Automatizar seu LinkedIn?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Configure sua automação em poucos minutos e comece a ver resultados hoje mesmo.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6">
              <Users className="w-5 h-5 mr-2" />
              Acessar Dashboard
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              <Clock className="w-5 h-5 mr-2" />
              Agendar Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;