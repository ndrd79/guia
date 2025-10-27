import React from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const TermosPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Termos de Serviço - Portal Maria Helena</title>
        <meta name="description" content="Termos de serviço e condições de uso do Portal Maria Helena" />
      </Head>
      
      <Header />
      <Nav />
      
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
              Termos de Serviço
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                <strong>Última atualização:</strong> Janeiro de 2025
              </p>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Aceitação dos Termos</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Ao acessar e usar o Portal Maria Helena, você concorda em cumprir e estar vinculado a estes Termos de Serviço. Se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Descrição do Serviço</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  O Portal Maria Helena é uma plataforma digital que oferece:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Guia comercial local</li>
                  <li>Classificados</li>
                  <li>Notícias e eventos da cidade</li>
                  <li>Serviços de utilidade pública</li>
                  <li>Espaço para anúncios de empresas locais</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Cadastro e Conta de Usuário</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Para utilizar certas funcionalidades do portal, você pode precisar criar uma conta. Você é responsável por:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Manter a confidencialidade de sua senha</li>
                  <li>Fornecer informações precisas e atualizadas</li>
                  <li>Notificar-nos imediatamente sobre uso não autorizado de sua conta</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Uso Aceitável</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Você concorda em não usar o portal para:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Publicar conteúdo ilegal, ofensivo ou inadequado</li>
                  <li>Violar direitos de propriedade intelectual</li>
                  <li>Enviar spam ou conteúdo não solicitado</li>
                  <li>Interferir no funcionamento do sistema</li>
                  <li>Usar o serviço para fins comerciais não autorizados</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Conteúdo do Usuário</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Ao publicar conteúdo em nosso portal, você:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Mantém a propriedade de seu conteúdo</li>
                  <li>Concede-nos licença para usar, exibir e distribuir o conteúdo</li>
                  <li>Garante que possui os direitos necessários sobre o conteúdo</li>
                  <li>Assume responsabilidade pelo conteúdo publicado</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Anúncios e Serviços Pagos</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Para anúncios pagos e serviços premium:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Os preços estão sujeitos a alterações</li>
                  <li>O pagamento deve ser feito conforme acordado</li>
                  <li>Cancelamentos devem seguir nossa política específica</li>
                  <li>Não garantimos resultados específicos dos anúncios</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Privacidade</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Sua privacidade é importante para nós. Consulte nossa <a href="/privacidade" className="text-indigo-600 hover:text-indigo-800">Política de Privacidade</a> para entender como coletamos, usamos e protegemos suas informações.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Limitação de Responsabilidade</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  O Portal Maria Helena não se responsabiliza por:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Danos diretos ou indiretos decorrentes do uso do portal</li>
                  <li>Conteúdo publicado por terceiros</li>
                  <li>Interrupções temporárias do serviço</li>
                  <li>Transações realizadas entre usuários</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Modificações dos Termos</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação. O uso continuado do portal após as modificações constitui aceitação dos novos termos.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Encerramento</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Podemos encerrar ou suspender sua conta e acesso ao portal a qualquer momento, sem aviso prévio, por violação destes termos ou por qualquer outro motivo.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Lei Aplicável</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida nos tribunais competentes de Maria Helena, PR.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Contato</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Para dúvidas sobre estes termos, entre em contato conosco:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700"><strong>E-mail:</strong> contato@portalmariahelena.com.br</p>
                  <p className="text-gray-700"><strong>WhatsApp:</strong> (44) 98435-5545</p>
                  <p className="text-gray-700"><strong>Endereço:</strong> Rua Piedade, 1385 - Maria Helena, PR</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default TermosPage;