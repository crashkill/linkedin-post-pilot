// Script para publicar o post sobre IA no LinkedIn
// Usando fetch para chamar as APIs da aplicação
const fetch = require('node-fetch');

// Dados do post sobre IA
const aiPostData = {
  title: "🚀 O Futuro da Inteligência Artificial: Transformando o Mundo dos Negócios",
  content: "A Inteligência Artificial não é mais ficção científica - é realidade presente! 🤖\n\nEstamos vivenciando uma revolução tecnológica sem precedentes. A IA está transformando desde processos simples até estratégias complexas de negócios:\n\n✨ Automação inteligente de tarefas repetitivas\n📊 Análise preditiva para tomada de decisões\n🎯 Personalização em massa para experiências únicas\n💡 Inovação acelerada em produtos e serviços\n\nO que mais me impressiona é como a IA democratiza o acesso à tecnologia avançada. Pequenas empresas agora podem competir com gigantes usando ferramentas de IA acessíveis.\n\nMas lembrem-se: a IA é uma ferramenta poderosa, mas o elemento humano - criatividade, empatia e pensamento estratégico - continua sendo insubstituível.\n\nComo vocês estão aplicando IA em seus projetos? Compartilhem suas experiências! 👇\n\n#InteligenciaArtificial #IA #Inovacao #Tecnologia #FuturoDoTrabalho #Automacao #DigitalTransformation #TechTrends #MachineLearning #AI",
  category: "tecnologia",
  status: "published",
  imageUrl: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=artificial%20intelligence%20technology%20automation%20modern%20design%20professional%20business%20innovation%20digital%20transformation%20futuristic%20neural%20networks&image_size=landscape_16_9"
};

async function publishAIPost() {
  try {
    console.log('🚀 Iniciando publicação do post sobre IA...');
    
    // 1. Salvar o post no banco de dados
    console.log('💾 Salvando post no banco de dados...');
    const savedPost = await postsService.createPost(aiPostData);
    console.log('✅ Post salvo com ID:', savedPost.id);
    
    // 2. Publicar no LinkedIn
    console.log('📤 Publicando no LinkedIn...');
    const result = await linkedinService.publishPost(
      savedPost.id, 
      aiPostData.content, 
      aiPostData.imageUrl
    );
    
    console.log('🎉 Post publicado com sucesso no LinkedIn!');
    console.log('📊 Resultado:', result);
    
    return {
      success: true,
      postId: savedPost.id,
      linkedinResult: result
    };
    
  } catch (error) {
    console.error('❌ Erro ao publicar post:', error);
    throw error;
  }
}

// Executar a publicação
publishAIPost()
  .then(result => {
    console.log('✅ Publicação concluída:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Falha na publicação:', error);
    process.exit(1);
  });