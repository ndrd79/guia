import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import formidable from 'formidable'
import fs from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente admin com chave de serviço
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable({})
    const [fields, files] = await form.parse(req)
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file
    const bucket = Array.isArray(fields.bucket) ? fields.bucket[0] : fields.bucket
    const folder = Array.isArray(fields.folder) ? fields.folder[0] : fields.folder
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    // Ler o arquivo
    const fileBuffer = fs.readFileSync(file.filepath)
    
    // Gerar nome único
    const fileExt = file.originalFilename?.split('.').pop()?.toLowerCase()
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const cleanName = file.originalFilename?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
    const fileName = `${folder ? folder + '/' : ''}${timestamp}-${randomStr}-${cleanName}.${fileExt}`
    
    console.log('📤 Upload via API:', fileName)
    
    // Upload usando chave de serviço
    const { data, error } = await supabaseAdmin.storage
      .from(bucket || 'empresas')
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype || 'application/octet-stream',
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ Erro no upload:', error)
      throw error
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket || 'empresas')
      .getPublicUrl(fileName)

    console.log('✅ Upload concluído:', publicUrl)
    
    res.status(200).json({ 
      url: publicUrl, 
      path: fileName,
      success: true 
    })
    
  } catch (error: any) {
    console.error('❌ Erro na API de upload:', error)
    res.status(500).json({ 
      error: error.message || 'Upload failed',
      success: false 
    })
  }
}