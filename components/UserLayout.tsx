import React from 'react'
import Link from 'next/link'

interface UserLayoutProps {
  name?: string
  children: React.ReactNode
}

export default function UserLayout({ name, children }: UserLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold mr-3">
              {name ? name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="font-semibold text-gray-900">{name || 'Usuário'}</div>
          </div>
          <nav className="space-y-2">
            <Link href="/area-usuario" className="block px-3 py-2 rounded-lg hover:bg-gray-50">Dashboard</Link>
            <Link href="/area-usuario/perfil" className="block px-3 py-2 rounded-lg hover:bg-gray-50">Perfil</Link>
            <Link href="/area-usuario/favoritos" className="block px-3 py-2 rounded-lg hover:bg-gray-50">Favoritos</Link>
            <Link href="/area-usuario/minhas-empresas" className="block px-3 py-2 rounded-lg hover:bg-gray-50">Minhas Empresas</Link>
            <Link href="/area-usuario/configuracoes" className="block px-3 py-2 rounded-lg hover:bg-gray-50">Configurações</Link>
          </nav>
        </aside>
        <main className="lg:col-span-3">
          {children}
        </main>
      </div>
    </div>
  )
}