const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testImageUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return {
      accessible: response.ok,
      status: response.status,
      contentType: response.headers.get('content-type')
    }
  } catch (error) {
    return {
      accessible: false,
      error: error.message
    }
  }
}

async function diagnoseBanners() {
  console.log('🔍 DIAGNÓSTICO DE BANNERS')
  console.log('=' .repeat(50))

  try {
    // 1. Verificar todos os banners
    console.log('\n📊 1. LISTANDO TODOS OS BANNERS:')
    const { data: allBanners, error: allError } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false })

    if (allError) {
      console.error('❌ Erro ao buscar banners:', allError)
      return
    }

    console.log(`📈 Total de banners: ${allBanners?.length || 0}`)

    if (!allBanners || allBanners.length === 0) {
      console.log('⚠️  NENHUM BANNER ENCONTRADO NO BANCO DE DADOS!')
      console.log('💡 Isso explica por que os banners estão em branco.')
      return
    }

    // 2. Verificar banners ativos
    console.log('\n✅ 2. BANNERS ATIVOS:')
    const activeBanners = allBanners.filter(banner => banner.ativo)
    console.log(`📈 Banners ativos: ${activeBanners.length}`)

    if (activeBanners.length === 0) {
      console.log('⚠️  NENHUM BANNER ATIVO ENCONTRADO!')
      console.log('💡 Todos os banners estão inativos, por isso aparecem em branco.')
    }

    // 3. Agrupar por posição
    console.log('\n📍 3. BANNERS POR POSIÇÃO:')
    const bannersByPosition = {}
    activeBanners.forEach(banner => {
      if (!bannersByPosition[banner.posicao]) {
        bannersByPosition[banner.posicao] = []
      }
      bannersByPosition[banner.posicao].push(banner)
    })

    for (const [position, banners] of Object.entries(bannersByPosition)) {
      console.log(`   ${position}: ${banners.length} banner(s)`)
    }

    // 4. Verificar URLs de imagem
    console.log('\n🖼️  4. VERIFICANDO URLs DE IMAGEM:')
    for (const banner of activeBanners) {
      console.log(`\n📋 Banner: ${banner.nome} (${banner.posicao})`)
      console.log(`   ID: ${banner.id}`)
      console.log(`   Ativo: ${banner.ativo ? '✅' : '❌'}`)
      console.log(`   URL da imagem: ${banner.imagem}`)
      
      if (banner.imagem) {
        console.log('   🔍 Testando acessibilidade da imagem...')
        const imageTest = await testImageUrl(banner.imagem)
        
        if (imageTest.accessible) {
          console.log(`   ✅ Imagem acessível (${imageTest.status})`)
          console.log(`   📄 Tipo: ${imageTest.contentType}`)
        } else {
          console.log(`   ❌ Imagem inacessível`)
          if (imageTest.status) {
            console.log(`   📊 Status: ${imageTest.status}`)
          }
          if (imageTest.error) {
            console.log(`   🚨 Erro: ${imageTest.error}`)
          }
        }
      } else {
        console.log('   ⚠️  URL da imagem está vazia!')
      }

      if (banner.link) {
        console.log(`   🔗 Link: ${banner.link}`)
      }
    }

    // 5. Verificar banners inativos
    console.log('\n❌ 5. BANNERS INATIVOS:')
    const inactiveBanners = allBanners.filter(banner => !banner.ativo)
    console.log(`📈 Banners inativos: ${inactiveBanners.length}`)

    if (inactiveBanners.length > 0) {
      inactiveBanners.forEach(banner => {
        console.log(`   - ${banner.nome} (${banner.posicao})`)
      })
    }

    // 6. Resumo e recomendações
    console.log('\n📋 6. RESUMO E RECOMENDAÇÕES:')
    console.log('=' .repeat(50))

    if (allBanners.length === 0) {
      console.log('🚨 PROBLEMA: Nenhum banner cadastrado')
      console.log('💡 SOLUÇÃO: Cadastre banners através do painel admin (/admin/banners)')
    } else if (activeBanners.length === 0) {
      console.log('🚨 PROBLEMA: Nenhum banner ativo')
      console.log('💡 SOLUÇÃO: Ative os banners existentes no painel admin')
    } else {
      console.log('✅ Banners encontrados e ativos')
      
      // Verificar se há problemas de imagem
      const bannersWithImageIssues = []
      for (const banner of activeBanners) {
        if (!banner.imagem) {
          bannersWithImageIssues.push(`${banner.nome}: URL vazia`)
        } else {
          const imageTest = await testImageUrl(banner.imagem)
          if (!imageTest.accessible) {
            bannersWithImageIssues.push(`${banner.nome}: Imagem inacessível`)
          }
        }
      }

      if (bannersWithImageIssues.length > 0) {
        console.log('🚨 PROBLEMAS DE IMAGEM ENCONTRADOS:')
        bannersWithImageIssues.forEach(issue => {
          console.log(`   - ${issue}`)
        })
        console.log('💡 SOLUÇÃO: Corrija as URLs das imagens no painel admin')
      } else {
        console.log('✅ Todas as imagens estão acessíveis')
      }
    }

    console.log('\n🔧 PRÓXIMOS PASSOS:')
    console.log('1. Acesse /admin/banners para gerenciar banners')
    console.log('2. Verifique se os banners estão ativos')
    console.log('3. Confirme se as URLs das imagens estão corretas')
    console.log('4. Teste o site após as correções')

  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error)
  }
}

// Executar diagnóstico
diagnoseBanners()