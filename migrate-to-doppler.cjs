#!/usr/bin/env node

/**
 * Script para migrar segredos do .env para o Doppler
 * Este script irá:
 * 1. Ler todas as variáveis sensíveis do .env
 * 2. Criar comandos para adicionar no Doppler
 * 3. Limpar o .env mantendo apenas variáveis públicas
 */

const fs = require('fs');
const path = require('path');

// Variáveis que devem ficar no .env (públicas)
const PUBLIC_VARS = [
  'VITE_SUPABASE_URL',
  'NODE_ENV'
];

// Variáveis sensíveis que devem ir para o Doppler
const SENSITIVE_VARS = [
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'LINKEDIN_CLIENT_ID',
  'LINKEDIN_CLIENT_SECRET',
  'LINKEDIN_REDIRECT_URI',
  'GROQ_API_KEY',
  'GEMINI_API_KEY',
  'HUGGINGFACE_API_KEY',
  'JWT_SECRET'
];

function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const vars = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        vars[key] = valueParts.join('=');
      }
    }
  }
  
  return vars;
}

function generateDopplerCommands(vars) {
  const commands = [];
  
  console.log('\n🔐 COMANDOS PARA ADICIONAR NO DOPPLER:');
  console.log('=' .repeat(60));
  
  for (const [key, value] of Object.entries(vars)) {
    if (SENSITIVE_VARS.includes(key) && value && !value.includes('your-')) {
      const command = `doppler secrets set ${key}="${value}"`;
      commands.push(command);
      console.log(`\n📝 ${key}:`);
      console.log(`   ${command}`);
    }
  }
  
  return commands;
}

function createCleanEnvFile(vars) {
  const lines = [
    '# Configurações Públicas do LinkedIn Post Pilot',
    '# Variáveis sensíveis estão no Doppler',
    '',
    '# Supabase - URLs públicas',
    `VITE_SUPABASE_URL=${vars.VITE_SUPABASE_URL || 'https://jhfypcjgmkdloyhtonwr.supabase.co'}`,
    '',
    '# Ambiente',
    `NODE_ENV=${vars.NODE_ENV || 'development'}`,
    '',
    '# IMPORTANTE: Todas as chaves sensíveis estão no Doppler',
    '# Para executar: doppler run -- npm run dev',
    ''
  ];
  
  return lines.join('\n');
}

function createDopplerScript(commands) {
  const scriptContent = [
    '#!/usr/bin/env node',
    '',
    '/**',
    ' * Script para configurar todas as variáveis no Doppler',
    ' * Execute este script após instalar o Doppler CLI',
    ' */',
    '',
    'const { execSync } = require(\'child_process\');',
    '',
    'const commands = [',
    ...commands.map(cmd => `  \`${cmd}\`,`),
    '];',
    '',
    'console.log(\'🔐 Configurando variáveis no Doppler...\');',
    '',
    'for (const command of commands) {',
    '  try {',
    '    console.log(`\\n📝 Executando: ${command}`);',
    '    execSync(command, { stdio: \'inherit\' });',
    '    console.log(\'✅ Sucesso!\');',
    '  } catch (error) {',
    '    console.error(`\\n❌ Erro ao executar: ${command}`);',
    '    console.error(error.message);',
    '  }',
    '}',
    '',
    'console.log(\'\\n🎉 Configuração do Doppler concluída!\');',
    'console.log(\'💡 Para executar o projeto: doppler run -- npm run dev\');'
  ];
  
  return scriptContent.join('\n');
}

function main() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Arquivo .env não encontrado!');
    process.exit(1);
  }
  
  console.log('🚀 Iniciando migração para Doppler...');
  
  // Ler variáveis do .env
  const vars = parseEnvFile(envPath);
  
  // Gerar comandos do Doppler
  const commands = generateDopplerCommands(vars);
  
  // Criar script automatizado
  const scriptContent = createDopplerScript(commands);
  fs.writeFileSync('setup-doppler-secrets.cjs', scriptContent);
  console.log('\n📄 Script criado: setup-doppler-secrets.cjs');
  
  // Criar novo .env limpo
  const cleanEnv = createCleanEnvFile(vars);
  
  // Backup do .env original
  fs.copyFileSync('.env', '.env.backup');
  console.log('\n💾 Backup criado: .env.backup');
  
  // Escrever novo .env
  fs.writeFileSync('.env', cleanEnv);
  console.log('✅ Novo .env criado (apenas variáveis públicas)');
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 PRÓXIMOS PASSOS:');
  console.log('=' .repeat(60));
  console.log('1. Instale o Doppler CLI (se ainda não instalou)');
  console.log('2. Configure o projeto: doppler setup');
  console.log('3. Execute: node setup-doppler-secrets.cjs');
  console.log('4. Ou execute os comandos manualmente (mostrados acima)');
  console.log('5. Teste: doppler run -- npm run dev');
  console.log('\n🔒 Todas as variáveis sensíveis estarão seguras no Doppler!');
}

if (require.main === module) {
  main();
}

module.exports = { parseEnvFile, generateDopplerCommands, createCleanEnvFile };