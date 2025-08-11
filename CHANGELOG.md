# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [2.1.0] - 2025-01-11

### 🔧 Correções
- **Resolvido:** Erro "ACCESS_TOKEN do LinkedIn não encontrado no Doppler"
- **Resolvido:** Erro "Token inválido" na geração de imagem com Hugging Face
- **Corrigido:** Edge Functions não recebiam variáveis de ambiente do Doppler

### ✨ Melhorias
- **Implementado:** Detecção automática de ambiente (local vs produção)
- **Adicionado:** Bypass de autenticação para desenvolvimento local
- **Configurado:** URLs automáticas baseadas no ambiente
- **Otimizado:** Edge Functions com configurações específicas por ambiente

### 🏗️ Arquitetura
- **linkedin-auth:** Bypass de JWT em ambiente local
- **huggingface-proxy:** Configuração inteligente de autenticação
- **aiService.js:** Detecção automática de URLs (local/produção)
- **config.toml:** Configurações específicas por função

### 📁 Arquivos Modificados
- `supabase/config.toml` - Adicionadas configurações de JWT por função
- `supabase/functions/linkedin-auth/index.ts` - Implementado bypass local
- `supabase/functions/huggingface-proxy/index.ts` - Configuração inteligente
- `src/services/aiService.js` - Detecção automática de ambiente
- `README.md` - Documentação atualizada

### 🔐 Segurança
- Mantida verificação completa de JWT em produção
- Bypass de autenticação apenas em ambiente local
- Variáveis de ambiente protegidas via Doppler

### 🚀 Deploy
- Aplicação reiniciada com todas as correções
- Nova porta: http://localhost:8081/
- Edge Functions: http://127.0.0.1:54321/functions/v1/

---

## [2.0.0] - 2025-01-10

### ✨ Funcionalidades Principais
- Geração de posts com IA (Groq, Gemini, Hugging Face)
- Integração completa com LinkedIn API
- Sistema de agendamento de posts
- Geração de imagens com IA
- Dashboard de analytics
- Sistema de templates
- Autenticação segura com Supabase

### 🔐 Segurança
- Migração completa para Doppler
- Gerenciamento seguro de secrets
- Autenticação JWT
- Rate limiting nas APIs

### 🏗️ Infraestrutura
- Supabase como backend
- Edge Functions para APIs
- Storage para imagens
- PostgreSQL como banco de dados