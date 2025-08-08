# 🔐 Guia de Migração para Doppler

> **Migração completa de segredos do .env para o Doppler**

## 📋 Resumo da Migração

Todas as variáveis sensíveis foram removidas do arquivo `.env` e devem ser configuradas no Doppler para maior segurança.

### ✅ Arquivos Criados
- `setup-doppler-secrets.cjs` - Script automatizado para configurar variáveis
- `.env.backup` - Backup do arquivo original
- `.env` - Novo arquivo apenas com variáveis públicas

---

## 🚀 Opção 1: Instalação e Configuração Automática

### 1. Instalar Doppler CLI

**Windows (PowerShell como Administrador):**
```powershell
# Via Chocolatey
choco install doppler

# Ou via Scoop
scoop install doppler

# Ou download direto
Invoke-WebRequest -Uri "https://releases.doppler.com/cli/latest/doppler_windows_amd64.zip" -OutFile "doppler.zip"
Expand-Archive doppler.zip -DestinationPath "C:\Program Files\Doppler"
$env:PATH += ";C:\Program Files\Doppler"
```

### 2. Configurar Projeto Doppler
```bash
# Fazer login
doppler login

# Configurar projeto (escolha: linkedin-post-pilot)
doppler setup

# Verificar configuração
doppler configure
```

### 3. Executar Script Automatizado
```bash
# Configurar todas as variáveis automaticamente
node setup-doppler-secrets.cjs
```

### 4. Testar Configuração
```bash
# Executar projeto com Doppler
doppler run -- npm run dev
```

---

## 🔧 Opção 2: Configuração Manual

### Comandos para Configurar Variáveis

```bash
# Supabase
doppler secrets set VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZnlwY2pnbWtkbG95aHRvbndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI4NzcsImV4cCI6MjA1MDU0ODg3N30.Zt8vKJGZQKJGZQKJGZQKJGZQKJGZQKJGZQKJGZQKJGZQ"

doppler secrets set SUPABASE_URL="https://jhfypcjgmkdloyhtonwr.supabase.co"

doppler secrets set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZnlwY2pnbWtkbG95aHRvbndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI4NzcsImV4cCI6MjA1MDU0ODg3N30.Zt8vKJGZQKJGZQKJGZQKJGZQKJGZQKJGZQKJGZQKJGZQ"

# LinkedIn OAuth
doppler secrets set LINKEDIN_CLIENT_ID="776n0i9m37tkpu"

doppler secrets set LINKEDIN_CLIENT_SECRET="WPL_AP1.DSD9paGhUlTtepYR.l8THTg=="

doppler secrets set LINKEDIN_REDIRECT_URI="http://localhost:8080/auth/linkedin/callback"

# Variáveis adicionais (configure quando necessário)
doppler secrets set SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"
doppler secrets set GROQ_API_KEY="sua-groq-api-key"
doppler secrets set GEMINI_API_KEY="sua-gemini-api-key"
doppler secrets set HUGGINGFACE_API_KEY="sua-huggingface-api-key"
doppler secrets set JWT_SECRET="seu-jwt-secret"
```

---

## 🌐 Opção 3: Interface Web do Doppler

1. Acesse [https://dashboard.doppler.com](https://dashboard.doppler.com)
2. Faça login na sua conta
3. Selecione o projeto `linkedin-post-pilot`
4. Vá para a seção **Secrets**
5. Adicione cada variável manualmente:

| Variável | Valor |
|----------|-------|
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_URL` | `https://jhfypcjgmkdloyhtonwr.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `LINKEDIN_CLIENT_ID` | `776n0i9m37tkpu` |
| `LINKEDIN_CLIENT_SECRET` | `WPL_AP1.DSD9paGhUlTtepYR.l8THTg==` |
| `LINKEDIN_REDIRECT_URI` | `http://localhost:8080/auth/linkedin/callback` |

---

## 🧪 Verificação e Testes

### 1. Verificar Variáveis Configuradas
```bash
# Listar todas as variáveis
doppler secrets

# Verificar variável específica
doppler secrets get LINKEDIN_CLIENT_ID
```

### 2. Testar Carregamento
```bash
# Testar se as variáveis estão sendo carregadas
doppler run -- node test-doppler.cjs
```

### 3. Executar Aplicação
```bash
# Desenvolvimento
doppler run -- npm run dev

# Build
doppler run -- npm run build
```

---

## 📁 Estrutura de Arquivos Após Migração

```
├── .env                    # ✅ Apenas variáveis públicas
├── .env.backup            # 💾 Backup do arquivo original
├── setup-doppler-secrets.cjs  # 🤖 Script automatizado
├── migrate-to-doppler.cjs     # 🔧 Script de migração
└── DOPPLER_MIGRATION_GUIDE.md # 📖 Este guia
```

---

## 🔄 Comandos de Desenvolvimento

### Antes (com .env)
```bash
npm run dev
```

### Depois (com Doppler)
```bash
doppler run -- npm run dev
```

---

## 🚨 Troubleshooting

### Problema: "doppler: command not found"
**Solução:** Instale o Doppler CLI seguindo a Opção 1

### Problema: "Project not configured"
**Solução:** Execute `doppler setup` no diretório do projeto

### Problema: Variáveis não carregadas
**Solução:** Verifique se está executando com `doppler run --`

### Problema: Erro de autenticação
**Solução:** Execute `doppler login` novamente

---

## 🎯 Próximos Passos

1. ✅ **Migração Concluída** - Variáveis movidas para Doppler
2. 🔧 **Configurar Doppler** - Seguir uma das opções acima
3. 🧪 **Testar Aplicação** - `doppler run -- npm run dev`
4. 🚀 **Deploy Produção** - Configurar Doppler no ambiente de produção

---

## 🔒 Benefícios da Migração

- ✅ **Segurança**: Segredos não ficam em arquivos de texto
- ✅ **Versionamento**: Controle de versão dos segredos
- ✅ **Auditoria**: Log de quem acessou/modificou
- ✅ **Ambientes**: Diferentes configurações por ambiente
- ✅ **Rotação**: Facilita rotação de chaves
- ✅ **Compliance**: Atende padrões de segurança

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique o [guia de instalação do Doppler](./INSTALL_DOPPLER_WINDOWS.md)
2. Consulte a [documentação oficial](https://docs.doppler.com/)
3. Execute os scripts de teste para diagnóstico

**🎉 Parabéns! Seu projeto agora está mais seguro com o Doppler!**