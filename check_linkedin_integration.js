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

async function checkLinkedInIntegration() {
  try {
    console.log('🔐 Fazendo login...');
    
    const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
      email: USER_CREDENTIALS.email,
      password: USER_CREDENTIALS.password
    });
    
    if (loginError) {
      throw new Error(`Erro no login: ${loginError.message}`);
    }
    
    console.log('✅ Login realizado com sucesso!');
    console.log('👤 User ID:', sessionData.session.user.id);
    
    // Verificar integrações LinkedIn
    console.log('\n🔍 Verificando integrações LinkedIn...');
    
    const { data: integrations, error: integrationsError } = await supabase
      .from('linkedin_integrations')
      .select('*')
      .eq('user_id', sessionData.session.user.id);
    
    if (integrationsError) {
      console.error('❌ Erro ao buscar integrações:', integrationsError.message);
      return;
    }
    
    console.log('📊 Total de integrações encontradas:', integrations?.length || 0);
    
    if (integrations && integrations.length > 0) {
      integrations.forEach((integration, index) => {
        console.log(`\n📋 Integração ${index + 1}:`);
        console.log('   • ID:', integration.id);
        console.log('   • LinkedIn ID:', integration.linkedin_id);
        console.log('   • Ativa:', integration.is_active);
        console.log('   • Expira em:', integration.expires_at);
        console.log('   • Token:', integration.access_token.substring(0, 20) + '...');
        console.log('   • Criada em:', integration.created_at);
      });
      
      // Verificar integrações ativas
      const activeIntegrations = integrations.filter(i => i.is_active);
      console.log(`\n✅ Integrações ativas: ${activeIntegrations.length}`);
      
      if (activeIntegrations.length > 0) {
        console.log('🎉 Há integrações LinkedIn ativas!');
      } else {
        console.log('⚠️  Nenhuma integração LinkedIn ativa encontrada.');
      }
    } else {
      console.log('❌ Nenhuma integração LinkedIn encontrada.');
      console.log('💡 Isso explica por que a publicação falha.');
    }
    
    // Verificar posts
    console.log('\n🔍 Verificando posts...');
    
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', sessionData.session.user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (postsError) {
      console.error('❌ Erro ao buscar posts:', postsError.message);
      return;
    }
    
    console.log('📊 Total de posts encontrados:', posts?.length || 0);
    
    if (posts && posts.length > 0) {
      posts.forEach((post, index) => {
        console.log(`\n📝 Post ${index + 1}:`);
        console.log('   • ID:', post.id);
        console.log('   • Título:', post.title?.substring(0, 50) + '...');
        console.log('   • Status:', post.status);
        console.log('   • Publicado no LinkedIn:', post.published_to_linkedin);
        console.log('   • LinkedIn Post ID:', post.linkedin_post_id || 'N/A');
        console.log('   • Criado em:', post.created_at);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar verificação
checkLinkedInIntegration().catch(console.error);