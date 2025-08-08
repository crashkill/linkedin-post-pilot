#!/usr/bin/env node

/**
 * Script para verificar se a migração para Doppler foi bem-sucedida
 * Este script verifica:
 * 1. Se o .env contém apenas variáveis públicas
 * 2. Se o Doppler CLI está instalado
 * 3. Se o projeto está configurado no Doppler
 * 4. Se as variáveis sensíveis estão no Doppler
 */

const fs = require('fs');
const { execSync } = require('child_process');

// Variáveis que devem estar APENAS no .env (públicas)
const EXPECTED_PUBLIC_VARS = [
  'VITE_SUPABASE_URL',
  'NODE_ENV'
];

// Variáveis que NÃO devem estar no .env (sensíveis)
const SENSITIVE_VARS = [
  'VITE_SUPABASE_ANON_KEY',
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

function parseEnvFile() {
  try {
    const content = fs.readFileSync('.env', 'utf8');
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
  } catch (error) {
    return null;
  }
}

function checkDopplerCLI() {
  try {
    execSync('doppler --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function checkDopplerConfig() {
  try {
    const output = execSync('doppler configure', { stdio: 'pipe', encoding: 'utf8' });
    return output.includes('project') && output.includes('config');
  } catch (error) {
    return false;
  }
}

function checkDopplerSecrets() {
  try {
    const output = execSync('doppler secrets --json', { stdio: 'pipe', encoding: 'utf8' });
    const secrets = JSON.parse(output);
    
    const foundSecrets = [];
    const missingSecrets = [];
    
    for (const varName of SENSITIVE_VARS) {
      if (secrets[varName]) {
        foundSecrets.push(varName);
      } else {
        missingSecrets.push(varName);
      }
    }
    
    return { foundSecrets, missingSecrets };
  } catch (error) {
    return null;
  }
}

function main() {
  console.log('🔍 Verificando migração para Doppler...');
  console.log('=' .repeat(50));
  
  let allGood = true;
  
  // 1. Verificar arquivo .env
  console.log('\n📄 VERIFICANDO ARQUIVO .env:');
  const envVars = parseEnvFile();
  
  if (!envVars) {
    console.log('❌ Arquivo .env não encontrado!');
    allGood = false;
  } else {
    // Verificar variáveis públicas
    const missingPublic = EXPECTED_PUBLIC_VARS.filter(v => !envVars[v]);
    if (missingPublic.length > 0) {
      console.log(`❌ Variáveis públicas faltando: ${missingPublic.join(', ')}`);
      allGood = false;
    } else {
      console.log('✅ Variáveis públicas presentes');
    }
    
    // Verificar se variáveis sensíveis foram removidas
    const foundSensitive = SENSITIVE_VARS.filter(v => envVars[v]);
    if (foundSensitive.length > 0) {
      console.log(`❌ Variáveis sensíveis ainda no .env: ${foundSensitive.join(', ')}`);
      allGood = false;
    } else {
      console.log('✅ Nenhuma variável sensível no .env');
    }
  }
  
  // 2. Verificar Doppler CLI
  console.log('\n🔧 VERIFICANDO DOPPLER CLI:');
  if (!checkDopplerCLI()) {
    console.log('❌ Doppler CLI não instalado');
    console.log('💡 Execute: choco install doppler ou siga o guia de instalação');
    allGood = false;
  } else {
    console.log('✅ Doppler CLI instalado');
  }
  
  // 3. Verificar configuração do projeto
  console.log('\n⚙️  VERIFICANDO CONFIGURAÇÃO:');
  if (!checkDopplerConfig()) {
    console.log('❌ Projeto não configurado no Doppler');
    console.log('💡 Execute: doppler setup');
    allGood = false;
  } else {
    console.log('✅ Projeto configurado no Doppler');
  }
  
  // 4. Verificar segredos no Doppler
  console.log('\n🔐 VERIFICANDO SEGREDOS NO DOPPLER:');
  const secretsCheck = checkDopplerSecrets();
  
  if (!secretsCheck) {
    console.log('❌ Não foi possível verificar segredos');
    console.log('💡 Verifique se o Doppler está configurado corretamente');
    allGood = false;
  } else {
    const { foundSecrets, missingSecrets } = secretsCheck;
    
    if (foundSecrets.length > 0) {
      console.log(`✅ Segredos encontrados (${foundSecrets.length}):`);
      foundSecrets.forEach(secret => console.log(`   - ${secret}`));
    }
    
    if (missingSecrets.length > 0) {
      console.log(`⚠️  Segredos faltando (${missingSecrets.length}):`);
      missingSecrets.forEach(secret => console.log(`   - ${secret}`));
      console.log('💡 Execute: node setup-doppler-secrets.cjs');
    }
  }
  
  // Resultado final
  console.log('\n' + '='.repeat(50));
  if (allGood && secretsCheck && secretsCheck.missingSecrets.length === 0) {
    console.log('🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('✅ Todas as verificações passaram');
    console.log('🚀 Execute: npm run dev (agora usa Doppler automaticamente)');
  } else {
    console.log('⚠️  MIGRAÇÃO INCOMPLETA');
    console.log('📋 Siga as instruções acima para completar a configuração');
    console.log('📖 Consulte: DOPPLER_MIGRATION_GUIDE.md');
  }
  
  console.log('\n💡 COMANDOS ÚTEIS:');
  console.log('   npm run setup:doppler  - Configurar segredos automaticamente');
  console.log('   npm run test:doppler   - Testar carregamento de variáveis');
  console.log('   npm run dev           - Executar com Doppler');
  console.log('   npm run dev:local     - Executar sem Doppler (apenas .env)');
}

if (require.main === module) {
  main();
}

module.exports = { parseEnvFile, checkDopplerCLI, checkDopplerConfig, checkDopplerSecrets };