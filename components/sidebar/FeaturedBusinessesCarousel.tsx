import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SidebarCard from './SidebarCard'

interface Item {
  id: string
  nome: string
  categoria?: string | null
  logo?: string | null
}

export default function FeaturedBusinessesCarousel({ items = [] }: { items: Item[] }) {
  const [index, setIndex] = useState(0)
  const timerRef = useRef<number | null>(null)
  const data = useMemo(() => {
    const src = Array.isArray(items) && items.length > 0 
      ? items.slice(0, 10) 
      : [
          { id: 'demo-1', nome: 'Empresa Exemplo A', categoria: 'Serviços', logo: null },
          { id: 'demo-2', nome: 'Empresa Exemplo B', categoria: 'Comércio', logo: null },
          { id: 'demo-3', nome: 'Empresa Exemplo C', categoria: 'Alimentos', logo: null }
        ]
    return src
  }, [items])
  useEffect(() => {
    if (data.length <= 1) return
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = window.setInterval(() => {
      setIndex(i => (i + 1) % data.length)
    }, 5000)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [data.length])
  if (!data.length) return null
  const current = data[index]
  return (
    <SidebarCard title="Empresas em Destaque">
      <div className="relative overflow-hidden rounded-lg">
        <Link href={`/guia-comercial/${current.id}`} className="block group">
          <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100">
            {current.logo ? (
              <Image src={current.logo} alt={current.nome} fill className="object-contain p-4" sizes="(max-width: 768px) 100vw, 300px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">Logo</div>
            )}
          </div>
          <div className="mt-3">
            <div className="font-semibold text-base group-hover:text-indigo-600 line-clamp-2">{current.nome}</div>
            {current.categoria ? (
              <div className="text-sm text-gray-500 mt-1">{current.categoria}</div>
            ) : null}
          </div>
        </Link>
        {data.length > 1 && (
          <div className="mt-3 flex justify-center gap-2">
            {data.map((_, i) => (
              <button
                key={i}
                aria-label={`Slide ${i + 1}`}
                className={`h-2 w-2 rounded-full ${i === index ? 'bg-indigo-600' : 'bg-gray-300'}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}
      </div>
    </SidebarCard>
  )
}
