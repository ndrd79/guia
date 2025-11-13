import React from 'react'

interface SidebarCardProps {
  title: string
  children: React.ReactNode
}

export default function SidebarCard({ title, children }: SidebarCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      {children}
    </div>
  )
}
