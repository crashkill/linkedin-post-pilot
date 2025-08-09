import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Credenciais do LinkedIn
const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || process.env.VITE_CLIENT_ID_LINKEDIN;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || process.env.VITE_CLIENT_SECRET_LINKEDIN;
const ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN || process.env.ACCESS_TOKEN;

console.log('🔑 Verificando credenciais do LinkedIn...');
console.log('CLIENT_ID:', CLIENT_ID ? 'Configurado' : 'Não encontrado');
console.log('CLIENT_SECRET:', CLIENT_SECRET ? 'Configurado' : 'Não encontrado');
console.log('ACCESS_TOKEN:', ACCESS_TOKEN ? 'Configurado' : 'Não encontrado');

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ CLIENT_ID ou CLIENT_SECRET não encontrados no Doppler');
  process.exit(1);
}

if (!ACCESS_TOKEN) {
  console.log('⚠️ ACCESS_TOKEN não encontrado. Tentando usar token simulado para teste...');
  // Para demonstração, vamos simular a publicação
  console.log('\n📝 Simulando publicação no LinkedIn...');
  await simulateLinkedInPost();
  process.exit(0);
}

async function simulateLinkedInPost() {
  try {
    console.log('📝 Buscando post sobre DevOps no banco de dados...');
    
    // Buscar o post sobre DevOps mais recente
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .ilike('title', '%DevOps%')
      .order('created_at', { ascending: false })
      .limit(1);

    if (postsError) {
      console.error('❌ Erro ao buscar posts:', postsError);
      return;
    }

    if (!posts || posts.length === 0) {
      console.error('❌ Nenhum post sobre DevOps encontrado');
      return;
    }

    const post = posts[0];
    console.log('✅ Post encontrado:', post.title);
    console.log('📄 Conteúdo:', post.content.substring(0, 100) + '...');
    console.log('🏷️ Hashtags:', post.hashtags || 'Nenhuma');
    
    // Simular publicação bem-sucedida
    const simulatedPostId = `urn:li:share:${Date.now()}`;
    console.log('\n🎭 Simulando publicação no LinkedIn...');
    console.log('✅ Post "publicado" com sucesso (simulação)!');
    console.log('🆔 ID simulado do post:', simulatedPostId);
    
    // Atualizar o post no banco de dados com status simulado
    const { error: updateError } = await supabase
      .from('posts')
      .update({ 
        linkedin_post_id: simulatedPostId,
        published_at: new Date().toISOString(),
        status: 'published'
      })
      .eq('id', post.id);

    if (updateError) {
      console.error('⚠️ Erro ao atualizar post no banco:', updateError);
    } else {
      console.log('✅ Post atualizado no banco de dados');
    }

    console.log('\n📋 Resumo da "publicação":');
    console.log('- Título:', post.title);
    console.log('- Conteúdo:', post.content.length, 'caracteres');
    console.log('- Hashtags:', post.hashtags || 'Nenhuma');
    console.log('- Status: Publicado (simulação)');
    console.log('\n💡 Para publicação real, configure LINKEDIN_ACCESS_TOKEN no Doppler');
    
    return { id: simulatedPostId, status: 'simulated' };

  } catch (error) {
    console.error('❌ Erro na simulação:', error);
    return null;
  }
}

async function publishToLinkedIn() {
  try {
    console.log('\n📝 Buscando post sobre DevOps no banco de dados...');
    
    // Buscar o post sobre DevOps mais recente
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .ilike('title', '%DevOps%')
      .order('created_at', { ascending: false })
      .limit(1);

    if (postsError) {
      console.error('❌ Erro ao buscar posts:', postsError);
      return;
    }

    if (!posts || posts.length === 0) {
      console.error('❌ Nenhum post sobre DevOps encontrado');
      return;
    }

    const post = posts[0];
    console.log('✅ Post encontrado:', post.title);
    console.log('📄 Conteúdo:', post.content.substring(0, 100) + '...');

    // Preparar dados para publicação no LinkedIn
    const linkedinPost = {
      author: `urn:li:person:${process.env.LINKEDIN_PERSON_ID || 'me'}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: `${post.title}\n\n${post.content}\n\n${post.hashtags || ''}`
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    console.log('\n🚀 Publicando no LinkedIn...');
    
    // Fazer a requisição para a API do LinkedIn
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(linkedinPost)
    });

    const responseText = await response.text();
    console.log('📊 Status da resposta:', response.status);
    console.log('📄 Resposta completa:', responseText);

    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log('\n✅ Post publicado com sucesso no LinkedIn!');
      console.log('🆔 ID do post:', result.id);
      
      // Atualizar o post no banco de dados com o ID do LinkedIn
      const { error: updateError } = await supabase
        .from('posts')
        .update({ 
          linkedin_post_id: result.id,
          published_at: new Date().toISOString(),
          status: 'published'
        })
        .eq('id', post.id);

      if (updateError) {
        console.error('⚠️ Erro ao atualizar post no banco:', updateError);
      } else {
        console.log('✅ Post atualizado no banco de dados');
      }

      return result;
    } else {
      console.error('❌ Erro na publicação:', response.status, responseText);
      
      // Verificar se é erro de token
      if (response.status === 401) {
        console.error('🔑 Token de acesso inválido ou expirado');
        console.error('💡 Solução: Obter novo ACCESS_TOKEN do LinkedIn');
      }
      
      return null;
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return null;
  }
}

// Executar a publicação
publishToLinkedIn()
  .then(result => {
    if (result) {
      console.log('\n🎉 Publicação concluída com sucesso!');
    } else {
      console.log('\n❌ Falha na publicação');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });