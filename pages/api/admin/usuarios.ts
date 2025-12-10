import { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth, AdminApiHandler } from '../../../lib/api/withAdminAuth'
import { createClient } from '@supabase/supabase-js'

/**
 * API de administração de usuários
 * Suporta GET (listar), POST (criar), PUT (atualizar), DELETE (excluir)
 * 
 * Segurança: Usa withAdminAuth para validação centralizada
 * IMPORTANTE: Esta API usa funções admin do Supabase que requerem service_role_key
 */

// Criar cliente com service role para operações admin
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const handler: AdminApiHandler = async (req, res, { adminClient }) => {
  try {
    switch (req.method) {
      case 'GET':
        return handleGet(req, res, adminClient)
      case 'POST':
        return handlePost(req, res)
      case 'PUT':
        return handlePut(req, res, adminClient)
      case 'DELETE':
        return handleDelete(req, res, adminClient)
      default:
        return res.status(405).json({ error: 'Método não permitido' })
    }
  } catch (error: any) {
    console.error('Erro na API de usuários:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export default withAdminAuth(handler)

// Listar usuários
async function handleGet(req: NextApiRequest, res: NextApiResponse, adminClient: any) {
  try {
    const { data, error } = await adminClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return res.status(200).json({ usuarios: data })
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao buscar usuários: ' + error.message })
  }
}

// Criar usuário
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { email, password, role = 'admin' } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' })
  }

  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Tipo de usuário inválido' })
  }

  try {
    // Usar cliente com service role para operações admin
    const serviceClient = getServiceClient()

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Confirma o email automaticamente
    })

    if (authError) throw authError

    if (!authData.user) {
      throw new Error('Usuário não foi criado')
    }

    // Criar perfil do usuário
    const { error: profileError } = await serviceClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        role
      })

    if (profileError) {
      // Se falhar ao criar o perfil, tentar deletar o usuário criado
      await serviceClient.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      usuario: {
        id: authData.user.id,
        email,
        role
      }
    })
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao criar usuário: ' + error.message })
  }
}

// Atualizar usuário
async function handlePut(req: NextApiRequest, res: NextApiResponse, adminClient: any) {
  const { id, email, role, password } = req.body

  if (!id) {
    return res.status(400).json({ error: 'ID do usuário é obrigatório' })
  }

  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Tipo de usuário inválido' })
  }

  try {
    // Usar cliente com service role para operações admin
    const serviceClient = getServiceClient()

    // Atualizar perfil
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        email,
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (profileError) throw profileError

    // Atualizar email no auth se fornecido
    if (email) {
      const { error: authError } = await serviceClient.auth.admin.updateUserById(id, {
        email
      })
      if (authError) console.warn('Erro ao atualizar email no auth:', authError.message)
    }

    // Atualizar senha se fornecida
    if (password && password.length >= 6) {
      const { error: passwordError } = await serviceClient.auth.admin.updateUserById(id, {
        password
      })
      if (passwordError) console.warn('Erro ao atualizar senha:', passwordError.message)
    }

    return res.status(200).json({ message: 'Usuário atualizado com sucesso' })
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao atualizar usuário: ' + error.message })
  }
}

// Deletar usuário
async function handleDelete(req: NextApiRequest, res: NextApiResponse, adminClient: any) {
  const { id } = req.body

  if (!id) {
    return res.status(400).json({ error: 'ID do usuário é obrigatório' })
  }

  try {
    // Usar cliente com service role para operações admin
    const serviceClient = getServiceClient()

    // Deletar perfil
    const { error: profileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', id)

    if (profileError) throw profileError

    // Deletar usuário do auth
    const { error: authError } = await serviceClient.auth.admin.deleteUser(id)
    if (authError) console.warn('Erro ao deletar usuário do auth:', authError.message)

    return res.status(200).json({ message: 'Usuário deletado com sucesso' })
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao deletar usuário: ' + error.message })
  }
}