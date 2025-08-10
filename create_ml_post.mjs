import { createClient } from '@supabase/supabase-js';

async function createMLPost() {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variáveis do Supabase não encontradas');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const postContent = `🚀 **Machine Learning em 2025: Tendências que Vão Revolucionar o Mercado** 🤖

O ano de 2025 promete ser um marco para a Inteligência Artificial! Aqui estão as principais tendências que todo profissional de tech deve acompanhar:

🔹 **AutoML Democratizado**: Ferramentas que permitem criar modelos de ML sem conhecimento profundo em ciência de dados
🔹 **Edge AI**: IA rodando diretamente em dispositivos móveis e IoT
🔹 **Explainable AI**: Modelos mais transparentes e interpretáveis
🔹 **MLOps Maduro**: Pipelines de ML em produção mais robustos
🔹 **AI Multimodal**: Modelos que processam texto, imagem, áudio e vídeo simultaneamente

💡 **Dica para Devs**: Comece a explorar frameworks como TensorFlow Lite, ONNX Runtime e Hugging Face Transformers. O futuro é construir aplicações inteligentes que rodem em qualquer lugar!

#MachineLearning #AI #TechTrends #Developer #Innovation #MLOps #EdgeAI #TensorFlow #Python #DataScience`;
    
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
    
    // Criar o post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title: 'Machine Learning em 2025: Tendências que Vão Revolucionar o Mercado',
        content: postContent,
        category: 'technology',
        status: 'published',
        user_id: authData.user.id
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erro ao criar post: ${error.message}`);
    }
    
    console.log('\n🎉 Post criado com sucesso!');
    console.log('📝 ID do Post:', post.id);
    console.log('📋 Título:', post.title);
    console.log('📊 Status:', post.status);
    console.log('👤 User ID:', post.user_id);
    
    return post;
    
  } catch (error) {
    console.error('❌ Erro ao criar post:', error.message);
    process.exit(1);
  }
}

createMLPost();