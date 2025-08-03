import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  Linkedin, 
  Bot, 
  Clock, 
  Webhook, 
  Key, 
  Save,
  TestTube,
  Calendar,
  ImageIcon,
  Globe,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // LinkedIn Configuration
    linkedinClientId: "",
    linkedinClientSecret: "",
    linkedinRedirectUri: "",
    
    // Post Scheduling
    postsPerDay: 3,
    postTimes: ["09:00", "14:00", "18:00"],
    timezone: "America/Sao_Paulo",
    autoPublish: true,
    
    // AI Configuration
    openaiApiKey: "",
    aiModel: "gpt-4",
    contentTone: "professional",
    useImageGeneration: true,
    imageStyle: "professional",
    
    // Webhook Configuration
    webhookEnabled: false,
    webhookUrl: "",
    webhookSecret: "",
    
    // Content Preferences
    contentCategories: ["technology", "ai", "innovation"],
    hashtagStrategy: "automatic",
    maxHashtags: 5,
    
    // Security
    twoFactorEnabled: false,
    apiAccessEnabled: true,
  });

  const handleSaveSettings = (section: string) => {
    toast({
      title: "Configurações salvas",
      description: `As configurações de ${section} foram salvas com sucesso.`,
    });
  };

  const handleTestConnection = (service: string) => {
    toast({
      title: "Testando conexão",
      description: `Testando conexão com ${service}...`,
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Configure sua plataforma de automação do LinkedIn
          </p>
        </div>
      </div>

      <Tabs defaultValue="linkedin" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="linkedin">
            <Linkedin className="w-4 h-4 mr-2" />
            LinkedIn
          </TabsTrigger>
          <TabsTrigger value="scheduling">
            <Clock className="w-4 h-4 mr-2" />
            Agendamento
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Bot className="w-4 h-4 mr-2" />
            IA
          </TabsTrigger>
          <TabsTrigger value="webhook">
            <Webhook className="w-4 h-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* LinkedIn Configuration */}
        <TabsContent value="linkedin">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Linkedin className="w-5 h-5 text-blue-600" />
                Configuração do LinkedIn
              </CardTitle>
              <CardDescription>
                Configure as credenciais da API do LinkedIn para publicação automática
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    placeholder="Seu LinkedIn Client ID"
                    value={settings.linkedinClientId}
                    onChange={(e) => setSettings({...settings, linkedinClientId: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    placeholder="Seu LinkedIn Client Secret"
                    value={settings.linkedinClientSecret}
                    onChange={(e) => setSettings({...settings, linkedinClientSecret: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="redirectUri">Redirect URI</Label>
                <Input
                  id="redirectUri"
                  placeholder="https://yourapp.com/auth/linkedin/callback"
                  value={settings.linkedinRedirectUri}
                  onChange={(e) => setSettings({...settings, linkedinRedirectUri: e.target.value})}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <h4 className="font-medium">Status da Conexão</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Desconectado</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Configure as credenciais e teste a conexão
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => handleTestConnection("LinkedIn")}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Testar Conexão
                </Button>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleSaveSettings("LinkedIn")}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduling Configuration */}
        <TabsContent value="scheduling">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Configuração de Agendamento
              </CardTitle>
              <CardDescription>
                Configure quando e com que frequência os posts serão publicados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="postsPerDay">Posts por dia</Label>
                    <Select value={settings.postsPerDay.toString()} onValueChange={(value) => setSettings({...settings, postsPerDay: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 post</SelectItem>
                        <SelectItem value="2">2 posts</SelectItem>
                        <SelectItem value="3">3 posts</SelectItem>
                        <SelectItem value="4">4 posts</SelectItem>
                        <SelectItem value="5">5 posts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                        <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                        <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tóquio (GMT+9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Horários de Publicação</Label>
                    {settings.postTimes.map((time, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => {
                            const newTimes = [...settings.postTimes];
                            newTimes[index] = e.target.value;
                            setSettings({...settings, postTimes: newTimes});
                          }}
                        />
                        <Badge variant="secondary">Post {index + 1}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">Publicação Automática</h4>
                  <p className="text-sm text-muted-foreground">
                    Publicar automaticamente nos horários configurados
                  </p>
                </div>
                <Switch
                  checked={settings.autoPublish}
                  onCheckedChange={(checked) => setSettings({...settings, autoPublish: checked})}
                />
              </div>

              <Button onClick={() => handleSaveSettings("Agendamento")}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Configuration */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Configuração de IA
              </CardTitle>
              <CardDescription>
                Configure a inteligência artificial para geração de conteúdo e imagens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openaiKey">OpenAI API Key</Label>
                  <Input
                    id="openaiKey"
                    type="password"
                    placeholder="sk-..."
                    value={settings.openaiApiKey}
                    onChange={(e) => setSettings({...settings, openaiApiKey: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aiModel">Modelo de IA</Label>
                    <Select value={settings.aiModel} onValueChange={(value) => setSettings({...settings, aiModel: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contentTone">Tom do Conteúdo</Label>
                    <Select value={settings.contentTone} onValueChange={(value) => setSettings({...settings, contentTone: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Profissional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="enthusiastic">Entusiástico</SelectItem>
                        <SelectItem value="educational">Educativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Geração de Imagens
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Gerar imagens automaticamente para os posts
                      </p>
                    </div>
                    <Switch
                      checked={settings.useImageGeneration}
                      onCheckedChange={(checked) => setSettings({...settings, useImageGeneration: checked})}
                    />
                  </div>

                  {settings.useImageGeneration && (
                    <div className="space-y-2">
                      <Label htmlFor="imageStyle">Estilo das Imagens</Label>
                      <Select value={settings.imageStyle} onValueChange={(value) => setSettings({...settings, imageStyle: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Profissional</SelectItem>
                          <SelectItem value="modern">Moderno</SelectItem>
                          <SelectItem value="minimalist">Minimalista</SelectItem>
                          <SelectItem value="colorful">Colorido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categories">Categorias de Conteúdo</Label>
                  <div className="flex flex-wrap gap-2">
                    {["technology", "ai", "innovation", "productivity", "business", "digital"].map((category) => (
                      <Badge
                        key={category}
                        variant={settings.contentCategories.includes(category) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const newCategories = settings.contentCategories.includes(category)
                            ? settings.contentCategories.filter(c => c !== category)
                            : [...settings.contentCategories, category];
                          setSettings({...settings, contentCategories: newCategories});
                        }}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSaveSettings("IA")}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhook Configuration */}
        <TabsContent value="webhook">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-primary" />
                Configuração de Webhooks
              </CardTitle>
              <CardDescription>
                Configure webhooks para integração com sistemas externos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">Habilitar Webhooks</h4>
                  <p className="text-sm text-muted-foreground">
                    Enviar notificações para sistemas externos quando posts forem publicados
                  </p>
                </div>
                <Switch
                  checked={settings.webhookEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, webhookEnabled: checked})}
                />
              </div>

              {settings.webhookEnabled && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">URL do Webhook</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://yourdomain.com/webhook"
                      value={settings.webhookUrl}
                      onChange={(e) => setSettings({...settings, webhookUrl: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhookSecret">Secret (opcional)</Label>
                    <Input
                      id="webhookSecret"
                      type="password"
                      placeholder="Chave secreta para validação"
                      value={settings.webhookSecret}
                      onChange={(e) => setSettings({...settings, webhookSecret: e.target.value})}
                    />
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">Payload do Webhook</h4>
                    <pre className="text-xs text-muted-foreground">
{`{
  "event": "post_published",
  "post_id": "123",
  "content": "Post content...",
  "published_at": "2024-01-01T10:00:00Z",
  "platform": "linkedin"
}`}
                    </pre>
                  </div>

                  <Button 
                    variant="outline"
                    onClick={() => handleTestConnection("Webhook")}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Testar Webhook
                  </Button>
                </div>
              )}

              <Button onClick={() => handleSaveSettings("Webhooks")}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Configuration */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>
                Configure as opções de segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Autenticação de Dois Fatores</h4>
                    <p className="text-sm text-muted-foreground">
                      Adicione uma camada extra de segurança à sua conta
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onCheckedChange={(checked) => setSettings({...settings, twoFactorEnabled: checked})}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Acesso à API</h4>
                    <p className="text-sm text-muted-foreground">
                      Permitir acesso via API externa à plataforma
                    </p>
                  </div>
                  <Switch
                    checked={settings.apiAccessEnabled}
                    onCheckedChange={(checked) => setSettings({...settings, apiAccessEnabled: checked})}
                  />
                </div>

                {settings.apiAccessEnabled && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Chaves de API
                    </h4>
                    <div className="space-y-2">
                      <Label>API Key Atual</Label>
                      <div className="flex gap-2">
                        <Input 
                          value="sk-proj-***************************"
                          readOnly 
                          className="font-mono text-sm"
                        />
                        <Button variant="outline" size="sm">
                          Regenerar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={() => handleSaveSettings("Segurança")}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;