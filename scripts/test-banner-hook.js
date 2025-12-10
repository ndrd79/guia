const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBannerHook() {
  console.log('🔍 Testando busca de banner para "Sidebar Esquerda"...\n')
  
  try {
    // Simular a query do hook useBanners
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('ativo', true)
      .eq('posicao', 'Sidebar Esquerda')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erro na query:', error)
      return
    }
    
    console.log(`📊 Banners encontrados: ${data?.length || 0}`)
    
    if (data && data.length > 0) {
      const banner = data[0] // Primeiro banner (como faz o useBanner)
      
      console.log('\n✅ Banner encontrado:')
      console.log(`   ID: ${banner.id}`)
      console.log(`   Nome: ${banner.nome}`)
      console.log(`   Posição: ${banner.posicao}`)
      console.log(`   Dimensões: ${banner.largura}x${banner.altura}`)
      console.log(`   Ativo: ${banner.ativo}`)
      console.log(`   Imagem: ${banner.imagem || 'Não definida'}`)
      console.log(`   Link: ${banner.link || 'Não definido'}`)
      
      // Verificar se a imagem existe
      if (banner.imagem) {
        console.log('\n🔗 Testando URL da imagem...')
        try {
          const response = await fetch(banner.imagem, { method: 'HEAD' })
          console.log(`   Status: ${response.status} ${response.statusText}`)
          console.log(`   Content-Type: ${response.headers.get('content-type')}`)
        } catch (fetchError) {
          console.log(`   ❌ Erro ao acessar imagem: ${fetchError.message}`)
        }
      }
    } else {
      console.log('❌ Nenhum banner encontrado para "Sidebar Esquerda"')
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar:', error)
  }
}

// Executar teste
testBannerHook()