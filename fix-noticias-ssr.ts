export const getServerSideProps: GetServerSideProps = async (ctx) => {
    try {
        const supabase = createServerSupabaseClient(ctx)

        // Buscar notícias com timeout e limite
        const queryPromise = supabase
            .from('noticias')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100)

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Database query timeout')), 8000)
        )

        const result = await Promise.race([queryPromise, timeoutPromise])
        const { data: noticias, error } = result as any

        if (error) {
            console.error('Error fetching noticias:', error)
            return {
                props: {
                    initialNoticias: [],
                },
            }
        }

        // Filtrar notícias com dados válidos
        const validNoticias = Human: (noticias || []).filter((n: any) => {
            return n &&
                n.id &&
                typeof n.titulo === 'string' &&
                n.titulo.length > 0 &&
                typeof n.categoria === 'string'
        })

        return {
            props: {
                initialNoticias: validNoticias,
            },
        }
    } catch (error) {
        console.error('getServerSideProps error:', error)
        return {
            props: {
                initialNoticias: [],
            },
        }
    }
}
