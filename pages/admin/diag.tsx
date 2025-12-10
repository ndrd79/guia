import { GetServerSideProps } from 'next'

interface DiagProps {
    sessionInfo: any
    cookies: string[]
    profile: any
    error: string | null
}

export default function AdminDiag({ sessionInfo, cookies, profile, error }: DiagProps) {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold mb-6">Diagnóstico de Autenticação</h1>

                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded">
                        <h2 className="font-semibold mb-2">Cookies Presentes:</h2>
                        <pre className="text-sm overflow-auto">{JSON.stringify(cookies, null, 2)}</pre>
                    </div>

                    <div className="p-4 bg-gray-50 rounded">
                        <h2 className="font-semibold mb-2">Sessão:</h2>
                        <pre className="text-sm overflow-auto">{JSON.stringify(sessionInfo, null, 2)}</pre>
                    </div>

                    <div className="p-4 bg-gray-50 rounded">
                        <h2 className="font-semibold mb-2">Perfil:</h2>
                        <pre className="text-sm overflow-auto">{JSON.stringify(profile, null, 2)}</pre>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded">
                            <h2 className="font-semibold mb-2">Erro:</h2>
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="mt-6">
                        <a href="/admin/login" className="text-blue-600 hover:underline">
                            Voltar ao Login
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    try {
        const { createServerSupabaseClient } = await import('../../lib/supabase')
        const supabase = createServerSupabaseClient(ctx)

        // Listar todos os cookies
        const cookies = Object.keys(ctx.req.cookies || {})

        // Tentar obter sessão
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        let profile = null
        let profileError = null

        if (session?.user?.id) {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

            profile = data
            profileError = error?.message
        }

        return {
            props: {
                cookies,
                sessionInfo: session ? {
                    userId: session.user.id,
                    email: session.user.email,
                    expiresAt: session.expires_at,
                } : null,
                profile,
                error: sessionError?.message || profileError || null,
            }
        }
    } catch (err: any) {
        return {
            props: {
                cookies: [],
                sessionInfo: null,
                profile: null,
                error: err.message,
            }
        }
    }
}
