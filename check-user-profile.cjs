const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis do .env
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  const envVars = {};
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
        }
      }
    });
  }
  
  return envVars;
}

const envVars = loadEnvFile();
const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

async function checkAndCreateUserProfile() {
  try {
    console.log('🔐 Fazendo login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'fabriciocardosolima@gmail.com',
      password: '123456'
    });

    if (authError) {
      console.error('❌ Erro no login:', authError.message);
      return;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('👤 Auth User ID:', authData.user.id);
    console.log('📧 Email:', authData.user.email);

    // Verificar se existe perfil na tabela users por email
    console.log('\n🔍 Verificando perfil na tabela users por email...');
    const { data: userByEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', authData.user.email)
      .single();

    if (emailError && emailError.code === 'PGRST116') {
      console.log('⚠️ Perfil não encontrado. Criando novo perfil...');
      
      // Criar perfil do usuário
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.user_metadata?.name || 'Fabricio Lima',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar perfil:', createError.message);
        return;
      }

      console.log('✅ Perfil criado com sucesso!');
      console.log('📊 Dados do perfil:', newUser);
    } else if (emailError) {
      console.error('❌ Erro ao verificar perfil:', emailError.message);
      return;
    } else {
      console.log('✅ Perfil encontrado por email!');
      console.log('📊 Dados do perfil:', userByEmail);
      
      // Verificar se o ID do auth coincide com o ID da tabela users
      if (userByEmail.id !== authData.user.id) {
        console.log('⚠️ IDs diferentes! Atualizando ID na tabela users...');
        console.log(`Auth ID: ${authData.user.id}`);
        console.log(`Users table ID: ${userByEmail.id}`);
        
        // Atualizar o ID na tabela users
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ 
            id: authData.user.id,
            updated_at: new Date().toISOString()
          })
          .eq('email', authData.user.email)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Erro ao atualizar ID:', updateError.message);
          return;
        }

        console.log('✅ ID atualizado com sucesso!');
        console.log('📊 Perfil atualizado:', updatedUser);
      }
    }

    console.log('\n🎉 Verificação concluída! Agora você pode criar posts.');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkAndCreateUserProfile();