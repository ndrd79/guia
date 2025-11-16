import React, { useState } from 'react'
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

export default function ConfiguracoesPage({ name }: Props) {
  const [newsletter, setNewsletter] = useState(false)
  const [notifications, setNotifications] = useState(false)
  return (
    <>
      <Head>
        <title>Configurações - Portal Maria Helena</title>
      </Head>
      <Header />
      <Nav />
      <UserLayout name={name}>
        <h1 className="text-2xl font-bold mb-4">Configurações</h1>
        <div className="bg-white border border-gray-200 rounded-xl p-4 max-w-xl">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-semibold">Receber newsletter</div>
              <div className="text-sm text-gray-600">Novidades e promoções por e-mail</div>
            </div>
            <input type="checkbox" checked={newsletter} onChange={() => setNewsletter(v => !v)} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-semibold">Avisos por WhatsApp</div>
              <div className="text-sm text-gray-600">Eventos e alertas importantes</div>
            </div>
            <input type="checkbox" checked={notifications} onChange={() => setNotifications(v => !v)} />
          </div>
          <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Salvar (em breve)</button>
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
      redirect: { destination: `/login?redirect=${encodeURIComponent('/area-usuario/configuracoes')}`, permanent: false },
    }
  }
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('name')
    .eq('id', session.user.id)
    .single()
  return { props: { name: profile?.name || session.user.email || null } }
}