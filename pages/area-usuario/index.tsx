import React from 'react'
import Head from 'next/head'
import Header from '../../components/Header'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import UserLayout from '../../components/UserLayout'
import { GetServerSideProps } from 'next'
import { createServerSupabaseClient } from '../../lib/supabase'

interface Props {
  name?: string
}

export default function UserDashboard({ name }: Props) {
  return (
    <>
      <Head>
        <title>Minha Conta - Portal Maria Helena</title>
      </Head>
      <Header />
      <Nav />
      <UserLayout name={name}>
        <div className="space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bem-vindo{name ? `, ${name}` : ''}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="font-semibold mb-1">Perfil</div>
              <div className="text-gray-600 text-sm">Gerencie seus dados</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="font-semibold mb-1">Favoritos</div>
              <div className="text-gray-600 text-sm">Empresas e notícias salvas</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="font-semibold mb-1">Configurações</div>
              <div className="text-gray-600 text-sm">Preferências da conta</div>
            </div>
          </div>
        </div>
      </UserLayout>
      <Footer />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return {
      redirect: {
        destination: `/login?redirect=${encodeURIComponent('/area-usuario')}`,
        permanent: false,
      },
    }
  }
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('name')
    .eq('id', session.user.id)
    .single()
  return { props: { name: profile?.name || session.user.email || null } }
}