import { useEffect, useState } from 'react'
import Head from 'next/head'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabase'

interface SessionInfo {
  session: any | null
  profile: any | null
  headers: Record<string, any>
  api: any | null
}

export default function DiagnosticoAdmin() {
  const [info, setInfo] = useState<SessionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        // Sessão atual
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          setError(`Erro ao obter sessão: ${sessionError.message}`)
        }
        const session = sessionData?.session || null

        // Obter token e headers
        const token = session?.access_token || null
        const headers: Record<string, any> = {
          authorization_present: !!token,
          token_preview: token ? token.slice(0, 10) + '...' + token.slice(-6) : null,
          token_length: token?.length || 0,
        }

        // Chamar API de diagnóstico
        const apiRes = await fetch('/api/admin/diagnostico', {
          method: 'GET',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const api = await apiRes.json()

        // Buscar perfil
        let profile: any = null
        if (session?.user) {
          const { data: p, error: pErr } = await supabase
            .from('profiles')
            .select('id, role, email')
            .eq('id', session.user.id)
            .single()
          if (!pErr) profile = p
        }

        setInfo({ session, profile, headers, api })
      } catch (e: any) {
        setError(e?.message || String(e))
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  return (
    <AdminLayout>
      <Head>
        <title>Diagnóstico Admin</title>
      </Head>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Diagnóstico de Autenticação/Admin</h1>
        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {info && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded p-4">
              <h2 className="font-medium mb-2">Sessão</h2>
              <pre className="text-sm bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify({
                user: info.session?.user ? { id: info.session.user.id, email: info.session.user.email } : null,
                access_token_preview: info.headers.token_preview,
              }, null, 2)}</pre>
            </div>
            <div className="border rounded p-4">
              <h2 className="font-medium mb-2">Perfil</h2>
              <pre className="text-sm bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(info.profile, null, 2)}</pre>
            </div>
            <div className="border rounded p-4 md:col-span-2">
              <h2 className="font-medium mb-2">API /api/admin/diagnostico</h2>
              <pre className="text-sm bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(info.api, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}