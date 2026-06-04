import { withAdminAuth, AdminApiHandler } from '../../../lib/api/withAdminAuth'

const handler: AdminApiHandler = async (req, res, { adminClient }) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const checkTable = async (table: string) => {
    try {
      const { count, error } = await adminClient
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.warn(`Tabela ${table} não encontrada:`, error.message)
        return { count: 0, exists: false }
      }
      
      return { count: count || 0, exists: true }
    } catch (err) {
      console.warn(`Erro ao acessar tabela ${table}:`, err)
      return { count: 0, exists: false }
    }
  }

  try {
    const [noticiasResult, classificadosResult, eventosResult, bannersResult, empresasResult] = await Promise.all([
      checkTable('noticias'),
      checkTable('classificados'), 
      checkTable('eventos'),
      checkTable('banners'),
      checkTable('empresas')
    ])

    return res.status(200).json({
      stats: {
        noticias: noticiasResult.count,
        classificados: classificadosResult.count,
        eventos: eventosResult.count,
        banners: bannersResult.count,
        empresas: empresasResult.count,
      },
      tableStatus: {
        noticias: noticiasResult.exists,
        classificados: classificadosResult.exists,
        eventos: eventosResult.exists,
        banners: bannersResult.exists,
        empresas: empresasResult.exists,
      }
    })
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Erro ao carregar estatísticas' })
  }
}

export default withAdminAuth(handler)
