# Configuração do Supabase - LinkedIn Post Pilot

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (https://supabase.com)
- Git instalado

## 🚀 Configuração Inicial

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com e faça login
2. Clique em "New Project"
3. Escolha sua organização
4. Configure o projeto:
   - **Name**: `linkedin-post-pilot`
   - **Database Password**: Crie uma senha segura
   - **Region**: Escolha a região mais próxima
5. Clique em "Create new project"
6. Aguarde a criação (pode levar alguns minutos)

### 2. Obter Credenciais

Após a criação do projeto:

1. Vá para **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (mantenha em segredo)

### 3. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e substitua:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
   ```

### 4. Executar Migrações do Banco

#### Opção A: Via Supabase Dashboard (Recomendado)

1. Acesse o **SQL Editor** no dashboard do Supabase
2. Copie o conteúdo do arquivo `supabase/migrations/001_initial_schema.sql`
3. Cole no editor SQL e execute
4. Verifique se todas as tabelas foram criadas em **Table Editor**

#### Opção B: Via CLI (Avançado)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Fazer login
supabase login

# Linkar projeto local com o remoto
supabase link --project-ref seu-project-id

# Executar migrações
supabase db push
```

### 5. Configurar Autenticação

1. Vá para **Authentication** > **Settings**
2. Configure:
   - **Site URL**: `http://localhost:5173` (desenvolvimento)
   - **Redirect URLs**: `http://localhost:5173/**`
3. Habilite provedores de email se necessário

### 6. Configurar Row Level Security (RLS)

As políticas RLS já estão incluídas no script de migração, mas verifique:

1. Vá para **Table Editor**
2. Para cada tabela, verifique se RLS está habilitado
3. Verifique as políticas em **Authentication** > **Policies**

## 🔧 Estrutura do Banco de Dados

### Tabelas Criadas:

- **users**: Perfis de usuário
- **posts**: Posts do LinkedIn
- **images**: Imagens geradas por IA
- **schedules**: Agendamentos de posts
- **analytics**: Métricas e analytics

### Relacionamentos:

```
users (1) -----> (N) posts
posts (1) -----> (1) images
posts (1) -----> (N) schedules
posts (1) -----> (N) analytics
```

## 🧪 Testando a Configuração

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse `http://localhost:5173`
3. Tente criar uma conta em `/register`
4. Verifique se o usuário foi criado na tabela `users`

## 🔍 Troubleshooting

### Erro: "Invalid API key"
- Verifique se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretas
- Certifique-se de que não há espaços extras

### Erro: "relation does not exist"
- Execute novamente o script de migração
- Verifique se todas as tabelas foram criadas

### Erro de CORS
- Verifique a configuração de **Site URL** e **Redirect URLs**
- Certifique-se de que `http://localhost:5173` está nas URLs permitidas

### Erro de RLS
- Verifique se as políticas RLS estão ativas
- Teste com um usuário autenticado

## 📚 Próximos Passos

Após a configuração básica:

1. ✅ Configurar autenticação
2. ⏳ Implementar integração com LinkedIn API
3. ⏳ Configurar APIs de IA no backend
4. ⏳ Implementar sistema de agendamento
5. ⏳ Configurar analytics e métricas

## 🔗 Links Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/reference/cli)

---

**Nota**: Este é um setup inicial. Para produção, configure domínios próprios, SSL, backup automático e monitoramento.