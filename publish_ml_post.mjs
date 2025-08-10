import { createClient } from '@supabase/supabase-js';

async function publishMLPost() {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    const linkedinClientId = process.env.LINKEDIN_CLIENT_ID;
    const linkedinClientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const linkedinAccessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variáveis do Supabase não encontradas');
    }
    
    if (!linkedinClientId || !linkedinClientSecret || !linkedinAccessToken) {
      throw new Error('Credenciais do LinkedIn não encontradas no Doppler');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fazer login automático
    console.log('🔐 Fazendo login automático...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'fabriciocardosolima@gmail.com',
      password: '123456'
    });
    
    if (authError) {
      throw new Error(`Erro de autenticação: ${authError.message}`);
    }
    
    console.log('✅ Login realizado com sucesso!');
    
    // Buscar o post mais recente sobre Machine Learning
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', authData.user.id)
      .ilike('title', '%Machine Learning%')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (postsError || !posts || posts.length === 0) {
      throw new Error('Post sobre Machine Learning não encontrado');
    }
    
    const post = posts[0];
    console.log('📝 Post encontrado:', post.title);
    
    // Preparar conteúdo para o LinkedIn
    const linkedinContent = {
      author: `urn:li:person:${linkedinClientId}`, // Usar CLIENT_ID como person ID
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: post.content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };
    
    // Publicar no LinkedIn
    console.log('🚀 Publicando no LinkedIn...');
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${linkedinAccessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(linkedinContent)
    });
    
    const responseData = await response.text();
    
    if (!response.ok) {
      console.error('❌ Erro na resposta do LinkedIn:', response.status, responseData);
      throw new Error(`Erro ao publicar no LinkedIn: ${response.status} - ${responseData}`);
    }
    
    const linkedinPost = JSON.parse(responseData);
    console.log('🎉 Post publicado com sucesso no LinkedIn!');
    console.log('🔗 ID do post no LinkedIn:', linkedinPost.id);
    
    // Atualizar o post no banco com o ID do LinkedIn
    const { error: updateError } = await supabase
      .from('posts')
      .update({ 
        linkedin_post_id: linkedinPost.id,
        published_at: new Date().toISOString()
      })
      .eq('id', post.id);
    
    if (updateError) {
      console.warn('⚠️ Aviso: Não foi possível atualizar o post no banco:', updateError.message);
    } else {
      console.log('✅ Post atualizado no banco de dados!');
    }
    
    return {
      success: true,
      postId: post.id,
      linkedinPostId: linkedinPost.id,
      title: post.title
    };
    
  } catch (error) {
    console.error('❌ Erro ao publicar post:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

publishMLPost().then(result => {
  if (result.success) {
    console.log('\n🎊 SUCESSO! Post publicado no LinkedIn!');
    console.log('📋 Título:', result.title);
    console.log('🆔 ID do Post:', result.postId);
    console.log('🔗 LinkedIn Post ID:', result.linkedinPostId);
  } else {
    console.log('\n💥 FALHA na publicação:', result.error);
    process.exit(1);
  }
});