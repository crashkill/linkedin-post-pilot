import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  HelpCircle, 
  Book, 
  Video, 
  Send, 
  CheckCircle,
  AlertCircle,
  Zap,
  Users,
  Globe,
  FileText
} from "lucide-react";

const Support = () => {
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "",
    priority: "",
    description: ""
  });

  const faqItems = [
    {
      question: "Como agendar posts automáticos?",
      answer: "Vá para a página de Posts, clique em 'Novo Post', defina o conteúdo e selecione a data/hora desejada. O sistema irá publicar automaticamente no horário agendado."
    },
    {
      question: "Quantos posts posso agendar?",
      answer: "No plano gratuito você pode agendar até 10 posts por mês. Nos planos pagos não há limitação de posts agendados."
    },
    {
      question: "Como funciona a geração de conteúdo com IA?",
      answer: "Nossa IA analisa seu nicho e gera conteúdo relevante baseado nas suas preferências. Você pode revisar e editar o conteúdo antes de publicar."
    },
    {
      question: "Posso conectar múltiplas contas do LinkedIn?",
      answer: "Sim, nos planos Pro e Enterprise você pode conectar múltiplas contas e gerenciá-las de um só lugar."
    },
    {
      question: "Como cancelar minha assinatura?",
      answer: "Acesse Configurações > Assinatura e clique em 'Cancelar Assinatura'. Você manterá acesso até o final do período pago."
    },
    {
      question: "Os posts são publicados em meu nome?",
      answer: "Sim, todos os posts são publicados diretamente em sua conta do LinkedIn usando a API oficial do LinkedIn."
    },
    {
      question: "Posso programar posts para diferentes fusos horários?",
      answer: "Sim, você pode configurar o fuso horário nas configurações e todos os agendamentos seguirão essa configuração."
    },
    {
      question: "Como acompanhar o desempenho dos posts?",
      answer: "No Dashboard você tem acesso a métricas detalhadas como curtidas, comentários, compartilhamentos e alcance de cada post."
    }
  ];

  const supportChannels = [
    {
      icon: MessageCircle,
      title: "Chat ao Vivo",
      description: "Suporte imediato durante horário comercial",
      status: "online",
      action: "Iniciar Chat"
    },
    {
      icon: Mail,
      title: "Email",
      description: "Resposta em até 24 horas",
      status: "available",
      action: "Enviar Email"
    },
    {
      icon: Phone,
      title: "Telefone",
      description: "Suporte por telefone para planos Pro+",
      status: "premium",
      action: "Ligar Agora"
    }
  ];

  const resources = [
    {
      icon: Book,
      title: "Documentação",
      description: "Guias completos e tutoriais",
      link: "#"
    },
    {
      icon: Video,
      title: "Vídeo Tutoriais",
      description: "Aprenda através de vídeos práticos",
      link: "#"
    },
    {
      icon: Users,
      title: "Comunidade",
      description: "Conecte-se com outros usuários",
      link: "#"
    },
    {
      icon: Globe,
      title: "Blog",
      description: "Dicas e melhores práticas",
      link: "#"
    }
  ];

  const recentTickets = [
    {
      id: "#12345",
      subject: "Problema com agendamento de posts",
      status: "Em andamento",
      priority: "Alta",
      created: "2024-01-15",
      updated: "2024-01-15"
    },
    {
      id: "#12344",
      subject: "Dúvida sobre planos",
      status: "Resolvido",
      priority: "Baixa",
      created: "2024-01-14",
      updated: "2024-01-14"
    },
    {
      id: "#12343",
      subject: "Erro na conexão com LinkedIn",
      status: "Fechado",
      priority: "Média",
      created: "2024-01-13",
      updated: "2024-01-14"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Em andamento":
        return <Badge variant="default">Em andamento</Badge>;
      case "Resolvido":
        return <Badge variant="success">Resolvido</Badge>;
      case "Fechado":
        return <Badge variant="outline">Fechado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "text-red-600";
      case "Média":
        return "text-yellow-600";
      case "Baixa":
        return "text-green-600";
      default:
        return "text-muted-foreground";
    }
  };

  const handleSubmitTicket = () => {
    console.log("Ticket submitted:", ticketForm);
    // Reset form
    setTicketForm({
      subject: "",
      category: "",
      priority: "",
      description: ""
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Central de Suporte
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Estamos aqui para ajudar você a aproveitar ao máximo o LinkedIn Post Pilot
          </p>
        </div>

        {/* Support Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportChannels.map((channel, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <channel.icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{channel.title}</h3>
                  <p className="text-sm text-muted-foreground">{channel.description}</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  {channel.status === "online" && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                  {channel.status === "premium" && (
                    <Badge variant="warning" className="text-xs">Premium</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {channel.status === "online" ? "Online" : 
                     channel.status === "available" ? "Disponível" : "Premium"}
                  </span>
                </div>
                <Button 
                  variant={channel.status === "online" ? "hero" : "outline"} 
                  className="w-full"
                  disabled={channel.status === "premium"}
                >
                  {channel.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="ticket">Abrir Ticket</TabsTrigger>
            <TabsTrigger value="tickets">Meus Tickets</TabsTrigger>
            <TabsTrigger value="resources">Recursos</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Perguntas Frequentes
                </CardTitle>
                <CardDescription>
                  Encontre respostas rápidas para as dúvidas mais comuns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Ticket Tab */}
          <TabsContent value="ticket">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Abrir Ticket de Suporte
                </CardTitle>
                <CardDescription>
                  Descreva seu problema e nossa equipe entrará em contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Categoria</label>
                    <Select value={ticketForm.category} onValueChange={(value) => setTicketForm({...ticketForm, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Problema Técnico</SelectItem>
                        <SelectItem value="billing">Cobrança</SelectItem>
                        <SelectItem value="feature">Solicitação de Recurso</SelectItem>
                        <SelectItem value="account">Conta</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Prioridade</label>
                    <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm({...ticketForm, priority: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Assunto</label>
                  <Input 
                    placeholder="Descreva brevemente o problema"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Descrição Detalhada</label>
                  <Textarea 
                    placeholder="Descreva o problema em detalhes, incluindo passos para reproduzir, mensagens de erro, etc."
                    className="min-h-[120px]"
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                  />
                </div>
                
                <Button 
                  onClick={handleSubmitTicket}
                  className="w-full md:w-auto"
                  disabled={!ticketForm.subject || !ticketForm.description}
                >
                  <Send className="w-4 h-4" />
                  Enviar Ticket
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Tickets Tab */}
          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Meus Tickets
                </CardTitle>
                <CardDescription>
                  Acompanhe o status dos seus tickets de suporte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                          {getStatusBadge(ticket.status)}
                          <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </div>
                      <h4 className="font-semibold mb-2">{ticket.subject}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Criado: {new Date(ticket.created).toLocaleDateString('pt-BR')}</span>
                        <span>Atualizado: {new Date(ticket.updated).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map((resource, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <resource.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
                        <p className="text-muted-foreground mb-4">{resource.description}</p>
                        <Button variant="outline" size="sm">
                          Acessar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Support;