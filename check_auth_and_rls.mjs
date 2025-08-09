import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuthAndRLS() {
  try {
    console.log('🔐 Verificando autenticação e RLS...');
    
    // Fazer login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'fabriciocardosolima@gmail.com',
      password: '123456'
    });
    
    if (authError) {
      console.error('❌ Erro de autenticação:', authError);
      return;
    }
    
    console.log('✅ Usuário autenticado:', authData.user.email);
    console.log('🆔 User ID:', authData.user.id);
    
    // Verificar posts com usuário autenticado
    console.log('\n📝 Verificando posts com usuário autenticado...');
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (postsError) {
      console.error('❌ Erro ao buscar posts:', postsError);
    } else {
      console.log(`✅ Encontrados ${posts.length} posts`);
      posts.forEach((post, index) => {
        console.log(`   Post ${index + 1}: ${post.title} (${post.id})`);
      });
    }
    
    // Verificar integrações com usuário autenticado
    console.log('\n🔗 Verificando integrações com usuário autenticado...');
    const { data: integrations, error: intError } = await supabase
      .from('linkedin_integrations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (intError) {
      console.error('❌ Erro ao buscar integrações:', intError);
    } else {
      console.log(`✅ Encontradas ${integrations.length} integrações`);
      integrations.forEach((integration, index) => {
        console.log(`   Integração ${index + 1}: ${integration.linkedin_id} (${integration.id})`);
      });
    }
    
    // Tentar criar um post simples para testar
    console.log('\n🧪 Testando criação de post...');
    const { data: testPost, error: testError } = await supabase
      .from('posts')
      .insert({
        user_id: authData.user.id,
        title: 'Teste de Post',
        content: 'Este é um post de teste para verificar se a criação está funcionando.',
        category: 'teste',
        status: 'draft',
        ai_generated: false
      })
      .select()
      .single();
    
    if (testError) {
      console.error('❌ Erro ao criar post de teste:', testError);
    } else {
      console.log('✅ Post de teste criado:', testPost.id);
      
      // Verificar se o post aparece na consulta
      const { data: verifyPost, error: verifyError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', testPost.id)
        .single();
      
      if (verifyError) {
        console.error('❌ Erro ao verificar post criado:', verifyError);
      } else {
        console.log('✅ Post verificado:', verifyPost.title);
      }
    }
    
    console.log('\n✅ Verificação de autenticação e RLS concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
    process.exit(1);
  }
}

checkAuthAndRLS();