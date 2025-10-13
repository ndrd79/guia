import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de autorização necessário',
        message: 'Forneça um token Bearer válido',
        headers: req.headers
      })
    }

    const token = authHeader.substring(7)
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Token de autorização inválido ou expirado',
        userError: userError?.message
      })
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      message: 'Autenticação bem-sucedida'
    })

  } catch (error) {
    console.error('Erro na API de teste de auth:', error)
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Ocorreu um erro ao processar a solicitação'
    })
  }
}