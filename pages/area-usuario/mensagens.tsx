import React from 'react'
import Head from 'next/head'
import Header from '../../components/Header'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import UserLayout from '../../components/UserLayout'
import { GetServerSideProps } from 'next'
import { createServerSupabaseClient } from '../../lib/supabase'

interface Props { name?: string }

export default function MensagensPage({ name }: Props) {
  return (
    <>
      <Head><title>Mensagens - Portal Maria Helena</title></Head>
      <Header />
      <Nav />
      <UserLayout name={name}>
        <h1 className="text-2xl font-bold mb-4">Mensagens</h1>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">Em breve: conversas sobre anúncios</div>
      </UserLayout>
      <Footer />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { redirect: { destination: `/login?redirect=${encodeURIComponent('/area-usuario/mensagens')}`, permanent: false } }
  }
  const { data: profile } = await supabase.from('user_profiles').select('name').eq('id', session.user.id).single()
  return { props: { name: profile?.name || session.user.email || null } }
}