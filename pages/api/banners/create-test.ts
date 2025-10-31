import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Banners de teste para as posições principais
    const testBanners = [
      {
        nome: 'Banner Header Teste',
        posicao: 'Header Inferior',
        imagem: 'https://via.placeholder.com/970x90/4F46E5/FFFFFF?text=Header+Banner',
        link: 'https://example.com',
        largura: 970,
        altura: 90,
        ativo: true
      },
      {
        nome: 'Banner Footer Teste',
        posicao: 'Footer',
        imagem: 'https://via.placeholder.com/728x90/059669/FFFFFF?text=Footer+Banner',
        link: 'https://example.com',
        largura: 728,
        altura: 90,
        ativo: true
      },
      {
        nome: 'Banner Mobile Teste',
        posicao: 'Mobile Banner',
        imagem: 'https://via.placeholder.com/320x50/DC2626/FFFFFF?text=Mobile+Banner',
        link: 'https://example.com',
        largura: 320,
        altura: 50,
        ativo: true
      },
      {
        nome: 'Banner Conteúdo Teste',
        posicao: 'Entre Conteúdo',
        imagem: 'https://via.placeholder.com/336x280/7C3AED/FFFFFF?text=Content+Banner',
        link: 'https://example.com',
        largura: 336,
        altura: 280,
        ativo: true
      },
      {
        nome: 'Banner Sidebar Teste',
        posicao: 'Sidebar Direita',
        imagem: 'https://via.placeholder.com/300x600/EA580C/FFFFFF?text=Sidebar+Banner',
        link: 'https://example.com',
        largura: 300,
        altura: 600,
        ativo: true
      },
      {
        nome: 'Banner Principal Teste',
        posicao: 'Banner Principal',
        imagem: 'https://via.placeholder.com/400x300/0891B2/FFFFFF?text=Banner+Principal',
        link: 'https://example.com',
        largura: 400,
        altura: 300,
        ativo: true
      }
    ]

    const { data, error } = await supabase
      .from('banners')
      .insert(testBanners)
      .select()

    if (error) {
      console.error('Erro ao criar banners de teste:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao criar banners de teste',
        details: error.message 
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Banners de teste criados com sucesso',
      data: data,
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Erro na API de criação de banners:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}