const { createClient } = require('@supabase/supabase-js')

// ⚠️ SEGURANÇA: Use variáveis de ambiente em vez de chaves hardcoded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mlkpnapnijdbskaimquj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validação de segurança
if (!supabaseServiceKey) {
  console.error('❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não configurada no .env.local');
  console.error('📝 Este script precisa da chave service_role para funcionar.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugBanners() {
  console.log('🔍 Verificando banners no banco de dados...\n')
  
  try {
    // Listar todos os banners
    const { data: banners, error } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar banners:', error)
      return
    }

    console.log(`📊 Total de banners encontrados: ${banners.length}\n`)

    if (banners.length === 0) {
      console.log('⚠️  Nenhum banner encontrado no banco de dados!')
      return
    }

    // Mostrar detalhes de cada banner
    banners.forEach((banner, index) => {
      console.log(`Banner ${index + 1}:`)
      console.log(`  ID: ${banner.id}`)
      console.log(`  Nome: ${banner.nome}`)
      console.log(`  Posição: ${banner.posicao}`)
      console.log(`  Ativo: ${banner.ativo ? '✅' : '❌'}`)
      console.log(`  Link: ${banner.link || 'Sem link'}`)
      console.log(`  Dimensões: ${banner.largura}x${banner.altura}`)
      console.log(`  Criado em: ${new Date(banner.created_at).toLocaleString('pt-BR')}`)
      console.log('  ---')
    })

    // Procurar especificamente por banner relacionado a "petShop"
    const petShopBanners = banners.filter(banner => 
      banner.nome.toLowerCase().includes('pet') || 
      banner.nome.toLowerCase().includes('shop') ||
      banner.posicao.toLowerCase().includes('pet')
    )

    if (petShopBanners.length > 0) {
      console.log('\n🐕 Banners relacionados a PetShop encontrados:')
      petShopBanners.forEach(banner => {
        console.log(`  - ${banner.nome} (ID: ${banner.id}) - Ativo: ${banner.ativo ? '✅' : '❌'}`)
      })
    } else {
      console.log('\n⚠️  Nenhum banner relacionado a "petShop" encontrado')
    }

    // Verificar banners ativos
    const activeBanners = banners.filter(banner => banner.ativo)
    console.log(`\n✅ Banners ativos: ${activeBanners.length}`)
    
    if (activeBanners.length > 0) {
      console.log('Banners ativos:')
      activeBanners.forEach(banner => {
        console.log(`  - ${banner.nome} (${banner.posicao}) - ID: ${banner.id}`)
      })
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

debugBanners()