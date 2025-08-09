import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function republishPost() {
  try {
    console.log('🔄 Republicando post no LinkedIn...')
    
    // Fazer login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'fabriciocardosolima@gmail.com',
      password: '123456'
    })
    
    if (authError) {
      console.error('❌ Erro ao fazer login:', authError)
      return
    }
    
    console.log('✅ Login realizado')
    
    // Buscar o post mais recente em draft
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (postsError) {
      console.error('❌ Erro ao buscar posts:', postsError)
      return
    }
    
    if (!posts || posts.length === 0) {
      console.log('⚠️  Nenhum post em draft encontrado')
      return
    }
    
    const post = posts[0]
    console.log(`📄 Post encontrado: ${post.title}`)
    console.log(`📅 Criado em: ${post.created_at}`)
    
    // Atualizar a integração LinkedIn com token válido do Doppler
    const linkedinAccessToken = process.env.LINKEDIN_ACCESS_TOKEN
    
    if (!linkedinAccessToken) {
      console.error('❌ LINKEDIN_ACCESS_TOKEN não encontrado no Doppler')
      return
    }
    
    console.log('🔑 Atualizando token LinkedIn...')
    
    const { error: updateError } = await supabase
      .from('linkedin_integrations')
      .update({
        access_token: linkedinAccessToken,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', authData.user.id)
    
    if (updateError) {
      console.error('❌ Erro ao atualizar token:', updateError)
      return
    }
    
    console.log('✅ Token atualizado com sucesso')
    
    // Chamar a Edge Function para publicar
    console.log('📤 Publicando no LinkedIn...')
    
    const { data: publishData, error: publishError } = await supabase.functions.invoke('linkedin-publish', {
      body: {
        postId: post.id,
        content: post.content,
        imageUrl: post.image_url
      }
    })
    
    if (publishError) {
      console.error('❌ Erro ao publicar:', publishError)
      return
    }
    
    console.log('✅ Resposta da publicação:', publishData)
    
    // Verificar se foi publicado com sucesso
    const { data: updatedPost, error: checkError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', post.id)
      .single()
    
    if (checkError) {
      console.error('❌ Erro ao verificar post:', checkError)
      return
    }
    
    console.log(`📊 Status final do post: ${updatedPost.status}`)
    console.log(`🔗 LinkedIn Post ID: ${updatedPost.linkedin_post_id || 'N/A'}`)
    
    if (updatedPost.status === 'published') {
      console.log('🎉 Post publicado com sucesso no LinkedIn!')
    } else {
      console.log('⚠️  Post não foi publicado. Verifique os logs.')
    }
    
    // Logout
    await supabase.auth.signOut()
    console.log('👋 Logout realizado')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

republishPost().then(() => {
  console.log('\n✅ Republicação concluída')
}).catch(error => {
  console.error('❌ Erro na republicação:', error)
})