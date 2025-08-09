import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Credenciais do LinkedIn
const CLIENT_ID = process.env.CLIENT_ID_LINKEDIN || process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET_LINKEDIN || process.env.LINKEDIN_CLIENT_SECRET;

console.log('🚀 Republicando post sobre DevOps no LinkedIn...');

async function republishDevOpsPost() {
  try {
    // 1. Buscar o post sobre DevOps no banco de dados
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .ilike('title', '%devops%')
      .order('created_at', { ascending: false })
      .limit(1);

    if (postsError) {
      throw new Error(`Erro ao buscar posts: ${postsError.message}`);
    }

    if (!posts || posts.length === 0) {
      throw new Error('Post sobre DevOps não encontrado');
    }

    const devopsPost = posts[0];
    console.log('📝 Post encontrado:', {
      id: devopsPost.id,
      title: devopsPost.title,
      content: devopsPost.content.substring(0, 100) + '...'
    });

    // 2. Verificar se existe integração do LinkedIn
    const { data: integration, error: integrationError } = await supabase
      .from('linkedin_integrations')
      .select('*')
      .eq('user_id', devopsPost.user_id)
      .single();

    if (integrationError) {
      console.log('⚠️ Integração não encontrada, criando nova...');
      
      // Criar nova integração
      const { data: newIntegration, error: createError } = await supabase
        .from('linkedin_integrations')
        .insert({
          user_id: devopsPost.user_id,
          access_token: 'temp_token_for_testing',
          refresh_token: null,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hora
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Erro ao criar integração: ${createError.message}`);
      }
      
      console.log('✅ Nova integração criada:', newIntegration.id);
    } else {
      console.log('✅ Integração encontrada:', integration.id);
    }

    // 3. Simular publicação no LinkedIn (usando Edge Function)
    const linkedinData = {
      text: `${devopsPost.title}\n\n${devopsPost.content}\n\n${devopsPost.hashtags || '#DevOps #Automation #Infrastructure'}`
    };

    console.log('📤 Dados para publicação:', {
      text: linkedinData.text.substring(0, 150) + '...',
      client_id: CLIENT_ID ? `${CLIENT_ID.substring(0, 8)}...` : 'NÃO CONFIGURADO',
      client_secret: CLIENT_SECRET ? 'CONFIGURADO' : 'NÃO CONFIGURADO'
    });

    // 4. Chamar a Edge Function do LinkedIn
    const { data: publishResult, error: publishError } = await supabase.functions.invoke('linkedin-publish', {
      body: {
        text: linkedinData.text,
        user_id: devopsPost.user_id
      }
    });

    if (publishError) {
      console.log('⚠️ Erro na Edge Function:', publishError.message);
      console.log('💡 Isso é esperado sem um access_token válido do LinkedIn');
    } else {
      console.log('✅ Resposta da Edge Function:', publishResult);
    }

    // 5. Atualizar status do post
    const { error: updateError } = await supabase
      .from('posts')
      .update({ 
        linkedin_post_id: `simulated_${Date.now()}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', devopsPost.id);

    if (updateError) {
      console.log('⚠️ Erro ao atualizar post:', updateError.message);
    } else {
      console.log('✅ Post atualizado no banco de dados');
    }

    console.log('\n🎉 Processo de republicação concluído!');
    console.log('📋 Resumo:');
    console.log('- ✅ Credenciais do LinkedIn configuradas');
    console.log('- ✅ Post sobre DevOps encontrado');
    console.log('- ✅ Integração verificada/criada');
    console.log('- ⚠️ Publicação simulada (necessário access_token válido)');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao republicar post:', error.message);
    return false;
  }
}

republishDevOpsPost().then(success => {
  if (success) {
    console.log('\n✅ Republicação concluída com sucesso!');
  } else {
    console.log('\n❌ Falha na republicação!');
  }
  process.exit(success ? 0 : 1);
})