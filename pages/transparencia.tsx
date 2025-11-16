import React from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function TransparenciaPage() {
  return (
    <>
      <Head>
        <title>Política de Transparência - Portal Maria Helena</title>
        <meta name="description" content="Política de Transparência do Portal Maria Helena" />
      </Head>

      <Header />
      <Nav />

      <main className="py-10 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Política de Transparência</h1>
          <p className="text-gray-600 mb-8">Compromisso com clareza, prestação de contas e acesso à informação.</p>

          <section className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Objetivo</h2>
            <p className="text-gray-700">Esta política estabelece diretrizes para divulgação de informações sobre gestão, conteúdos, publicidade e relacionamento com usuários e parceiros, assegurando transparência nas operações do Portal Maria Helena.</p>
          </section>

          <section className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Conteúdo e Critérios de Publicação</h2>
            <ul className="list-disc ml-5 text-gray-700 space-y-2">
              <li>Notícias publicadas seguem critérios editoriais de relevância local e verificação de fontes.</li>
              <li>Correções e atualizações são registradas no conteúdo com data de alteração.</li>
              <li>Conteúdos patrocinados são identificados claramente como publicidade.</li>
            </ul>
          </section>

          <section className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Publicidade e Parcerias</h2>
            <ul className="list-disc ml-5 text-gray-700 space-y-2">
              <li>Contratos de publicidade respeitam normas aplicáveis e não influenciam decisões editoriais.</li>
              <li>Materiais fornecidos por parceiros podem ser revisados para adequação às políticas do portal.</li>
              <li>Identificação de anúncios é realizada por meio de rótulos visuais e posicionamento dedicado.</li>
            </ul>
          </section>

          <section className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Governança e Responsabilidades</h2>
            <ul className="list-disc ml-5 text-gray-700 space-y-2">
              <li>A administração do portal é responsável por decisões estratégicas e pela conformidade legal.</li>
              <li>A equipe editorial responde pela apuração, edição e publicação das notícias.</li>
              <li>Registros de alterações importantes são mantidos para auditoria interna.</li>
            </ul>
          </section>

          <section className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Canal de Contato e Denúncias</h2>
            <p className="text-gray-700 mb-3">Para solicitações de informação, correções de conteúdo ou denúncias, utilize o canal oficial:</p>
            <ul className="list-disc ml-5 text-gray-700 space-y-2">
              <li>E-mail: contato@portalmariahelena.com.br</li>
              <li>WhatsApp: (44) 98435-5545</li>
              <li>Página: <a href="/contato" className="text-indigo-600 hover:text-indigo-800">Fale Conosco</a></li>
            </ul>
          </section>

          <section className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Atualizações desta Política</h2>
            <p className="text-gray-700">Esta política pode ser atualizada periodicamente para refletir aprimoramentos nos processos do portal. A data de última atualização será indicada nesta página.</p>
            <div className="text-sm text-gray-500 mt-3">Última atualização: {new Date().toLocaleDateString('pt-BR')}</div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}