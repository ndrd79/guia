import React from 'react'
import Head from 'next/head'
import Header from '../../components/Header'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import UserLayout from '../../components/UserLayout'
import { GetServerSideProps } from 'next'
import { createServerSupabaseClient } from '../../lib/supabase'

interface FavoriteItem {
  id: string
  item_type: 'noticia' | 'empresa' | 'evento' | 'classificado'
  item_id: string
  created_at?: string
}

interface Props {
  name?: string
  favorites: FavoriteItem[]
}

export default function FavoritosPage({ name, favorites }: Props) {
  return (
    <>
      <Head>
        <title>Favoritos - Portal Maria Helena</title>
      </Head>
      <Header />
      <Nav />
      <UserLayout name={name}>
        <h1 className="text-2xl font-bold mb-4">Favoritos</h1>
        {favorites && favorites.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((fav) => (
              <div key={fav.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-2">{fav.item_type}</div>
                <div className="font-semibold">Item #{fav.item_id}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="text-gray-700">Você ainda não possui favoritos.</div>
          </div>
        )}
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
      redirect: { destination: `/login?redirect=${encodeURIComponent('/area-usuario/favoritos')}`, permanent: false },
    }
  }
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('name')
    .eq('id', session.user.id)
    .single()
  let favorites: FavoriteItem[] = []
  const { data, error } = await supabase
    .from('user_favorites')
    .select('id,item_type,item_id,created_at')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
  if (!error && Array.isArray(data)) favorites = data as any
  return { props: { name: profile?.name || session.user.email || null, favorites } }
}