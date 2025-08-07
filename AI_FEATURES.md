# 🤖 Funcionalidades de IA - Tech Post Pilot

## 🌟 Visão Geral

O Tech Post Pilot agora conta com poderosas funcionalidades de IA para geração automática de conteúdo para LinkedIn, utilizando as melhores APIs gratuitas disponíveis.

## 🔧 APIs Integradas

### 1. **Groq** - Geração de Texto
- **Modelo**: Llama 3.1 70B
- **Limite Gratuito**: 1.000 requests/dia, 6.000 tokens/minuto
- **Uso**: Geração de posts, títulos e melhoria de conteúdo
- **Site**: [console.groq.com](https://console.groq.com/keys)

### 2. **Google AI Studio (Gemini)** - Geração de Texto
- **Modelo**: Gemini 1.5 Flash
- **Limite Gratuito**: 1.000.000 tokens/minuto, 1.500 requests/dia
- **Uso**: Alternativa para geração de conteúdo
- **Site**: [aistudio.google.com](https://aistudio.google.com/app/apikey)

### 3. **Hugging Face** - Geração de Imagens
- **Modelo**: Stable Diffusion XL
- **Limite Gratuito**: $0.10/mês em créditos
- **Uso**: Geração de imagens para posts
- **Site**: [huggingface.co](https://huggingface.co/settings/tokens)

## ✨ Funcionalidades Implementadas

### 🎯 Geração Automática de Posts
- **Input**: Tópico + Categoria
- **Output**: Título + Conteúdo + Imagem
- **Tecnologia**: Groq + Hugging Face

### 🔄 Melhoria de Conteúdo
- **Input**: Texto existente
- **Output**: Versão melhorada e otimizada
- **Tecnologia**: Groq/Gemini

### 🖼️ Geração de Imagens
- **Input**: Descrição do conteúdo
- **Output**: Imagem relevante
- **Tecnologia**: Hugging Face Stable Diffusion

### #️⃣ Geração de Hashtags
- **Input**: Conteúdo do post
- **Output**: Hashtags relevantes
- **Tecnologia**: Groq/Gemini

## 🚀 Como Usar

### 1. Configuração das Chaves de API

```bash
# Configure as chaves de API no Doppler
doppler secrets set GROQ_API_KEY="sua_chave_groq"
doppler secrets set GEMINI_API_KEY="sua_chave_gemini"
doppler secrets set HUGGINGFACE_API_KEY="sua_chave_hf"

# Verificar se as chaves foram configuradas
doppler secrets
```

### 2. Iniciando a Aplicação

```bash
# Executar com Doppler
npm run dev:doppler

# Ou diretamente
doppler run -- npm run dev
```

### 3. Criando Posts com IA

1. Acesse a seção "Posts"
2. Clique em "Novo Post"
3. Escolha a aba "Gerar com IA"
4. Digite um tópico (ex: "Tendências de IA em 2024")
5. Selecione uma categoria
6. Clique em "Gerar Post Completo"
7. Edite o resultado se necessário
8. Gere uma imagem complementar
9. Publique ou salve como rascunho

## 🔒 Segurança

- ✅ Todas as chaves são gerenciadas pelo Doppler
- ✅ Variáveis de ambiente com prefixo `VITE_` para frontend
- ✅ Nunca exponha chaves no código
- ✅ Rate limiting implementado
- ✅ Tratamento de erros robusto

## ✅ Checklist de Configuração

- [ ] Doppler configurado e logado
- [ ] Chaves de API configuradas no Doppler
- [ ] Supabase conectado
- [ ] Edge Functions deployadas
- [ ] Rate limiting configurado
- [ ] Testes de geração funcionando
- [ ] Projeto executando com `npm run dev:doppler`
- ✅ Todas as chaves são gerenciadas pelo Doppler
- ✅ Nenhum arquivo .env no projeto

## 🎨 Interface

### Modal de Criação
- **Abas**: Geração com IA vs Manual
- **Campos**: Tópico, Categoria, Título, Conteúdo
- **Botões**: Gerar Post, Melhorar Conteúdo, Gerar Imagem
- **Preview**: Visualização em tempo real

### Funcionalidades Visuais
- 🌟 Ícones de IA (Sparkles, Wand2)
- 🎨 Gradientes azul-roxo
- ⚡ Loading states animados
- 🔔 Notificações de sucesso/erro
- 📱 Design responsivo

## 🛠️ Arquitetura Técnica

### Estrutura de Arquivos
```
src/
├── services/
│   └── aiService.js          # Serviço principal de IA
├── components/
│   └── Posts.tsx             # Componente com funcionalidades de IA
└── hooks/
    └── use-toast.ts          # Hook para notificações
```

### Fluxo de Dados
1. **Input do Usuário** → Tópico + Categoria
2. **Processamento** → APIs de IA (Groq/Gemini/HF)
3. **Output** → Título + Conteúdo + Imagem
4. **Refinamento** → Edição manual + Melhorias
5. **Publicação** → LinkedIn API

## 📊 Monitoramento

### Logs e Debugging
- Console logs para cada chamada de API
- Tratamento de erros específicos
- Fallbacks entre diferentes APIs
- Métricas de uso (tokens, requests)

### Performance
- Lazy loading de imagens
- Debounce em inputs
- Cache de resultados
- Otimização de requests

## 🔮 Próximas Funcionalidades

- [ ] Análise de sentimento
- [ ] Sugestões de horário ideal
- [ ] Templates personalizados
- [ ] Integração com mais modelos
- [ ] Analytics de performance
- [ ] Agendamento inteligente

## 🤝 Contribuição

Para adicionar novas funcionalidades de IA:

1. Estenda a classe `AIService`
2. Adicione novos métodos
3. Implemente tratamento de erros
4. Atualize a interface do usuário
5. Documente as mudanças

---

**Desenvolvido com ❤️ usando as melhores práticas de IA e segurança**