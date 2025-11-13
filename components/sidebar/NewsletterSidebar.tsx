import React, { useState } from 'react'
import SidebarCard from './SidebarCard'

export default function NewsletterSidebar() {
  const [email, setEmail] = useState('')
  const onSubmit = () => {}
  return (
    <SidebarCard title="Receba nossas notícias">
      <p className="text-sm text-gray-600 mb-3">Cadastre-se e receba as principais notícias no seu e-mail.</p>
      <div className="flex">
        <input
          type="email"
          placeholder="Seu e-mail"
          className="flex-grow py-2 px-3 rounded-l-lg border border-gray-200 text-gray-800 focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={onSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-r-lg font-medium">OK</button>
      </div>
    </SidebarCard>
  )
}
