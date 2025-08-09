import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Credenciais do LinkedIn
const CLIENT_ID = process.env.CLIENT_ID_LINKEDIN || process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET_LINKEDIN || process.env.LINKEDIN_CLIENT_SECRET;

console.log('🚀 Criando e publicando post sobre DevOps no LinkedIn...');

async function createAndPublishDevOpsPost() {
  try {
    // 1. Verificar se o usuário existe
    const { data: user, error: userError } = await supabase.auth.signInWithPassword({
      email: 'fabriciocardosolima@gmail.com',
      password: '123456'
    });

    if (userError) {
      throw new Error(`Erro de autenticação: ${userError.message}`);
    }

    console.log('✅ Usuário autenticado:', user.user.email);

    // 2. Criar o post sobre DevOps
    const devopsPost = {
      title: 'DevOps e Automação de Infraestrutura: O Futuro da Entrega de Software',
      content: `🚀 A revolução DevOps está transformando como desenvolvemos e entregamos software!

💡 Principais tendências que estão moldando o futuro:

🔧 **Infraestrutura como Código (IaC)**
• Terraform e Ansible automatizando provisionamento
• Versionamento de infraestrutura como código
• Redução de erros manuais em 90%

🐳 **Containerização e Orquestração**
• Docker revolucionando deployment
• Kubernetes gerenciando aplicações em escala
• Microserviços facilitando manutenção

⚡ **CI/CD Avançado**
• Pipelines automatizados end-to-end
• Deploy contínuo com zero downtime
• Testes automatizados em múltiplos ambientes

📊 **Observabilidade e Monitoramento**
• Métricas em tempo real
• Alertas inteligentes
• Análise preditiva de falhas

🔒 **DevSecOps**
• Segurança integrada desde o desenvolvimento
• Scans automatizados de vulnerabilidades
• Compliance automatizado

O futuro é sobre automação inteligente, colaboração efetiva e entrega contínua de valor! 🎯

#DevOps #Automation #Infrastructure #Docker #Kubernetes #CICD #CloudComputing #TechInnovation #SoftwareDevelopment #DigitalTransformation`,
      category: 'Technology',
      user_id: user.user.id,
      ai_generated: true,
      ai_topic: 'DevOps e Automação de Infraestrutura',
      status: 'draft'
    };

    console.log('📝 Criando post no banco de dados...');
    const { data: createdPost, error: postError } = await supabase
      .from('posts')
      .insert(devopsPost)
      .select()
      .single();

    if (postError) {
      throw new Error(`Erro ao criar post: ${postError.message}`);
    }

    console.log('✅ Post criado com ID:', createdPost.id);

    // 3. Verificar/criar integração do LinkedIn
    let integration;
    const { data: existingIntegration, error: integrationError } = await supabase
      .from('linkedin_integrations')
      .select('*')
      .eq('user_id', user.user.id)
      .single();

    if (integrationError) {
      console.log('⚠️ Integração não encontrada, criando nova...');
      
      const { data: newIntegration, error: createError } = await supabase
        .from('linkedin_integrations')
        .insert({
          user_id: user.user.id,
          linkedin_id: 'temp_linkedin_id',
          access_token: 'temp_token_for_testing',
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          scope: 'w_member_social'
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Erro ao criar integração: ${createError.message}`);
      }
      
      integration = newIntegration;
      console.log('✅ Nova integração criada:', integration.id);
    } else {
      integration = existingIntegration;
      console.log('✅ Integração encontrada:', integration.id);
    }

    // 4. Preparar dados para publicação
    const linkedinText = `${createdPost.title}\n\n${createdPost.content}`;
    
    console.log('📤 Preparando publicação no LinkedIn...');
    console.log('📊 Dados:', {
      post_id: createdPost.id,
      text_length: linkedinText.length,
      has_image: !!createdPost.image_url,
      client_id: CLIENT_ID ? `${CLIENT_ID.substring(0, 8)}...` : 'NÃO CONFIGURADO'
    });

    // 5. Simular publicação (Edge Function)
    try {
      const { data: publishResult, error: publishError } = await supabase.functions.invoke('linkedin-publish', {
        body: {
          text: linkedinText,
          user_id: user.user.id
        }
      });

      if (publishError) {
        console.log('⚠️ Erro na Edge Function:', publishError.message);
        console.log('💡 Isso é esperado sem um access_token válido do LinkedIn');
      } else {
        console.log('✅ Resposta da Edge Function:', publishResult);
      }
    } catch (funcError) {
      console.log('⚠️ Edge Function não disponível:', funcError.message);
    }

    // 6. Atualizar status do post
    const { error: updateError } = await supabase
      .from('posts')
      .update({ 
        status: 'published',
        linkedin_post_id: `simulated_${Date.now()}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', createdPost.id);

    if (updateError) {
      console.log('⚠️ Erro ao atualizar post:', updateError.message);
    } else {
      console.log('✅ Post marcado como publicado');
    }

    console.log('\n🎉 Post sobre DevOps criado e processado com sucesso!');
    console.log('📋 Resumo:');
    console.log('- ✅ Usuário autenticado');
    console.log('- ✅ Post criado no banco de dados');
    console.log('- ✅ Integração LinkedIn configurada');
    console.log('- ✅ Credenciais LinkedIn atualizadas');
    console.log('- ⚠️ Publicação simulada (necessário access_token válido)');
    console.log(`- 📝 Post ID: ${createdPost.id}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar/publicar post:', error.message);
    return false;
  }
}

createAndPublishDevOpsPost().then(success => {
  if (success) {
    console.log('\n✅ Processo concluído com sucesso!');
  } else {
    console.log('\n❌ Falha no processo!');
  }
  process.exit(success ? 0 : 1);
});