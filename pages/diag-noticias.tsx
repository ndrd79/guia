import { GetServerSideProps } from 'next'
import { createServerSupabaseClient } from '../lib/supabase'

export default function DiagNoticias({ data }: any) {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Diagnóstico - Notícias</h1>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const diagnostics: any = {
        timestamp: new Date().toISOString(),
        queriesExecuted: [],
        errors: [],
    }

    try {
        const supabase = createServerSupabaseClient(ctx)

        // Test 1: Count total
        try {
            const { count, error: countError } = await supabase
                .from('noticias')
                .select('*', { count: 'exact', head: true })

            diagnostics.queriesExecuted.push({
                name: 'Count total',
                success: !countError,
                count,
                error: countError?.message
            })

            if (countError) diagnostics.errors.push(countError.message)
        } catch (e: any) {
            diagnostics.errors.push(`Count query failed: ${e.message}`)
        }

        // Test 2: Fetch first 5
        try {
            const { data, error } = await supabase
                .from('noticias')
                .select('id, titulo, data, categoria, descricao')
                .order('created_at', { ascending: false })
                .limit(5)

            diagnostics.queriesExecuted.push({
                name: 'Fetch first 5',
                success: !error,
                rowCount: data?.length || 0,
                error: error?.message,
                sampleData: data
            })

            if (error) diagnostics.errors.push(error.message)
        } catch (e: any) {
            diagnostics.errors.push(`Fetch query failed: ${e.message}`)
        }

        // Test 3: Check for invalid data
        try {
            const { data, error } = await supabase
                .from('noticias')
                .select('id, titulo, categoria')
                .limit(50)

            const invalidRows = (data || []).filter((n: any) =>
                !n.id || !n.titulo || !n.categoria
            )

            diagnostics.queriesExecuted.push({
                name: 'Invalid data check',
                success: !error,
                totalChecked: data?.length || 0,
                invalidCount: invalidRows.length,
                invalidRows
            })

            if (invalidRows.length > 0) {
                diagnostics.errors.push(`Found ${invalidRows.length} rows with missing required fields`)
            }
        } catch (e: any) {
            diagnostics.errors.push(`Invalid data check failed: ${e.message}`)
        }

    } catch (error: any) {
        diagnostics.errors.push(`General error: ${error.message}`)
    }

    return {
        props: {
            data: diagnostics
        }
    }
}
