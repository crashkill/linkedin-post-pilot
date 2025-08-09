import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPost() {
  try {
    console.log('🔍 Verificando posts no banco de dados...');
    
    // Buscar todos os posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('❌ Erro ao buscar posts:', error);
      return;
    }
    
    console.log(`✅ Encontrados ${posts.length} posts:`);
    
    posts.forEach((post, index) => {
      console.log(`\n📝 Post ${index + 1}:`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Título: ${post.title}`);
      console.log(`   Categoria: ${post.category}`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Publicado no LinkedIn: ${post.published_to_linkedin ? 'Sim' : 'Não'}`);
      console.log(`   LinkedIn Post ID: ${post.linkedin_post_id || 'N/A'}`);
      console.log(`   Criado em: ${new Date(post.created_at).toLocaleString('pt-BR')}`);
      console.log(`   Conteúdo (primeiros 100 chars): ${post.content.substring(0, 100)}...`);
    });
    
    // Verificar integrações do LinkedIn
    console.log('\n🔗 Verificando integrações do LinkedIn...');
    
    const { data: integrations, error: intError } = await supabase
      .from('linkedin_integrations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (intError) {
      console.error('❌ Erro ao buscar integrações:', intError);
      return;
    }
    
    console.log(`✅ Encontradas ${integrations.length} integrações:`);
    
    integrations.forEach((integration, index) => {
      console.log(`\n🔗 Integração ${index + 1}:`);
      console.log(`   ID: ${integration.id}`);
      console.log(`   User ID: ${integration.user_id}`);
      console.log(`   LinkedIn ID: ${integration.linkedin_id}`);
      console.log(`   Ativa: ${integration.is_active ? 'Sim' : 'Não'}`);
      console.log(`   Conectada em: ${new Date(integration.connected_at).toLocaleString('pt-BR')}`);
      console.log(`   Expira em: ${new Date(integration.expires_at).toLocaleString('pt-BR')}`);
    });
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
    process.exit(1);
  }
}

verifyPost();