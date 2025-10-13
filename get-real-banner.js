// Script para buscar um banner real do banco
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function getRealBanner() {
  try {
    console.log('🔍 Buscando banners reais...')
    
    const { data: banners, error } = await supabase
      .from('banners')
      .select('id, nome, posicao, ativo')
      .eq('ativo', true)
      .limit(1)
    
    if (error) {
      console.error('Erro ao buscar banners:', error)
      return
    }
    
    if (!banners || banners.length === 0) {
      console.log('❌ Nenhum banner ativo encontrado')
      return
    }
    
    const banner = banners[0]
    console.log('✅ Banner encontrado:')
    console.log('ID:', banner.id)
    console.log('Nome:', banner.nome)
    console.log('Posição:', banner.posicao)
    console.log('Ativo:', banner.ativo)
    
    return banner.id
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

getRealBanner()