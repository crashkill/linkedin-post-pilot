import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para gerar imagem ultrarealista
async function generateImage(prompt) {
  try {
    const imageUrl = `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=landscape_16_9`;
    console.log('🎨 Gerando imagem ultrarealista...');
    return imageUrl;
  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    return null;
  }
}

// Função para criar post sobre desenvolvimento web moderno
async function createWebDevPost() {
  try {
    console.log('🚀 Criando post sobre desenvolvimento web moderno...');
    
    // Conteúdo do post
    const title = '🚀 O Futuro do Desenvolvimento Web: React 19 e Next.js 15';
    const content = `O desenvolvimento web está evoluindo em uma velocidade impressionante! 🌟

Com o lançamento do React 19 e Next.js 15, estamos vendo inovações que transformam completamente a experiência de desenvolvimento:

🔥 **React 19 - Novidades que Revolucionam:**
• React Compiler: Otimização automática sem memo()
• Server Components nativos
• Actions para formulários mais simples
• use() hook para promises e context
• Concurrent Features estáveis

⚡ **Next.js 15 - Performance Extrema:**
• Turbopack como bundler padrão
• Partial Prerendering (PPR)
• Server Actions aprimoradas
• Melhor suporte a TypeScript
• Edge Runtime otimizado

💡 **Por que isso importa?**
✅ Desenvolvimento mais rápido e intuitivo
✅ Performance superior para usuários finais
✅ Menos código boilerplate
✅ Melhor experiência de debugging
✅ Escalabilidade empresarial

Estamos vivendo uma nova era do desenvolvimento web, onde a produtividade e performance andam juntas. O futuro é agora! 🎯

#React #NextJS #WebDevelopment #JavaScript #Frontend #TechInnovation #Programming #WebDev #ReactJS #FullStack`;
    
    // Gerar imagem ultrarealista
    const imagePrompt = 'Ultra-realistic modern web development workspace with multiple monitors showing React and Next.js code, futuristic programming environment, clean desk setup, ambient lighting, high-tech atmosphere, professional developer workspace, 4K quality, photorealistic';
    const imageUrl = await generateImage(imagePrompt);
    
    // Dados do post
    const postData = {
      title: title,
      content: content,
      category: 'Tecnologia',
      status: 'published',
      user_id: '123e4567-e89b-12d3-a456-426614174000', // ID do usuário padrão
      ai_generated: true,
      ai_topic: 'Desenvolvimento Web Moderno - React 19 e Next.js 15',
      published_to_linkedin: false
    };
    
    // Salvar o post no banco de dados
    const { data: postResult, error: postError } = await supabase
      .from('posts')
      .insert([postData])
      .select();
    
    if (postError) {
      console.error('❌ Erro ao salvar post:', postError);
      return null;
    }
    
    const createdPost = postResult[0];
    console.log('✅ Post criado com sucesso!');
    console.log('📝 Título:', title);
    
    // Salvar a imagem associada ao post
    if (imageUrl && createdPost.id) {
      const imageData = {
        post_id: createdPost.id,
        url: imageUrl,
        prompt_used: imagePrompt,
        ai_model: 'Trae AI SDXL',
        bucket_id: 'images'
      };
      
      const { data: imageResult, error: imageError } = await supabase
        .from('images')
        .insert([imageData])
        .select();
      
      if (imageError) {
        console.error('⚠️ Aviso: Erro ao salvar imagem:', imageError);
      } else {
        console.log('🖼️ Imagem salva com sucesso!');
      }
    }
    
    console.log('🖼️ Imagem gerada:', imageUrl);
    console.log('💾 Post salvo no banco de dados');
    
    return createdPost;
    
  } catch (error) {
    console.error('❌ Erro ao criar post:', error);
    return null;
  }
}

// Executar a criação do post
createWebDevPost()
  .then((post) => {
    if (post) {
      console.log('🎉 Post sobre desenvolvimento web criado com sucesso!');
      console.log('🔗 Acesse a aplicação em http://localhost:8080 para visualizar');
    } else {
      console.log('❌ Falha ao criar o post');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });

export { createWebDevPost };