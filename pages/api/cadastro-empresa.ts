import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { CATEGORIAS_VALIDAS, obterCategoriaValida } from '../../lib/constants/categorias'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    console.log('Dados recebidos:', req.body)
    
    const {
      name,
      category,
      phone,
      address,
      description,
      email,
      website,
      whatsapp,
      cidade,
      horario_funcionamento_dias,
      horario_funcionamento_horario,
      facebook,
      instagram,
      maps
    } = req.body

    // Validações obrigatórias
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome da empresa é obrigatório' })
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Categoria é obrigatória' })
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Telefone é obrigatório' })
    }

    if (!address || !address.trim()) {
      return res.status(400).json({ error: 'Endereço é obrigatório' })
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Descrição é obrigatória' })
    }

    // Validação de tamanho
    if (name.length > 100) {
      return res.status(400).json({ error: 'Nome deve ter no máximo 100 caracteres' })
    }

    if (address.length > 200) {
      return res.status(400).json({ error: 'Endereço deve ter no máximo 200 caracteres' })
    }

    if (description.length > 500) {
      return res.status(400).json({ error: 'Descrição deve ter no máximo 500 caracteres' })
    }

    // Validação de categoria
    console.log('Categoria recebida:', category)
    const categoriaNormalizada = obterCategoriaValida(category)
    console.log('Categoria normalizada:', categoriaNormalizada)
    if (!categoriaNormalizada) {
      console.log('Categorias válidas:', CATEGORIAS_VALIDAS)
      return res.status(400).json({ error: 'Categoria inválida' })
    }

    // Validação de email se fornecido
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'E-mail inválido' })
      }
    }

    // Validação de website se fornecido
    if (website && website.trim()) {
      try {
        new URL(website.trim())
      } catch {
        return res.status(400).json({ error: 'Website deve ser uma URL válida' })
      }
    }

    // Validação de maps se fornecido
    if (maps && maps.trim()) {
      try {
        new URL(maps.trim())
      } catch {
        return res.status(400).json({ error: 'Link do Google Maps deve ser uma URL válida' })
      }
    }

    // Preparar dados para inserção (usando nomes das colunas da tabela)
    const empresaData = {
      name: name.trim(),
      category: categoriaNormalizada,
      phone: phone.trim(),
      address: address.trim(),
      description: description.trim(),
      email: email?.trim() || null,
      website: website?.trim() || null,
      whatsapp: whatsapp?.trim() || null,
      location: cidade?.trim() || null,
      horario_funcionamento_dias: horario_funcionamento_dias?.trim() || null,
      horario_funcionamento_horario: horario_funcionamento_horario?.trim() || null,
      facebook: facebook?.trim() || null,
      instagram: instagram?.trim() || null,
      maps: maps?.trim() || null,
      status: 'pending',
      ativo: true,
      featured: false,
      is_new: true,
      rating: 0.0,
      reviews: 0
    }

    // Inserir no banco de dados
    const { data, error } = await supabase
      .from('empresas')
      .insert([empresaData])
      .select()

    if (error) {
      console.error('Erro ao inserir empresa:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }

    // Enviar notificação por email (opcional)
    try {
      await enviarNotificacaoAdmin(empresaData)
    } catch (emailError) {
      console.error('Erro ao enviar notificação por email:', emailError)
      // Não falha o cadastro se o email não funcionar
    }

    return res.status(201).json({ 
      message: 'Empresa cadastrada com sucesso! Aguarde aprovação.',
      empresa: data[0]
    })

  } catch (error) {
    console.error('Erro no cadastro de empresa:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

async function enviarNotificacaoAdmin(empresaData: any) {
  // Esta função pode ser implementada para enviar notificação por email
  // Por enquanto, apenas logamos a informação
  console.log('Nova empresa cadastrada:', {
    nome: empresaData.nome,
    categoria: empresaData.categoria,
    telefone: empresaData.telefone,
    email: empresaData.email,
    timestamp: new Date().toISOString()
  })

  // Aqui você pode implementar o envio de email usando um serviço como:
  // - Nodemailer
  // - SendGrid
  // - Amazon SES
  // - Etc.
}