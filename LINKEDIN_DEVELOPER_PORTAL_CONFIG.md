# 🔧 Configuração do LinkedIn Developer Portal

## 📍 Você está aqui: LinkedIn Developer Portal

### 🎯 Objetivo
Configurar sua aplicação LinkedIn para permitir publicação de posts com os escopos corretos.

---

## 🚀 Passos para Configuração

### 1. **Localizar sua Aplicação**
- Na página principal do Developer Portal, procure por sua aplicação
- Clique no nome da aplicação para acessar as configurações

### 2. **Configurar Produtos (Products)**
- No menu lateral, clique em **"Products"**
- Procure por **"Share on LinkedIn"** ou **"Marketing Developer Platform"**
- Clique em **"Request access"** ou **"Add to app"**

### 3. **Configurar Auth (OAuth 2.0)**
- No menu lateral, clique em **"Auth"**
- Verifique se os **Redirect URLs** incluem:
  ```
  http://localhost:8080/callback
  ```
- Se não estiver, adicione esta URL

### 4. **Verificar Escopos Disponíveis**
Após adicionar os produtos, você deve ter acesso a:
- ✅ `r_liteprofile` - Perfil básico
- ✅ `w_member_social` - Publicar posts
- ✅ `r_emailaddress` - Email (opcional)

### 5. **Salvar Configurações**
- Clique em **"Update"** ou **"Save"** em cada seção modificada

---

## 🔍 Verificações Importantes

### ✅ Checklist de Configuração
- [ ] Produto "Share on LinkedIn" adicionado
- [ ] Redirect URL `http://localhost:8080/callback` configurado
- [ ] Escopos `r_liteprofile` e `w_member_social` disponíveis
- [ ] Configurações salvas

### 📋 Informações Necessárias
Anote estas informações da sua aplicação:
- **Client ID**: (já temos no Doppler)
- **Client Secret**: (já temos no Doppler)
- **Escopos disponíveis**: Verifique quais estão ativos

---

## 🎯 Próximos Passos

Após configurar no Developer Portal:

1. **Reiniciar o servidor OAuth**:
   ```bash
   doppler run -- node oauth_server.mjs
   ```

2. **Acessar a interface de autorização**:
   ```
   http://localhost:8080
   ```

3. **Testar a autorização** com os novos escopos

---

## 🆘 Problemas Comuns

### Erro: "Scope not authorized"
- **Causa**: Produto não adicionado à aplicação
- **Solução**: Adicionar "Share on LinkedIn" nos Products

### Erro: "Invalid redirect_uri"
- **Causa**: URL de callback não configurada
- **Solução**: Adicionar `http://localhost:8080/callback` nos Redirect URLs

### Erro: "Application not approved"
- **Causa**: Aplicação precisa de aprovação para alguns escopos
- **Solução**: Aguardar aprovação ou usar escopos básicos

---

## 📞 Suporte

Se encontrar dificuldades:
1. Verifique a documentação oficial do LinkedIn
2. Confirme se todos os produtos necessários foram adicionados
3. Aguarde alguns minutos após salvar as configurações

**🎉 Após configurar, volte ao terminal para testar a autorização!**