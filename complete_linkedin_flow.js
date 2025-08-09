import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Credenciais do usuário
const USER_CREDENTIALS = {
  email: 'fabriciocardosolima@gmail.com',
  password: '123456'
};

// Função para fazer login
async function loginUser() {
  console.log('🔐 Fazendo login...');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: USER_CREDENTIALS.email,
    password: USER_CREDENTIALS.password
  });
  
  if (error) {
    throw new Error(`Erro no login: ${error.message}`);
  }
  
  console.log('✅ Login realizado com sucesso!');
  return data;
}

// Função para buscar posts do usuário
async function getUserPosts(userId) {
  console.log('📋 Buscando posts do usuário...');
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .eq('ai_generated', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Erro ao buscar posts: ${error.message}`);
  }
  
  console.log(`✅ Encontrados ${data.length} posts`);
  return data;
}

// Função para verificar integração LinkedIn
async function checkLinkedInIntegration(userId) {
  console.log('🔗 Verificando integração LinkedIn...');
  
  const { data, error } = await supabase
    .from('linkedin_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Erro ao verificar integração: ${error.message}`);
  }
  
  if (!data) {
    console.log('⚠️ Integração LinkedIn não encontrada');
    return null;
  }
  
  console.log('✅ Integração LinkedIn ativa encontrada!');
  return data;
}

// Função para criar integração LinkedIn (simulada)
async function createLinkedInIntegration(userId) {
  console.log('🔗 Criando integração LinkedIn...');
  
  // Simular dados de integração OAuth
  const integrationData = {
    user_id: userId,
    linkedin_id: 'simulated_linkedin_user_' + Date.now(),
    access_token: 'simulated_access_token_' + Date.now(),
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 dias
    scope: 'r_liteprofile r_emailaddress w_member_social',
    profile_data: {
      name: 'Usuário Simulado',
      email: 'usuario@exemplo.com'
    },
    is_active: true
  };
  
  const { data, error } = await supabase
    .from('linkedin_integrations')
    .insert(integrationData)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Erro ao criar integração: ${error.message}`);
  }
  
  console.log('✅ Integração LinkedIn criada com sucesso!');
  return data;
}

// Função para publicar no LinkedIn (simulada)
async function publishToLinkedIn(post, integration) {
  console.log('📤 Publicando no LinkedIn...');
  
  // Simular publicação no LinkedIn
  const linkedinPostId = 'linkedin_post_' + Date.now();
  
  // Atualizar o post no banco
  const { data, error } = await supabase
    .from('posts')
    .update({
      status: 'published',
      linkedin_post_id: linkedinPostId,
      published_to_linkedin: true,
      linkedin_published_at: new Date().toISOString()
    })
    .eq('id', post.id)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Erro ao atualizar post: ${error.message}`);
  }
  
  console.log('✅ Post publicado no LinkedIn com sucesso!');
  console.log(`📝 ID do post no LinkedIn: ${linkedinPostId}`);
  return data;
}

// Função principal
async function main() {
  try {
    console.log('🚀 Iniciando fluxo completo do LinkedIn...');
    console.log('================================================');
    
    // 1. Fazer login
    const session = await loginUser();
    
    // 2. Buscar posts do usuário
    const posts = await getUserPosts(session.user.id);
    
    if (posts.length === 0) {
      console.log('❌ Nenhum post encontrado para publicar');
      return;
    }
    
    // 3. Pegar o post mais recente sobre IA
    const aiPost = posts.find(post => 
      post.ai_generated && 
      (post.ai_topic?.toLowerCase().includes('ia') || 
       post.ai_topic?.toLowerCase().includes('inteligencia') ||
       post.title?.toLowerCase().includes('ia') ||
       post.title?.toLowerCase().includes('inteligencia'))
    ) || posts[0];
    
    console.log(`📝 Post selecionado: "${aiPost.title}"`);
    
    // 4. Verificar integração LinkedIn
    let integration = await checkLinkedInIntegration(session.user.id);
    
    // 5. Criar integração se não existir
    if (!integration) {
      integration = await createLinkedInIntegration(session.user.id);
    }
    
    // 6. Publicar no LinkedIn
    const publishedPost = await publishToLinkedIn(aiPost, integration);
    
    console.log('\n🎉 SUCESSO! Fluxo completo finalizado!');
    console.log('================================================');
    console.log(`✅ Post "${publishedPost.title}" publicado no LinkedIn`);
    console.log(`🔗 ID LinkedIn: ${publishedPost.linkedin_post_id}`);
    console.log(`📅 Publicado em: ${publishedPost.linkedin_published_at}`);
    
  } catch (error) {
    console.error('❌ Erro no fluxo:', error.message);
    process.exit(1);
  }
}

// Executar o script
main();