/**
 * Script para atualizar o arquivo .env com as chaves reais do Doppler
 * Execute este script após configurar as chaves no Doppler
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function updateEnvFile() {
  console.log('🔐 Atualizador de Variáveis do LinkedIn');
  console.log('=' .repeat(50));
  console.log('\n📝 Vamos atualizar o arquivo .env com as chaves reais do LinkedIn.');
  console.log('💡 Você pode obter essas chaves do seu projeto no Doppler.');
  console.log('');

  try {
    // Solicitar as chaves
    const clientId = await question('🔑 LinkedIn Client ID: ');
    const clientSecret = await question('🔐 LinkedIn Client Secret: ');
    
    if (!clientId || !clientSecret) {
      console.log('❌ Client ID e Client Secret são obrigatórios!');
      rl.close();
      return;
    }

    // Ler arquivo .env atual
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Atualizar as linhas do LinkedIn
    const lines = envContent.split('\n');
    const updatedLines = lines.map(line => {
      if (line.startsWith('LINKEDIN_CLIENT_ID=')) {
        return `LINKEDIN_CLIENT_ID=${clientId}`;
      }
      if (line.startsWith('LINKEDIN_CLIENT_SECRET=')) {
        return `LINKEDIN_CLIENT_SECRET=${clientSecret}`;
      }
      return line;
    });

    // Verificar se as linhas foram encontradas, se não, adicionar
    const hasClientId = lines.some(line => line.startsWith('LINKEDIN_CLIENT_ID='));
    const hasClientSecret = lines.some(line => line.startsWith('LINKEDIN_CLIENT_SECRET='));

    if (!hasClientId) {
      updatedLines.push(`LINKEDIN_CLIENT_ID=${clientId}`);
    }
    if (!hasClientSecret) {
      updatedLines.push(`LINKEDIN_CLIENT_SECRET=${clientSecret}`);
    }

    // Salvar arquivo atualizado
    const updatedContent = updatedLines.join('\n');
    fs.writeFileSync(envPath, updatedContent, 'utf8');

    console.log('\n✅ Arquivo .env atualizado com sucesso!');
    console.log('\n🧪 Testando configuração...');
    
    // Executar teste automaticamente
    const { spawn } = require('child_process');
    const testProcess = spawn('node', ['run-with-env.cjs', 'node test-linkedin-auth.cjs'], {
      stdio: 'inherit',
      shell: true
    });

    testProcess.on('close', (code) => {
      console.log('\n🚀 Próximos passos:');
      console.log('1. Execute: node run-with-env.cjs "npm run dev"');
      console.log('2. Acesse http://localhost:8080');
      console.log('3. Teste a conexão com LinkedIn');
      console.log('\n💡 Para usar o Doppler em produção:');
      console.log('   doppler run -- npm run dev');
      rl.close();
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    rl.close();
  }
}

// Verificar se deve executar interativamente ou com argumentos
if (process.argv.length > 2) {
  // Modo não-interativo com argumentos
  const clientId = process.argv[2];
  const clientSecret = process.argv[3];
  
  if (!clientId || !clientSecret) {
    console.log('❌ Uso: node update-env-from-doppler.cjs <CLIENT_ID> <CLIENT_SECRET>');
    process.exit(1);
  }
  
  console.log('🔐 Atualizando .env com chaves fornecidas...');
  
  // Atualizar sem interação
  const envPath = path.join(__dirname, '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  envContent = envContent.replace(
    /LINKEDIN_CLIENT_ID=.*/,
    `LINKEDIN_CLIENT_ID=${clientId}`
  );
  
  envContent = envContent.replace(
    /LINKEDIN_CLIENT_SECRET=.*/,
    `LINKEDIN_CLIENT_SECRET=${clientSecret}`
  );
  
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ Arquivo .env atualizado!');
  
} else {
  // Modo interativo
  updateEnvFile();
}