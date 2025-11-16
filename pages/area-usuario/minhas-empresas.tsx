import React from 'react'
import Head from 'next/head'
import Header from '../../components/Header'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import UserLayout from '../../components/UserLayout'
import { GetServerSideProps } from 'next'
import { createServerSupabaseClient } from '../../lib/supabase'
import Link from 'next/link'

interface Props {
  name?: string
}

export default function MinhasEmpresasPage({ name }: Props) {
  return (
    <>
      <Head>
        <title>Minhas Empresas - Portal Maria Helena</title>
      </Head>
      <Header />
      <Nav />
      <UserLayout name={name}>
        <h1 className="text-2xl font-bold mb-4">Minhas Empresas</h1>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="text-gray-700 mb-3">Você ainda não possui empresas vinculadas.</div>
          <Link href="/anuncie" className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">Anunciar</Link>
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
      redirect: { destination: `/login?redirect=${encodeURIComponent('/area-usuario/minhas-empresas')}`, permanent: false },
    }
  }
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('name')
    .eq('id', session.user.id)
    .single()
  return { props: { name: profile?.name || session.user.email || null } }
}