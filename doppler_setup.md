# Configuração do Doppler - LinkedIn Post Pilot

## 📋 Pré-requisitos

- Doppler CLI instalado (https://docs.doppler.com/docs/install-cli)
- Conta no Doppler (https://doppler.com)
- Acesso ao projeto `linkedin-post-pilot` no Doppler

## 🚀 Configuração Inicial

### 1. Instalar Doppler CLI

```bash
# macOS
brew install dopplerhq/cli/doppler

# Linux
curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sudo sh

# Windows
scoop install doppler
```

### 2. Fazer Login no Doppler

```bash
doppler login
```

### 3. Configurar o Projeto

```bash
# Navegar para o diretório do projeto
cd /caminho/para/linkedin-post-pilot

# Configurar o projeto Doppler
doppler setup
# Selecione: linkedin-post-pilot
# Ambiente: dev (para desenvolvimento)
```

### 4. Verificar Configuração

```bash
# Verificar se está configurado corretamente
doppler configure

# Listar segredos disponíveis
doppler secrets
```

## 🔐 Variáveis de Ambiente Necessárias

### Frontend (Vite)
```bash
# Supabase
doppler secrets set VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
doppler secrets set VITE_SUPABASE_ANON_KEY="sua-chave-anonima"
```

### Backend (Supabase Edge Functions)
```bash
# Supabase
doppler secrets set SUPABASE_URL="https://seu-projeto.supabase.co"
doppler secrets set SUPABASE_ANON_KEY="sua-chave-anonima"
doppler secrets set SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role"

# LinkedIn OAuth
doppler secrets set LINKEDIN_CLIENT_ID="seu-client-id"
doppler secrets set LINKEDIN_CLIENT_SECRET="seu-client-secret"
doppler secrets set LINKEDIN_REDIRECT_URI="http://localhost:8080/auth/linkedin/callback"

# APIs de IA
doppler secrets set GROQ_API_KEY="sua-chave-groq"
doppler secrets set GEMINI_API_KEY="sua-chave-gemini"
doppler secrets set HUGGINGFACE_API_KEY="sua-chave-huggingface"

# Outros
doppler secrets set JWT_SECRET="seu-jwt-secret"
doppler secrets set NODE_ENV="development"
```

## 🏃‍♂️ Executando o Projeto

### Desenvolvimento
```bash
# Executar servidor de desenvolvimento
doppler run -- npm run dev

# Ou usar o comando personalizado
npm run dev:doppler
```

### Supabase
```bash
# Iniciar Supabase local
doppler run -- supabase start

# Parar Supabase local
doppler run -- supabase stop

# Reset do banco de dados
doppler run -- supabase db reset
```

### Build e Deploy
```bash
# Build para produção
doppler run -- npm run build

# Preview da build
doppler run -- npm run preview
```

## 🌍 Ambientes

### Desenvolvimento (dev)
- Usado para desenvolvimento local
- Conecta com Supabase local ou de desenvolvimento
- APIs de teste

### Staging (staging)
- Usado para testes antes da produção
- Conecta com Supabase de staging
- APIs de produção com dados de teste

### Produção (production)
- Usado para o ambiente de produção
- Conecta com Supabase de produção
- APIs de produção com dados reais

### Trocar de Ambiente
```bash
# Trocar para staging
doppler configure set config staging

# Trocar para produção
doppler configure set config production

# Voltar para desenvolvimento
doppler configure set config dev
```

## 🔧 Comandos Úteis

```bash
# Ver configuração atual
doppler configure

# Listar todos os segredos
doppler secrets

# Ver valor de um segredo específico
doppler secrets get VITE_SUPABASE_URL

# Definir um novo segredo
doppler secrets set NOVA_VARIAVEL="valor"

# Deletar um segredo
doppler secrets delete VARIAVEL_ANTIGA

# Executar comando com segredos injetados
doppler run -- seu-comando

# Exportar segredos para arquivo (NÃO RECOMENDADO)
doppler secrets download --no-file --format env
```

## 🚨 Segurança

### ✅ Boas Práticas
- ✅ Nunca commitar arquivos `.env` no Git
- ✅ Usar `doppler run --` para executar comandos
- ✅ Configurar diferentes ambientes (dev, staging, prod)
- ✅ Usar chaves específicas para cada ambiente
- ✅ Revisar permissões de acesso regularmente

### ❌ Evitar
- ❌ Nunca expor segredos em logs
- ❌ Não compartilhar chaves de produção
- ❌ Não usar o mesmo segredo em múltiplos ambientes
- ❌ Não fazer download de segredos para arquivos locais

## 🐛 Troubleshooting

### Erro: "Project not found"
```bash
# Verificar se está logado
doppler auth status

# Fazer login novamente
doppler login

# Configurar projeto novamente
doppler setup
```

### Erro: "Config not found"
```bash
# Listar configurações disponíveis
doppler configs

# Configurar ambiente correto
doppler configure set config dev
```

### Variáveis não carregando
```bash
# Verificar se o comando está sendo executado com doppler run
doppler run -- npm run dev

# Verificar se as variáveis existem
doppler secrets
```

## 📚 Recursos Adicionais

- [Documentação Oficial do Doppler](https://docs.doppler.com/)
- [CLI Reference](https://docs.doppler.com/docs/cli)
- [Integração com Vercel](https://docs.doppler.com/docs/vercel)
- [Integração com GitHub Actions](https://docs.doppler.com/docs/github-actions)