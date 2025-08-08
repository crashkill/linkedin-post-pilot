/**
 * Script para testar criação de post no LinkedIn
 * Usando as funcionalidades do LinkedIn Post Pilot
 */

import { generateLinkedInPostImage } from './src/utils/generateAndSaveImage.js';

async function createLinkedInPost() {
  console.log('🚀 Iniciando criação de post sobre IAs Generativas...');
  
  // Conteúdo do post sobre IAs Generativas
  const postContent = `🚀 O Futuro das IAs Generativas na Tecnologia

As Inteligências Artificiais generativas estão revolucionando a forma como criamos, trabalhamos e inovamos. De códigos a imagens, de textos a vídeos, essas tecnologias estão democratizando a criação de conteúdo e acelerando processos que antes levavam horas ou dias.

🔮 O que esperar para o futuro:
• Integração ainda mais profunda com ferramentas de desenvolvimento
• Personalização extrema baseada em contexto
• Colaboração humano-IA mais fluida e natural
• Automação inteligente de tarefas complexas

💡 A chave não é substituir a criatividade humana, mas amplificá-la. As IAs generativas são ferramentas poderosas que nos permitem focar no que realmente importa: estratégia, inovação e conexões humanas.

🎯 Esta imagem foi gerada por IA e este post foi criado usando automação inteligente - um exemplo prático do futuro que já está aqui!

#IA #InteligenciaArtificial #Tecnologia #Inovacao #Futuro #Automacao #LinkedInPost #AIGenerativa`;

  console.log('📝 Conteúdo do post:');
  console.log(postContent);
  console.log('\n' + '='.repeat(80) + '\n');

  try {
    // Gerar imagem ultrarealista sobre IAs Generativas
    console.log('🎨 Gerando imagem ultrarealista sobre IAs Generativas...');
    
    const imageResult = await generateLinkedInPostImage(
      'Ultra-realistic image of artificial intelligence and generative AI technology, showing futuristic neural networks, digital brain connections, holographic displays with code and data flowing, modern tech workspace with AI interfaces, professional lighting, high-tech atmosphere, 4K quality, photorealistic'
    );
    
    if (imageResult.success && imageResult.imageData) {
      console.log('✅ Imagem gerada com sucesso!');
      console.log('📊 Tamanho da imagem:', imageResult.imageData.length, 'caracteres (base64)');
      
      // Salvar informações do post
      const postData = {
        content: postContent,
        imageGenerated: true,
        imageSize: imageResult.imageData.length,
        timestamp: new Date().toISOString(),
        topic: 'IAs Generativas e Tecnologia'
      };
      
      console.log('\n📋 Resumo do post criado:');
      console.log('- Tópico:', postData.topic);
      console.log('- Imagem gerada:', postData.imageGenerated ? 'Sim' : 'Não');
      console.log('- Timestamp:', postData.timestamp);
      console.log('- Caracteres do texto:', postData.content.length);
      
      console.log('\n🎉 Post sobre IAs Generativas criado com sucesso!');
      console.log('\n💡 Para publicar no LinkedIn:');
      console.log('1. Acesse a aplicação web em http://localhost:8080');
      console.log('2. Faça login ou crie uma conta');
      console.log('3. Use o componente LinkedInTestPublisher');
      console.log('4. Configure seu ACCESS_TOKEN do LinkedIn');
      console.log('5. Use a imagem gerada e o texto acima');
      
    } else {
      console.error('❌ Falha na geração da imagem');
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar post:', error);
  }
}

// Executar o script
createLinkedInPost().catch(console.error);