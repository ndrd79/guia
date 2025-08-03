import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { GetServerSidePropsContext } from 'next'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente principal do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para uso no servidor (SSR)
export function createServerSupabaseClient(ctx?: GetServerSidePropsContext) {
  if (!ctx) {
    // Retorna cliente simples quando não há contexto
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return ctx.req.cookies[name]
        },
        set(name: string, value: string, options: any) {
          ctx.res.setHeader('Set-Cookie', `${name}=${value}; ${Object.entries(options).map(([k, v]) => `${k}=${v}`).join('; ')}`)
        },
        remove(name: string, options: any) {
          ctx.res.setHeader('Set-Cookie', `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${Object.entries(options).map(([k, v]) => `${k}=${v}`).join('; ')}`)
        },
      },
    }
  )
}

// Tipos para as tabelas do banco
export interface Noticia {
  id: string
  titulo: string
  categoria: string
  data: string
  imagem?: string
  descricao: string
  conteudo: string
  banner_id?: string
  destaque?: boolean
  created_at: string
  updated_at: string
}

export interface Classificado {
  id: string
  titulo: string
  categoria: string
  preco: number
  imagem?: string
  localizacao: string
  descricao: string
  created_at: string
  updated_at: string
}

export interface Evento {
  id: string
  titulo: string
  tipo: string
  data_hora: string
  local: string
  imagem: string
  descricao: string
  created_at: string
  updated_at: string
}

export interface Banner {
  id: string
  nome: string
  posicao: string
  imagem: string
  link?: string
  largura?: number
  altura?: number
  ativo: boolean
  created_at: string
  updated_at: string
}