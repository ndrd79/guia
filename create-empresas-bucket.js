const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createEmpresasBucket() {
  console.log('🪣 Criando bucket empresas...')
  
  try {
    // Criar bucket
    const { data, error } = await supabase.storage.createBucket('empresas', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    })
    
    if (error && !error.message.includes('already exists')) {
      throw error
    }
    
    console.log('✅ Bucket empresas criado com sucesso!')
    
    // Verificar buckets existentes
    const { data: buckets } = await supabase.storage.listBuckets()
    console.log('📋 Buckets disponíveis:')
    buckets?.forEach(bucket => {
      console.log(`  - ${bucket.id} (público: ${bucket.public})`)
    })
    
  } catch (error) {
    console.error('❌ Erro ao criar bucket:', error.message)
  }
}

createEmpresasBucket()