import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAIFuturePost() {
  try {
    console.log('🚀 Iniciando criação do post sobre IAs e o futuro da Computação...');

    // 1. Fazer login automático
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'fabriciocardosolima@gmail.com',
      password: '123456'
    });

    if (authError) {
      throw new Error(`Erro na autenticação: ${authError.message}`);
    }

    console.log('✅ Login realizado com sucesso');

    // 2. Conteúdo do post sobre IAs e o futuro da Computação
    const postContent = {
      title: "🤖 IAs e o Futuro da Computação: Uma Revolução em Andamento",
      content: `A inteligência artificial está redefinindo os limites da computação de maneiras que pareciam ficção científica há apenas uma década.

🧠 **Machine Learning e Deep Learning** estão permitindo que sistemas aprendam e se adaptem de forma autônoma, criando soluções mais inteligentes e eficientes.

⚡ **Computação Quântica** promete resolver problemas complexos em segundos que levariam anos para computadores tradicionais.

🌐 **Edge Computing** está trazendo o processamento de IA para mais perto dos usuários, reduzindo latência e melhorando a experiência.

🔄 **Transformação Digital** acelerada pela IA está revolucionando setores inteiros, desde saúde até finanças.

O futuro da computação não é apenas sobre máquinas mais rápidas, mas sobre sistemas que pensam, aprendem e evoluem conosco.

Qual aspecto da revolução da IA mais te impressiona? 💭

#InteligenciaArtificial #MachineLearning #ComputacaoQuantica #EdgeComputing #TransformacaoDigital #Tecnologia #Inovacao #FuturoDaComputacao`,
      imagePrompt: "Ultra-realistic futuristic scene showing AI and computing evolution: holographic neural networks floating in a high-tech laboratory, quantum computers with glowing qubits, robotic hands typing on transparent keyboards, digital brain patterns merging with circuit boards, neon blue and purple lighting, 8K resolution, photorealistic, cinematic lighting, depth of field",
      category: "Tecnologia"
    };

    console.log('📝 Conteúdo do post criado');

    // 3. Gerar imagem usando a API Trae AI
    console.log('🎨 Gerando imagem ultrarealista...');
    
    const encodedPrompt = encodeURIComponent(postContent.imagePrompt);
    const publicUrl = `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodedPrompt}&image_size=landscape_16_9`;
    
    console.log('🖼️ URL da imagem gerada:', publicUrl);
    console.log('✅ Imagem gerada com sucesso');

    // 4. Salvar o post no banco de dados
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: authData.user.id,
        title: postContent.title,
        content: postContent.content,
        category: postContent.category,
        ai_generated: true,
        ai_topic: 'IAs e o futuro da Computação',
        status: 'draft'
      })
      .select()
      .single();

    if (postError) {
      throw new Error(`Erro ao salvar post: ${postError.message}`);
    }

    console.log('💾 Post salvo no banco de dados:', postData.id);

    // 5. Salvar a imagem na tabela images
    const { data: imageData, error: imageError } = await supabase
      .from('images')
      .insert({
        post_id: postData.id,
        url: publicUrl,
        prompt_used: postContent.imagePrompt,
        ai_model: 'Trae AI SDXL'
      })
      .select()
      .single();

    if (imageError) {
      throw new Error(`Erro ao salvar imagem: ${imageError.message}`);
    }

    console.log('🖼️ Imagem salva no banco de dados:', imageData.id);

    // 6. Publicar no LinkedIn usando a conexão automática
    console.log('📤 Publicando no LinkedIn...');
    
    // Obter o session token para autenticação
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Sessão não encontrada para publicação');
    }
    
    const linkedinResponse = await fetch(`${supabaseUrl}/functions/v1/linkedin-publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        action: 'publish',
        postId: postData.id,
        content: postContent.content,
        imageUrl: publicUrl
      })
    });

    if (!linkedinResponse.ok) {
      const errorText = await linkedinResponse.text();
      throw new Error(`Erro ao publicar no LinkedIn: ${errorText}`);
    }

    const linkedinResult = await linkedinResponse.json();
    console.log('✅ Post publicado no LinkedIn:', linkedinResult);

    // 7. Atualizar status do post para 'published'
    await supabase
      .from('posts')
      .update({ 
        status: 'published',
        linkedin_post_id: linkedinResult.linkedin_post_id || 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', postData.id);

    console.log('🎉 Post sobre IAs e o futuro da Computação criado e publicado com sucesso!');
    console.log('📊 Resumo:');
    console.log(`- Título: ${postContent.title}`);
    console.log(`- Conteúdo: ${postContent.content.length} caracteres`);
    console.log(`- Hashtags: ${postContent.hashtags.join(', ')}`);
    console.log(`- Imagem: ${publicUrl}`);
    console.log(`- Post ID: ${postData.id}`);
    console.log(`- LinkedIn ID: ${linkedinResult.linkedin_post_id || 'published'}`);

    return {
      success: true,
      post: postData,
      linkedin: linkedinResult,
      image_url: publicUrl
    };

  } catch (error) {
    console.error('❌ Erro ao criar post:', error.message);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createAIFuturePost()
    .then(result => {
      console.log('\n🎯 Resultado final:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Falha na execução:', error.message);
      process.exit(1);
    });
}

export { createAIFuturePost };