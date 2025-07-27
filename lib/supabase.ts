import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para uso no browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para uso no servidor (SSR) - apenas para getServerSideProps
export const createServerSupabaseClient = () => {
  // Para pages router, usamos o cliente simples
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Cliente para uso no browser (componentes)
export const createBrowserSupabaseClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Cliente para middleware
export const createMiddlewareSupabaseClient = (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  return { supabase, response }
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
  ativo: boolean
  created_at: string
  updated_at: string
}