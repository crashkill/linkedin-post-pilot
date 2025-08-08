# 🔗 Guia de Configuração do LinkedIn OAuth

## 📋 Pré-requisitos

- [ ] Conta no LinkedIn
- [ ] Acesso ao [LinkedIn Developers](https://www.linkedin.com/developers/)
- [ ] Doppler CLI instalado (opcional, mas recomendado)

## 🚀 Passo 1: Criar Aplicação no LinkedIn

1. **Acesse o LinkedIn Developers:**
   - Vá para: https://www.linkedin.com/developers/
   - Faça login com sua conta LinkedIn

2. **Criar Nova Aplicação:**
   - Clique em "Create App"
   - Preencha os dados:
     - **App name:** LinkedIn Post Pilot
     - **LinkedIn Page:** Sua página/empresa
     - **Privacy policy URL:** https://seusite.com/privacy (temporário)
     - **App logo:** Upload de uma imagem (opcional)

3. **Configurar Produtos:**
   - Na aba "Products", solicite acesso a:
     - ✅ **Sign In with LinkedIn**
     - ✅ **Share on LinkedIn** (principal para posts)
     - ✅ **Marketing Developer Platform** (se disponível)

4. **Configurar OAuth 2.0:**
   - Na aba "Auth", adicione as URLs de redirecionamento:
     ```
     http://localhost:8080/auth/linkedin/callback
     https://seudominio.com/auth/linkedin/callback
     ```

5. **Copiar Credenciais:**
   - **Client ID:** `78xxxxxxxxxxxxx`
   - **Client Secret:** `WPxxxxxxxxxxxxxxxx`

## 🔐 Passo 2: Configurar no Doppler

### Método A: Via Doppler CLI (Recomendado)

```bash
# Login no Doppler
doppler login

# Configurar projeto
doppler setup

# Adicionar segredos
doppler secrets set LINKEDIN_CLIENT_ID="seu-client-id"
doppler secrets set LINKEDIN_CLIENT_SECRET="seu-client-secret"
doppler secrets set LINKEDIN_REDIRECT_URI="http://localhost:8080/auth/linkedin/callback"

# Verificar configuração
doppler secrets
```

### Método B: Via Interface Web

1. Acesse: https://dashboard.doppler.com/
2. Selecione seu projeto
3. Vá para o ambiente "dev"
4. Adicione os segredos:
   - `LINKEDIN_CLIENT_ID`
   - `LINKEDIN_CLIENT_SECRET`
   - `LINKEDIN_REDIRECT_URI`

## 🛠️ Passo 3: Atualizar Arquivo Local

### Opção A: Script Interativo

```bash
node update-env-from-doppler.cjs
```

### Opção B: Script Direto

```bash
node update-env-from-doppler.cjs "SEU_CLIENT_ID" "SEU_CLIENT_SECRET"
```

### Opção C: Manual

Edite o arquivo `.env`:

```env
# LinkedIn OAuth
LINKEDIN_CLIENT_ID=78xxxxxxxxxxxxx
LINKEDIN_CLIENT_SECRET=WPxxxxxxxxxxxxxxxx
LINKEDIN_REDIRECT_URI=http://localhost:8080/auth/linkedin/callback
```

## 🧪 Passo 4: Testar Configuração

```bash
# Testar variáveis
node run-with-env.cjs "node test-linkedin-auth.cjs"

# Iniciar aplicação
node run-with-env.cjs "npm run dev"

# Ou com Doppler (se instalado)
doppler run -- npm run dev
```

## 🌐 Passo 5: Testar Autenticação

1. **Acesse a aplicação:**
   - URL: http://localhost:8080

2. **Conectar LinkedIn:**
   - Vá para Configurações → LinkedIn
   - Clique em "Conectar LinkedIn"
   - Autorize a aplicação

3. **Verificar Status:**
   - Status deve mostrar "Conectado"
   - Perfil do LinkedIn deve aparecer

## 📝 Passo 6: Testar Publicação

1. **Criar Post:**
   - Vá para "Posts" → "Novo Post"
   - Escreva conteúdo
   - Gere imagem (opcional)

2. **Publicar:**
   - Clique em "Publicar no LinkedIn"
   - Verifique se aparece no seu perfil

## 🔍 Troubleshooting

### ❌ Erro: "Invalid Client ID"
- Verifique se o Client ID está correto
- Confirme que a aplicação está ativa no LinkedIn

### ❌ Erro: "Redirect URI Mismatch"
- Verifique se a URL está exatamente igual no LinkedIn Developers
- Certifique-se de incluir `http://` ou `https://`

### ❌ Erro: "Insufficient Permissions"
- Solicite acesso aos produtos necessários
- Aguarde aprovação do LinkedIn (pode levar alguns dias)

### ❌ Erro: "CORS"
- Verifique se as Edge Functions estão deployadas
- Confirme configuração do Supabase

## 📊 Verificação Final

✅ **Checklist de Sucesso:**
- [ ] Aplicação criada no LinkedIn Developers
- [ ] Produtos aprovados (Sign In + Share)
- [ ] Credenciais configuradas no Doppler
- [ ] Arquivo .env atualizado
- [ ] Teste de autenticação passou
- [ ] Conexão LinkedIn funcionando
- [ ] Post de teste publicado

## 🚀 Próximos Passos

1. **Configurar Produção:**
   ```bash
   doppler secrets set --config prd LINKEDIN_CLIENT_ID="..."
   doppler secrets set --config prd LINKEDIN_CLIENT_SECRET="..."
   ```

2. **Deploy das Edge Functions:**
   ```bash
   supabase functions deploy linkedin-auth
   supabase functions deploy linkedin-publish
   ```

3. **Configurar Domínio:**
   - Adicionar URL de produção no LinkedIn Developers
   - Atualizar `LINKEDIN_REDIRECT_URI` para produção

---

💡 **Dica:** Mantenha as credenciais sempre no Doppler, nunca no código!

🔗 **Links Úteis:**
- [LinkedIn Developers](https://www.linkedin.com/developers/)
- [LinkedIn API Docs](https://docs.microsoft.com/en-us/linkedin/)
- [Doppler Dashboard](https://dashboard.doppler.com/)