import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { huggingfaceLimiter } from '../_shared/rate-limiter.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HuggingFaceRequest {
  prompt: string
  options?: {
    steps?: number
    guidance?: number
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Inicializar cliente Supabase para verificar usuário
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar rate limiting
    const rateLimitResult = await huggingfaceLimiter.checkLimit(user.id)
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit excedido. Tente novamente em alguns minutos.',
          resetTime: rateLimitResult.resetTime
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
          } 
        }
       )
     }

     // Parse request body
    const { prompt, options = {} }: HuggingFaceRequest = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Chamar API Hugging Face
    const huggingfaceApiKey = Deno.env.get('HUGGINGFACE_API_KEY')
    if (!huggingfaceApiKey) {
      return new Response(
        JSON.stringify({ error: 'Hugging Face API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const hfResponse = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${huggingfaceApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `Professional LinkedIn post image: ${prompt}, high quality, modern, clean design, technology theme`,
          parameters: {
            negative_prompt: 'blurry, low quality, distorted, ugly',
            num_inference_steps: options.steps || 20,
            guidance_scale: options.guidance || 7.5
          }
        })
      }
    )

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text()
      console.error('Hugging Face API Error:', errorText)
      return new Response(
        JSON.stringify({ error: `Hugging Face API error: ${hfResponse.status}` }),
        { 
          status: hfResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Converter blob para base64 para enviar via JSON
    const imageBlob = await hfResponse.blob()
    const arrayBuffer = await imageBlob.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    
    // Criar data URL
    const imageUrl = `data:${imageBlob.type};base64,${base64}`

    // Log da requisição para monitoramento
    console.log(`Hugging Face API call for user ${user.id}: ${prompt.substring(0, 50)}...`)

    return new Response(
      JSON.stringify({ imageUrl }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
        } 
      }
    )

  } catch (error) {
    console.error('Error in huggingface-proxy:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})