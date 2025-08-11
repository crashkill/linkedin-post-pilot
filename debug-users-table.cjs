const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUsersTable() {
  try {
    console.log('🔐 Fazendo login...');
    
    // Login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'fabriciocardosolima@gmail.com',
      password: '123456'
    });

    if (authError) {
      console.error('❌ Erro no login:', authError.message);
      return;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('👤 User ID atual:', authData.user.id);
    console.log('📧 Email atual:', authData.user.email);

    // Listar todos os usuários na tabela
    console.log('\n🔍 Listando todos os usuários na tabela users...');
    const { data: allUsers, error: listError } = await supabase
      .from('users')
      .select('*');

    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message);
      return;
    }

    console.log('📊 Total de usuários encontrados:', allUsers?.length || 0);
    
    if (allUsers && allUsers.length > 0) {
      allUsers.forEach((user, index) => {
        console.log(`\n👤 Usuário ${index + 1}:`);
        console.log('  ID:', user.id);
        console.log('  Email:', user.email);
        console.log('  Nome:', user.name);
        console.log('  Criado em:', user.created_at);
      });
    }

    // Buscar especificamente por email
    console.log('\n🔍 Buscando por email específico...');
    const { data: userByEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'fabriciocardosolima@gmail.com');

    if (emailError) {
      console.error('❌ Erro ao buscar por email:', emailError.message);
    } else {
      console.log('📧 Usuários encontrados por email:', userByEmail?.length || 0);
      if (userByEmail && userByEmail.length > 0) {
        userByEmail.forEach(user => {
          console.log('  ID encontrado:', user.id);
          console.log('  Email encontrado:', user.email);
        });
      }
    }

    // Buscar por ID atual
    console.log('\n🔍 Buscando por ID atual...');
    const { data: userById, error: idError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id);

    if (idError) {
      console.error('❌ Erro ao buscar por ID:', idError.message);
    } else {
      console.log('🆔 Usuários encontrados por ID:', userById?.length || 0);
      if (userById && userById.length > 0) {
        userById.forEach(user => {
          console.log('  ID encontrado:', user.id);
          console.log('  Email encontrado:', user.email);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar o debug
debugUsersTable();