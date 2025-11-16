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
  phone?: string
  whatsapp?: string
}

export default function PerfilPage({ name: initialName, phone: initialPhone, whatsapp: initialWhatsapp }: Props) {
  const [name, setName] = useState(initialName || '')
  const [phone, setPhone] = useState(initialPhone || '')
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp || '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (saving) return
    setSaving(true)
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, whatsapp })
    })
    setSaving(false)
  }

  return (
    <>
      <Head>
        <title>Perfil - Portal Maria Helena</title>
      </Head>
      <Header />
      <Nav />
      <UserLayout name={initialName}>
        <div className="max-w-xl">
          <h1 className="text-2xl font-bold mb-4">Perfil</h1>
          <div className="space-y-4 bg-white border border-gray-200 rounded-xl p-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input className="w-full border rounded-lg px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input className="w-full border rounded-lg px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp</label>
              <input className="w-full border rounded-lg px-3 py-2" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            </div>
            <button onClick={save} disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
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
        destination: `/login?redirect=${encodeURIComponent('/area-usuario/perfil')}`,
        permanent: false,
      },
    }
  }
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('name, phone, whatsapp')
    .eq('id', session.user.id)
    .single()
  return { props: { name: profile?.name || session.user.email || null, phone: profile?.phone || null, whatsapp: profile?.whatsapp || null } }
}