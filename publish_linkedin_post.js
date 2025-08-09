#!/usr/bin/env node

/**
 * Script automatizado para publicar post sobre IA no LinkedIn
 * usando a aplicação LinkedIn Post Pilot
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY não encontrada nas variáveis de ambiente');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Credenciais de login
const LOGIN_EMAIL = 'fabriciocardosolima@gmail.com';
const LOGIN_PASSWORD = '123456';

// Conteúdo do post sobre IA
const AI_POST_CONTENT = {
  title: '🚀 O Futuro da Inteligência Artificial: Transformando o Mundo dos Negócios',
  content: `A Inteligência Artificial não é mais uma promessa do futuro - ela é a realidade do presente! 🤖

Nos últimos anos, testemunhamos uma revolução silenciosa que está transformando completamente a forma como fazemos negócios. Desde chatbots inteligentes que revolucionam o atendimento ao cliente até algoritmos de machine learning que otimizam processos complexos, a IA está democratizando o acesso à tecnologia avançada.

🔍 O que mais me impressiona é como pequenas e médias empresas agora podem:
• Automatizar tarefas repetitivas com eficiência
• Analisar grandes volumes de dados em tempo real
• Personalizar experiências do cliente em escala
• Tomar decisões baseadas em insights precisos

Mas aqui está o ponto crucial: a IA não substitui o elemento humano - ela o potencializa! 💡

A verdadeira magia acontece quando combinamos a capacidade analítica das máquinas com a criatividade, empatia e pensamento estratégico humano.

🚀 Estamos apenas no início desta jornada. As possibilidades são infinitas!

E você, como está aproveitando a IA no seu negócio? Compartilhe suas experiências nos comentários! 👇`,
  category: 'Tecnologia',
  topic: 'Inteligência Artificial',
  hashtags: '#InteligenciaArtificial #IA #Inovacao #Tecnologia #FuturoDoTrabalho #Automacao #DigitalTransformation #TechTrends #MachineLearning #AI'
};

async function loginUser() {
  console.log('🔐 Fazendo login...');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: LOGIN_EMAIL,
    password: LOGIN_PASSWORD
  });
  
  if (error) {
    throw new Error(`Erro no login: ${error.message}`);
  }
  
  console.log('✅ Login realizado com sucesso!');
  return data;
}

async function createPost(session) {
  console.log('📝 Criando post sobre IA...');
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: session.user.id,
      title: AI_POST_CONTENT.title,
      content: `${AI_POST_CONTENT.content}\n\n${AI_POST_CONTENT.hashtags}`,
      category: AI_POST_CONTENT.category,
      ai_topic: AI_POST_CONTENT.topic,
      ai_generated: true,
      status: 'draft'
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Erro ao criar post: ${error.message}`);
  }
  
  console.log('✅ Post criado com sucesso!');
  return data;
}

async function generateImage(session) {
  console.log('🎨 Gerando imagem com IA...');
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/huggingface-proxy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'Ultra-realistic image of artificial intelligence, technology, automation, futuristic digital workspace, modern business environment, professional lighting, high quality, 4K'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erro na geração de imagem: ${response.status}`);
    }
    
    const imageData = await response.json();
    console.log('✅ Imagem gerada com sucesso!');
    return imageData.imageUrl;
  } catch (error) {
    console.warn('⚠️ Erro ao gerar imagem, continuando sem imagem:', error.message);
    return null;
  }
}

async function connectLinkedIn(session) {
  console.log('🔗 Verificando conexão LinkedIn...');
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/linkedin-auth`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'authorize'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erro na autorização LinkedIn: ${response.status}`);
    }
    
    const authData = await response.json();
    console.log('✅ URL de autorização LinkedIn gerada!');
    console.log('🌐 Acesse:', authData.authUrl);
    
    return authData;
  } catch (error) {
    console.warn('⚠️ Erro na conexão LinkedIn:', error.message);
    return null;
  }
}

async function publishToLinkedIn(session, postId, content, imageUrl = null) {
  console.log('📤 Publicando no LinkedIn...');
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/linkedin-publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'publish',
        postId: postId,
        content: content,
        imageUrl: imageUrl
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro na publicação: ${errorData.error || response.status}`);
    }
    
    const publishData = await response.json();
    console.log('✅ Post publicado no LinkedIn com sucesso!');
    return publishData;
  } catch (error) {
    console.error('❌ Erro na publicação LinkedIn:', error.message);
    throw error;
  }
}

async function updatePostStatus(postId, status, linkedinId = null) {
  console.log(`📊 Atualizando status do post para: ${status}`);
  
  const updateData = {
    status: status,
    updated_at: new Date().toISOString()
  };
  
  if (linkedinId) {
    updateData.linkedin_post_id = linkedinId;
    updateData.published_at = new Date().toISOString();
  }
  
  const { error } = await supabase
    .from('posts')
    .update(updateData)
    .eq('id', postId);
  
  if (error) {
    console.warn('⚠️ Erro ao atualizar status:', error.message);
  } else {
    console.log('✅ Status atualizado!');
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando processo de publicação no LinkedIn...');
    console.log('=' .repeat(50));
    
    // 1. Login
    const session = await loginUser();
    
    // 2. Criar post
    const post = await createPost(session);
    
    // 3. Gerar imagem
    const imageUrl = await generateImage(session);
    
    // 4. Conectar LinkedIn
    const linkedinAuth = await connectLinkedIn(session);
    
    if (!linkedinAuth) {
      console.log('⚠️ Conexão LinkedIn não disponível. Salvando como rascunho.');
      await updatePostStatus(post.id, 'draft');
      return;
    }
    
    // 5. Publicar no LinkedIn
    try {
      const publishResult = await publishToLinkedIn(
        session, 
        post.id, 
        `${AI_POST_CONTENT.content}\n\n${AI_POST_CONTENT.hashtags}`,
        imageUrl
      );
      
      await updatePostStatus(post.id, 'published', publishResult.linkedinPostId);
      
      console.log('=' .repeat(50));
      console.log('🎉 SUCESSO! Post sobre IA publicado no LinkedIn!');
      console.log('📊 Detalhes:');
      console.log(`   • Post ID: ${post.id}`);
      console.log(`   • Título: ${post.title}`);
      console.log(`   • Status: Publicado`);
      if (publishResult.linkedinPostId) {
        console.log(`   • LinkedIn ID: ${publishResult.linkedinPostId}`);
      }
      if (imageUrl) {
        console.log(`   • Imagem: Incluída`);
      }
      console.log('=' .repeat(50));
      
    } catch (publishError) {
      console.error('❌ Erro na publicação:', publishError.message);
      await updatePostStatus(post.id, 'failed');
      
      console.log('💡 O post foi salvo como rascunho. Você pode tentar publicar manualmente através da interface.');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    process.exit(1);
  }
}

// Executar o script
main().catch(console.error);