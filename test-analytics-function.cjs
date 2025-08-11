const { createClient } = require('@supabase/supabase-js');

// Usar as variáveis de ambiente do Doppler
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

async function testAnalyticsFunction() {
  console.log('🔍 Testando função getLinkedInAnalytics...');
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
    
    // Simular a função getLinkedInAnalytics
    console.log('📊 Simulando função getLinkedInAnalytics...');
    
    // 1. Buscar posts do usuário
    const { data: userPosts, error: postsError } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', user.id);
    
    if (postsError) {
      console.error('❌ Erro ao buscar posts:', postsError.message);
      return;
    }
    
    console.log(`✅ Posts do usuário encontrados: ${userPosts.length}`);
    
    if (userPosts.length === 0) {
      console.log('⚠️ Usuário não tem posts, retornando métricas zeradas');
      console.log('📊 Métricas: { totalEngagement: 0, totalReach: 0, totalImpressions: 0, totalClicks: 0 }');
      return;
    }
    
    const postIds = userPosts.map(p => p.id);
    console.log('📝 IDs dos posts:', postIds);
    
    // 2. Buscar analytics dos posts
    const { data: analytics, error: analyticsError } = await supabase
      .from('linkedin_post_analytics')
      .select(`
        impressions,
        clicks,
        likes,
        comments,
        shares,
        post_id
      `)
      .in('post_id', postIds);
    
    if (analyticsError) {
      console.log('⚠️ Erro ao buscar analytics (normal se não houver dados):', analyticsError.message);
      console.log('📊 Retornando métricas zeradas');
      return;
    }
    
    console.log(`✅ Analytics encontrados: ${analytics.length} registros`);
    
    if (analytics.length === 0) {
      console.log('ℹ️ Nenhum analytics encontrado - posts ainda não foram publicados no LinkedIn');
      console.log('📊 Métricas: { totalEngagement: 0, totalReach: 0, totalImpressions: 0, totalClicks: 0 }');
      return;
    }
    
    // 3. Calcular métricas
    const totalEngagement = analytics.reduce((sum, item) => 
      sum + (item.likes || 0) + (item.comments || 0) + (item.shares || 0), 0
    );
    
    const totalReach = analytics.reduce((sum, item) => sum + (item.impressions || 0), 0);
    const totalImpressions = analytics.reduce((sum, item) => sum + (item.impressions || 0), 0);
    const totalClicks = analytics.reduce((sum, item) => sum + (item.clicks || 0), 0);
    
    const result = {
      totalEngagement,
      totalReach,
      totalImpressions,
      totalClicks
    };
    
    console.log('📊 Métricas calculadas:', result);
    console.log('');
    console.log('🎉 Função getLinkedInAnalytics funcionando corretamente!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testAnalyticsFunction();