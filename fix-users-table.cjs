const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase com service role key para bypass RLS
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUsersTable() {
  try {
    console.log('🔧 Iniciando correção da tabela users...');
    
    // Primeiro, vamos ver o que realmente existe na tabela (com service role)
    console.log('\n🔍 Verificando dados existentes na tabela users (com service role)...');
    const { data: existingUsers, error: listError } = await supabase
      .from('users')
      .select('*');

    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message);
      return;
    }

    console.log('📊 Total de usuários encontrados:', existingUsers?.length || 0);
    
    if (existingUsers && existingUsers.length > 0) {
      console.log('\n👥 Usuários existentes:');
      existingUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ID: ${user.id}, Email: ${user.email}`);
      });

      // Limpar usuários existentes com o email específico
      console.log('\n🧹 Removendo usuários existentes com email fabriciocardosolima@gmail.com...');
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('email', 'fabriciocardosolima@gmail.com');

      if (deleteError) {
        console.error('❌ Erro ao deletar usuários:', deleteError.message);
        return;
      }

      console.log('✅ Usuários removidos com sucesso!');
    }

    // Agora fazer login normal para obter o ID correto
    console.log('\n🔐 Fazendo login para obter ID do usuário...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'fabriciocardosolima@gmail.com',
      password: '123456'
    });

    if (authError) {
      console.error('❌ Erro no login:', authError.message);
      return;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('👤 User ID:', authData.user.id);

    // Criar o usuário corretamente
    console.log('\n👤 Criando usuário na tabela users...');
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        name: 'Fabricio Lima'
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar usuário:', createError.message);
      console.error('Detalhes:', createError);
      return;
    }

    console.log('✅ Usuário criado com sucesso!');
    console.log('📄 Dados do usuário:', newUser);

    console.log('\n🎉 Correção da tabela users concluída!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar a correção
fixUsersTable();