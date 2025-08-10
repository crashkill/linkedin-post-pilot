# 🔑 Guia para Gerar ACCESS_TOKEN do LinkedIn

## Passo a Passo no LinkedIn Developer Portal

### 1. Acesse o LinkedIn Developer Portal
- URL: https://www.linkedin.com/developers/apps
- Faça login com sua conta LinkedIn

### 2. Selecione sua Aplicação
- Clique na aplicação "LinkedIn Post Pilot" (ou crie uma nova se necessário)

### 3. Configurar Permissões
- Vá para a aba **"Auth"** ou **"Products"**
- Certifique-se de que o produto **"Share on LinkedIn"** está adicionado
- Verifique se as seguintes permissões estão habilitadas:
  - ✅ `r_liteprofile` (para ler informações básicas do perfil)
  - ✅ `w_member_social` (para publicar posts)

### 4. Configurar Redirect URLs
- Na seção **"OAuth 2.0 settings"**
- Adicione as seguintes URLs de redirecionamento:
  - `http://localhost:8080/auth/linkedin/callback`
  - `https://your-domain.com/auth/linkedin/callback` (se tiver domínio)

### 5. Gerar ACCESS_TOKEN

#### Opção A: Usando OAuth 2.0 Flow (Recomendado)
1. Copie o **Client ID** e **Client Secret**
2. Use a URL de autorização:
```
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:8080/auth/linkedin/callback&scope=r_liteprofile%20w_member_social
```
3. Substitua `YOUR_CLIENT_ID` pelo seu Client ID real
4. Acesse a URL no navegador
5. Autorize a aplicação
6. Copie o `code` da URL de redirecionamento
7. Troque o code por um access_token usando:
```bash
curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=YOUR_CODE" \
  -d "redirect_uri=http://localhost:8080/auth/linkedin/callback" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

#### Opção B: Usando LinkedIn Developer Tools (Mais Simples)
1. Na página da sua aplicação, procure por **"Generate Access Token"**
2. Selecione as permissões: `r_liteprofile` e `w_member_social`
3. Clique em **"Generate Token"**
4. Copie o token gerado

### 6. Configurar no Doppler

Após obter o ACCESS_TOKEN, configure no Doppler:

```bash
# Adicionar o novo ACCESS_TOKEN
doppler secrets set LINKEDIN_ACCESS_TOKEN="seu_access_token_aqui"

# Verificar se foi configurado
doppler secrets get LINKEDIN_ACCESS_TOKEN
```

### 7. Testar o Token

Execute o script de teste:

```bash
doppler run -- node test_new_access_token.mjs
```

## ⚠️ Importante

- **Validade**: ACCESS_TOKENs do LinkedIn geralmente expiram em 60 dias
- **Segurança**: Nunca compartilhe ou versione o ACCESS_TOKEN
- **Permissões**: Certifique-se de que `w_member_social` está habilitado
- **Rate Limits**: LinkedIn tem limites de API (100 posts por dia para aplicações em desenvolvimento)

## 🔍 Troubleshooting

### Erro: "insufficient_scope"
- Verifique se `w_member_social` está habilitado na aplicação
- Regenere o token com as permissões corretas

### Erro: "invalid_token"
- Token pode ter expirado
- Verifique se o token foi copiado corretamente
- Regenere um novo token

### Erro: "unauthorized_client"
- Verifique Client ID e Client Secret
- Certifique-se de que a aplicação está aprovada para "Share on LinkedIn"

## 📝 Próximos Passos

1. ✅ Gerar novo ACCESS_TOKEN
2. ✅ Configurar no Doppler
3. ✅ Testar com o script
4. ✅ Publicar post de teste
5. ✅ Verificar publicação no LinkedIn

---

**Dica**: Mantenha uma cópia segura do ACCESS_TOKEN e configure alertas para renovação antes do vencimento.