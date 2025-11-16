import React from 'react'
import Head from 'next/head'
import Header from '../../components/Header'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import UserLayout from '../../components/UserLayout'
import { GetServerSideProps } from 'next'
import { createServerSupabaseClient } from '../../lib/supabase'

interface Props { name?: string }

export default function MeusClassificadosPage({ name }: Props) {
  return (
    <>
      <Head><title>Meus Classificados - Portal Maria Helena</title></Head>
      <Header />
      <Nav />
      <UserLayout name={name}>
        <h1 className="text-2xl font-bold mb-4">Meus Classificados</h1>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">Em breve: gestão de anúncios</div>
      </UserLayout>
      <Footer />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { redirect: { destination: `/login?redirect=${encodeURIComponent('/area-usuario/meus-classificados')}`, permanent: false } }
  }
  const { data: profile } = await supabase.from('user_profiles').select('name').eq('id', session.user.id).single()
  return { props: { name: profile?.name || session.user.email || null } }
}