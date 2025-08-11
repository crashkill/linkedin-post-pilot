const { createClient } = require('@supabase/supabase-js');

// Usar as variáveis de ambiente do Doppler
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Definida' : '❌ Não definida');
  process.exit(1);
}

async function testDashboardMetrics() {
  console.log('🔍 Testando métricas do Dashboard...');
  console.log('');
  
  try {
    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Cliente Supabase criado');
    
    // Testar autenticação
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'fabriciocardosolima@gmail.com',
      password: '123456'
    });
    
    if (authError) {
      console.error('❌ Erro na autenticação:', authError.message);
      return;
    }
    
    console.log('✅ Usuário autenticado:', user.email);
    console.log('');
    
    // Testar busca de posts
    console.log('📝 Buscando posts do usuário...');
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (postsError) {
      console.error('❌ Erro ao buscar posts:', postsError.message);
      return;
    }
    
    console.log(`✅ Posts encontrados: ${posts.length}`);
    
    // Calcular estatísticas básicas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const scheduledPosts = posts.filter(post => post.status === 'scheduled');
    const todayPosts = posts.filter(post => {
      if (!post.scheduled_for) return false;
      const postDate = new Date(post.scheduled_for);
      return postDate >= today && postDate < tomorrow;
    });
    
    console.log('');
    console.log('📊 Estatísticas básicas:');
    console.log(`- Total de posts: ${posts.length}`);
    console.log(`- Posts agendados: ${scheduledPosts.length}`);
    console.log(`- Posts para hoje: ${todayPosts.length}`);
    console.log('');
    
    // Testar busca de analytics do LinkedIn
    console.log('📈 Buscando analytics do LinkedIn...');
    const { data: analytics, error: analyticsError } = await supabase
      .from('linkedin_post_analytics')
      .select(`
        impressions,
        clicks,
        likes,
        comments,
        shares,
        post_id
      `);
    
    if (analyticsError) {
      console.log('⚠️ Tabela de analytics não encontrada ou vazia:', analyticsError.message);
      console.log('ℹ️ Isso é normal se ainda não há posts publicados no LinkedIn');
    } else {
      console.log(`✅ Analytics encontrados: ${analytics.length} registros`);
      
      if (analytics.length > 0) {
        const totalEngagement = analytics.reduce((sum, item) => 
          sum + (item.likes || 0) + (item.comments || 0) + (item.shares || 0), 0
        );
        const totalImpressions = analytics.reduce((sum, item) => sum + (item.impressions || 0), 0);
        
        console.log('📊 Métricas do LinkedIn:');
        console.log(`- Total de engajamento: ${totalEngagement}`);
        console.log(`- Total de impressões: ${totalImpressions}`);
      }
    }
    
    console.log('');
    console.log('🎉 Teste de métricas do Dashboard concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testDashboardMetrics();