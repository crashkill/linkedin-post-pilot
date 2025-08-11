import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Settings as SettingsIcon,
  Linkedin,
  Clock,
  Brain,
  Webhook,
  Shield,
  Save,
  TestTube,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LinkedInStatus from './LinkedInStatus';

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // LinkedIn Settings
    linkedinClientId: '',
    linkedinClientSecret: '',
    linkedinRedirectUri: 'http://localhost:8080/auth/linkedin/callback',
    
    // Scheduling Settings
    postsPerDay: 3,
    timezone: 'America/Sao_Paulo',
    postTimes: ['09:00', '14:00', '18:00'],
    autoPublish: true,
    
    // AI Settings
    openaiApiKey: '',
    aiModel: 'gpt-4',
    contentTone: 'professional',
    useImageGeneration: false,
    imageStyle: 'professional',
    contentCategories: ['technology', 'business'],
    
    // Webhook Settings
    webhookEnabled: false,
    webhookUrl: '',
    webhookSecret: '',
    
    // Security Settings
    twoFactorEnabled: false,
    apiAccessEnabled: false
  });

  const handleSaveSettings = (section: string) => {
    toast({
      title: "Configurações salvas",
      description: `As configurações de ${section} foram salvas com sucesso.`,
    });
  };

  const contentCategories = [
    'technology', 'business', 'marketing', 'design', 'development',
    'ai', 'data-science', 'leadership', 'innovation', 'productivity'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary rounded-lg">
          <SettingsIcon className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas preferências e integrações</p>
        </div>
      </div>

      {/* LinkedIn Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Linkedin className="w-5 h-5 text-blue-600" />
            <CardTitle>Integração LinkedIn</CardTitle>
          </div>
          <CardDescription>
            Configure sua conexão com o LinkedIn para publicação automática
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LinkedInStatus />
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                type="password"
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
              placeholder="URL de callback"
              value={settings.linkedinRedirectUri}
              onChange={(e) => setSettings({...settings, linkedinRedirectUri: e.target.value})}
            />
            <p className="text-sm text-muted-foreground">
              Configure esta URL no seu app LinkedIn Developer
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => handleSaveSettings("LinkedIn")}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
            <Button variant="outline">
              <TestTube className="w-4 h-4 mr-2" />
              Testar Conexão
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduling Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            <CardTitle>Agendamento</CardTitle>
          </div>
          <CardDescription>
            Configure quando e como seus posts serão publicados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Posts por dia</Label>
              <Select value={settings.postsPerDay.toString()} onValueChange={(value) => setSettings({...settings, postsPerDay: parseInt(value)})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 post</SelectItem>
                  <SelectItem value="2">2 posts</SelectItem>
                  <SelectItem value="3">3 posts</SelectItem>
                  <SelectItem value="5">5 posts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Fuso horário</Label>
              <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Horários de publicação</Label>
            <div className="flex gap-2 flex-wrap">
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
                    className="w-32"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="autoPublish"
              checked={settings.autoPublish}
              onCheckedChange={(checked) => setSettings({...settings, autoPublish: checked})}
            />
            <Label htmlFor="autoPublish">Publicação automática</Label>
          </div>
          
          <Button onClick={() => handleSaveSettings("Agendamento")}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <CardTitle>Inteligência Artificial</CardTitle>
          </div>
          <CardDescription>
            Configure as preferências de geração de conteúdo com IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <Label>Modelo de IA</Label>
              <Select value={settings.aiModel} onValueChange={(value) => setSettings({...settings, aiModel: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tom do conteúdo</Label>
              <Select value={settings.contentTone} onValueChange={(value) => setSettings({...settings, contentTone: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Profissional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Amigável</SelectItem>
                  <SelectItem value="authoritative">Autoritativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="useImageGeneration"
                checked={settings.useImageGeneration}
                onCheckedChange={(checked) => setSettings({...settings, useImageGeneration: checked})}
              />
              <Label htmlFor="useImageGeneration">Gerar imagens automaticamente</Label>
            </div>
            
            {settings.useImageGeneration && (
              <div className="space-y-2 ml-6">
                <Label>Estilo das imagens</Label>
                <Select value={settings.imageStyle} onValueChange={(value) => setSettings({...settings, imageStyle: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Profissional</SelectItem>
                    <SelectItem value="creative">Criativo</SelectItem>
                    <SelectItem value="minimalist">Minimalista</SelectItem>
                    <SelectItem value="modern">Moderno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Categorias de conteúdo preferidas</Label>
            <div className="flex gap-2 flex-wrap">
              {contentCategories.map((category) => (
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
          
          <Button onClick={() => handleSaveSettings("IA")}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* Webhook Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="w-5 h-5 text-orange-600" />
            <CardTitle>Webhooks</CardTitle>
          </div>
          <CardDescription>
            Configure notificações automáticas para eventos importantes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="webhookEnabled"
              checked={settings.webhookEnabled}
              onCheckedChange={(checked) => setSettings({...settings, webhookEnabled: checked})}
            />
            <Label htmlFor="webhookEnabled">Ativar webhooks</Label>
          </div>
          
          {settings.webhookEnabled && (
            <div className="space-y-4 ml-6">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">URL do Webhook</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://seu-site.com/webhook"
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
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Eventos disponíveis:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Post publicado com sucesso</li>
                  <li>• Erro na publicação</li>
                  <li>• Novo agendamento criado</li>
                  <li>• Limite de API atingido</li>
                </ul>
              </div>
            </div>
          )}
          
          <Button onClick={() => handleSaveSettings("Webhooks")}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            <CardTitle>Configurações de Segurança</CardTitle>
          </div>
          <CardDescription>
            Gerencie a segurança da sua conta e acesso à API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticação de dois fatores</Label>
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
              <div className="space-y-0.5">
                <Label>Acesso à API</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir acesso programático via API REST
                </p>
              </div>
              <Switch
                checked={settings.apiAccessEnabled}
                onCheckedChange={(checked) => setSettings({...settings, apiAccessEnabled: checked})}
              />
            </div>
            
            {settings.apiAccessEnabled && (
              <div className="ml-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Label>Sua API Key</Label>
                  <Badge variant="secondary">Ativa</Badge>
                </div>
                <div className="flex gap-2">
                  <Input
                    value="sk-1234567890abcdef..."
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" size="sm">
                    Copiar
                  </Button>
                  <Button variant="outline" size="sm">
                    Regenerar
                  </Button>
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
    </div>
  );
};

export default Settings;