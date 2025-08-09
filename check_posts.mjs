import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Verificando posts no banco de dados...');

async function checkPosts() {
  try {
    // Buscar todos os posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar posts: ${error.message}`);
    }

    console.log(`📊 Total de posts encontrados: ${posts.length}`);
    
    if (posts.length === 0) {
      console.log('⚠️ Nenhum post encontrado no banco de dados');
      return false;
    }

    console.log('\n📝 Posts disponíveis:');
    posts.forEach((post, index) => {
      console.log(`\n${index + 1}. ID: ${post.id}`);
      console.log(`   Título: ${post.title || 'Sem título'}`);
      console.log(`   Conteúdo: ${(post.content || '').substring(0, 100)}...`);
      console.log(`   Hashtags: ${post.hashtags || 'Sem hashtags'}`);
      console.log(`   Usuário: ${post.user_id}`);
      console.log(`   Criado em: ${post.created_at}`);
      console.log(`   LinkedIn ID: ${post.linkedin_post_id || 'Não publicado'}`);
    });

    // Buscar especificamente posts relacionados a DevOps, automação, infraestrutura
    const devopsKeywords = ['devops', 'automation', 'infraestrutura', 'infrastructure', 'ci/cd', 'docker', 'kubernetes'];
    
    console.log('\n🔍 Buscando posts relacionados a DevOps...');
    const devopsPosts = posts.filter(post => {
      const searchText = `${post.title || ''} ${post.content || ''} ${post.hashtags || ''}`.toLowerCase();
      return devopsKeywords.some(keyword => searchText.includes(keyword));
    });

    if (devopsPosts.length > 0) {
      console.log(`\n✅ Encontrados ${devopsPosts.length} posts relacionados a DevOps:`);
      devopsPosts.forEach((post, index) => {
        console.log(`\n${index + 1}. ${post.title || 'Sem título'}`);
        console.log(`   ID: ${post.id}`);
        console.log(`   LinkedIn: ${post.linkedin_post_id ? 'Publicado' : 'Não publicado'}`);
      });
    } else {
      console.log('\n⚠️ Nenhum post relacionado a DevOps encontrado');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar posts:', error.message);
    return false;
  }
}

checkPosts().then(success => {
  process.exit(success ? 0 : 1);
});