// Script para automaticamente publicar o post sobre desenvolvimento web
// Este script simula a ação de clicar no botão "Publicar Agora" na aplicação

import puppeteer from 'puppeteer';

async function autoPublishPost() {
  let browser;
  
  try {
    console.log('🚀 Iniciando automação para publicar post...');
    
    // Iniciar o navegador
    browser = await puppeteer.launch({
      headless: false, // Mostrar o navegador para debug
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Navegar para a aplicação
    console.log('🌐 Navegando para a aplicação...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });
    
    // Aguardar a página carregar completamente
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar se o diálogo de criação de post está aberto
    console.log('🔍 Verificando se o diálogo está aberto...');
    
    // Aguardar o botão "Publicar Agora" aparecer
    try {
      await page.waitForSelector('button:has-text("Publicar Agora")', { timeout: 10000 });
      console.log('✅ Botão "Publicar Agora" encontrado!');
      
      // Clicar no botão
      await page.click('button:has-text("Publicar Agora")');
      console.log('🎯 Clicou no botão "Publicar Agora"!');
      
      // Aguardar a confirmação
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('✅ Post publicado com sucesso!');
      
    } catch (error) {
      console.log('⚠️ Botão não encontrado, tentando alternativa...');
      
      // Tentar encontrar o botão por classe CSS
      const publishButton = await page.$('button.bg-blue-600');
      if (publishButton) {
        await publishButton.click();
        console.log('🎯 Clicou no botão de publicar (alternativa)!');
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('✅ Post publicado com sucesso!');
      } else {
        console.log('❌ Não foi possível encontrar o botão de publicar');
      }
    }
    
    // Aguardar um pouco para ver o resultado
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ Erro durante a automação:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Executar a automação
autoPublishPost()
  .then(() => {
    console.log('🎉 Automação concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });

export { autoPublishPost };