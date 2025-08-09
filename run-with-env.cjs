/**
 * Script para simular o comportamento do Doppler
 * Carrega variáveis do .env e executa comandos
 * Uso: node run-with-env.cjs "npm run dev"
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Função para carregar variáveis do .env
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

// Obter comando dos argumentos
const command = process.argv.slice(2).join(' ');

if (!command) {
  console.log('❌ Uso: node run-with-env.cjs "<comando>"');
  console.log('📝 Exemplos:');
  console.log('   node run-with-env.cjs "npm run dev"');
  console.log('   node run-with-env.cjs "node test-doppler.cjs"');
  process.exit(1);
}

console.log('🔄 Carregando variáveis do .env...');
const envVars = loadEnvFile();

console.log(`📊 ${Object.keys(envVars).length} variáveis carregadas`);
console.log(`🚀 Executando: ${command}`);
console.log('=' .repeat(50));

// Combinar variáveis do sistema com as do .env
const combinedEnv = { ...process.env, ...envVars };

// Executar comando
const [cmd, ...args] = command.split(' ');
const child = spawn(cmd, args, {
  stdio: 'inherit',
  env: combinedEnv,
  shell: true
});

child.on('close', (code) => {
  console.log(`\n🏁 Processo finalizado com código: ${code}`);
  process.exit(code);
});

child.on('error', (error) => {
  console.error('❌ Erro ao executar comando:', error.message);
  process.exit(1);
});