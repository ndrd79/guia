const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

// Posições que são usadas no site
const POSITIONS_USED_IN_SITE = [
  'Hero Carousel',
  'Header Superior', 
  'Sidebar Esquerda',
  'Sidebar Direita',
  'Entre Conteúdo',
  'Empresa - Topo',
  'Empresa - Rodapé',
  'Footer',
  'header',
  'sidebar',
  'content-top',
  'content-middle', 
  'content-bottom',
  'footer',
  'mobile'
]

async function checkBannerPositions() {
  console.log('🔍 VERIFICANDO POSIÇÕES DE BANNERS')
  console.log('=' .repeat(50))

  try {
    // Buscar todos os banners ativos
    const { data: activeBanners, error } = await supabase
      .from('banners')
      .select('*')
      .eq('ativo', true)
      .order('posicao')

    if (error) {
      console.error('❌ Erro ao buscar banners:', error)
      return
    }

    console.log(`📊 Total de banners ativos: ${activeBanners?.length || 0}`)

    // Agrupar banners por posição
    const bannersByPosition = {}
    if (activeBanners) {
      activeBanners.forEach(banner => {
        if (!bannersByPosition[banner.posicao]) {
          bannersByPosition[banner.posicao] = []
        }
        bannersByPosition[banner.posicao].push(banner)
      })
    }

    console.log('\n📍 POSIÇÕES COM BANNERS ATIVOS:')
    Object.keys(bannersByPosition).forEach(position => {
      const count = bannersByPosition[position].length
      console.log(`   ✅ ${position}: ${count} banner(s)`)
    })

    console.log('\n🚨 POSIÇÕES SEM BANNERS (podem aparecer em branco):')
    const positionsWithoutBanners = POSITIONS_USED_IN_SITE.filter(
      position => !bannersByPosition[position]
    )

    if (positionsWithoutBanners.length > 0) {
      positionsWithoutBanners.forEach(position => {
        console.log(`   ❌ ${position}: Nenhum banner`)
      })
    } else {
      console.log('   ✅ Todas as posições têm banners!')
    }

    console.log('\n💡 ANÁLISE DETALHADA:')
    console.log('=' .repeat(30))

    // Verificar posições críticas
    const criticalPositions = ['Hero Carousel', 'Header Superior', 'Sidebar Esquerda']
    
    criticalPositions.forEach(position => {
      if (bannersByPosition[position]) {
        console.log(`✅ ${position}: ${bannersByPosition[position].length} banner(s) - OK`)
      } else {
        console.log(`🚨 ${position}: SEM BANNERS - Isso pode causar espaços em branco!`)
      }
    })

    console.log('\n🔧 RECOMENDAÇÕES PARA CORRIGIR BANNERS EM BRANCO:')
    console.log('=' .repeat(50))

    if (positionsWithoutBanners.length > 0) {
      console.log('1. 📝 Criar banners para as posições em branco:')
      positionsWithoutBanners.forEach(position => {
        console.log(`   - ${position}`)
      })
      console.log('\n   Como fazer:')
      console.log('   • Acesse http://localhost:3000/admin/banners')
      console.log('   • Clique em "Novo Banner"')
      console.log('   • Selecione a posição desejada')
      console.log('   • Faça upload de uma imagem')
      console.log('   • Marque como "Ativo"')
      console.log('   • Salve o banner')
    }

    console.log('\n2. ✅ Verificar se o BannerContainer está retornando null:')
    console.log('   • O componente BannerContainer retorna null quando não há banners')
    console.log('   • Isso é o comportamento correto - não mostra espaço vazio')
    console.log('   • Se você quer mostrar um placeholder, modifique o componente')

  } catch (error) {
    console.error('❌ Erro durante verificação:', error)
  }
}

checkBannerPositions()