/**
 * Teste de autenticação LinkedIn
 * Verifica se as chaves OAuth estão configuradas corretamente
 */

const fs = require('fs');
const path = require('path');

// Carregar variáveis do .env
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ Arquivo .env não encontrado');
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return envVars;
}

// Aplicar variáveis ao process.env
const envVars = loadEnvFile();
Object.assign(process.env, envVars);

console.log('🔗 Testando configuração do LinkedIn OAuth...');
console.log('=' .repeat(60));

// Verificar variáveis necessárias
const requiredVars = {
  'LINKEDIN_CLIENT_ID': process.env.LINKEDIN_CLIENT_ID,
  'LINKEDIN_CLIENT_SECRET': process.env.LINKEDIN_CLIENT_SECRET,
  'LINKEDIN_REDIRECT_URI': process.env.LINKEDIN_REDIRECT_URI
};

console.log('\n📋 VARIÁVEIS DE CONFIGURAÇÃO:');
let allConfigured = true;

for (const [key, value] of Object.entries(requiredVars)) {
  const isConfigured = value && value !== 'your-linkedin-client-id' && value !== 'your-linkedin-client-secret';
  console.log(`${key}: ${isConfigured ? '✅ Configurado' : '❌ Não configurado ou placeholder'}`);
  
  if (isConfigured && key === 'LINKEDIN_CLIENT_ID') {
    console.log(`   ID: ${value.substring(0, 8)}...`);
  }
  
  if (!isConfigured) {
    allConfigured = false;
  }
}

console.log('\n🔍 VALIDAÇÃO DAS CHAVES:');

if (requiredVars.LINKEDIN_CLIENT_ID) {
  const clientId = requiredVars.LINKEDIN_CLIENT_ID;
  if (clientId.length >= 10 && !clientId.includes('your-')) {
    console.log('✅ Client ID parece válido');
  } else {
    console.log('❌ Client ID parece ser um placeholder');
    allConfigured = false;
  }
}

if (requiredVars.LINKEDIN_CLIENT_SECRET) {
  const clientSecret = requiredVars.LINKEDIN_CLIENT_SECRET;
  if (clientSecret.length >= 10 && !clientSecret.includes('your-')) {
    console.log('✅ Client Secret parece válido');
  } else {
    console.log('❌ Client Secret parece ser um placeholder');
    allConfigured = false;
  }
}

if (requiredVars.LINKEDIN_REDIRECT_URI) {
  const redirectUri = requiredVars.LINKEDIN_REDIRECT_URI;
  if (redirectUri.startsWith('http')) {
    console.log('✅ Redirect URI tem formato válido');
    console.log(`   URI: ${redirectUri}`);
  } else {
    console.log('❌ Redirect URI inválido');
    allConfigured = false;
  }
}

console.log('\n🌐 TESTE DE URL DE AUTORIZAÇÃO:');

if (allConfigured) {
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code&` +
    `client_id=${encodeURIComponent(requiredVars.LINKEDIN_CLIENT_ID)}&` +
    `redirect_uri=${encodeURIComponent(requiredVars.LINKEDIN_REDIRECT_URI)}&` +
    `scope=r_liteprofile%20r_emailaddress%20w_member_social`;
  
  console.log('✅ URL de autorização gerada:');
  console.log(`   ${authUrl.substring(0, 100)}...`);
  
  console.log('\n🚀 PRÓXIMOS PASSOS:');
  console.log('1. Acesse a URL de autorização no navegador');
  console.log('2. Faça login no LinkedIn');
  console.log('3. Autorize a aplicação');
  console.log('4. Copie o código de autorização da URL de callback');
  
} else {
  console.log('❌ Não é possível gerar URL de autorização - configuração incompleta');
  
  console.log('\n🔧 COMO CORRIGIR:');
  console.log('1. Acesse https://www.linkedin.com/developers/');
  console.log('2. Crie uma nova aplicação ou acesse uma existente');
  console.log('3. Copie o Client ID e Client Secret');
  console.log('4. Configure no Doppler ou no arquivo .env');
  console.log('5. Verifique se o Redirect URI está configurado na aplicação LinkedIn');
}

console.log('\n' + '=' .repeat(60));
console.log(`📊 Status: ${allConfigured ? '✅ Pronto para autenticação' : '❌ Configuração incompleta'}`);

if (allConfigured) {
  console.log('\n💡 Para testar a autenticação completa:');
  console.log('   1. Execute: node run-with-env.cjs "npm run dev"');
  console.log('   2. Acesse http://localhost:8080');
  console.log('   3. Teste a conexão com LinkedIn na interface');
}