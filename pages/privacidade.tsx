import { NextPage } from 'next';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PoliticaPrivacidade: NextPage = () => {
  return (
    <>
      <Head>
        <title>Política de Privacidade - Guia Comercial</title>
        <meta name="description" content="Política de Privacidade do Guia Comercial - Como coletamos, usamos e protegemos seus dados pessoais" />
        <meta name="robots" content="index, follow" />
      </Head>

      <Header />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Política de Privacidade
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  1. Informações Gerais
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  O Guia Comercial está comprometido com a proteção da privacidade e dos dados pessoais 
                  de nossos usuários. Esta Política de Privacidade descreve como coletamos, usamos, 
                  armazenamos e protegemos suas informações pessoais em conformidade com a 
                  Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  2. Dados Coletados
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Coletamos as seguintes categorias de dados pessoais:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li><strong>Dados de identificação:</strong> nome, e-mail, telefone</li>
                  <li><strong>Dados de navegação:</strong> endereço IP, tipo de navegador, páginas visitadas</li>
                  <li><strong>Dados de localização:</strong> cidade, estado (quando fornecidos voluntariamente)</li>
                  <li><strong>Dados de empresas:</strong> informações comerciais cadastradas no diretório</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  3. Finalidade do Tratamento
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Utilizamos seus dados pessoais para:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Fornecer e melhorar nossos serviços</li>
                  <li>Personalizar sua experiência no site</li>
                  <li>Enviar comunicações relevantes sobre empresas e eventos locais</li>
                  <li>Realizar análises estatísticas e melhorias no site</li>
                  <li>Cumprir obrigações legais e regulamentares</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  4. Uso de Cookies
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Utilizamos cookies e tecnologias similares para:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li><strong>Cookies essenciais:</strong> necessários para o funcionamento básico do site</li>
                  <li><strong>Cookies de performance:</strong> para análise de tráfego e melhorias (Google Analytics)</li>
                  <li><strong>Cookies de funcionalidade:</strong> para lembrar suas preferências</li>
                  <li><strong>Cookies de marketing:</strong> para personalização de conteúdo e publicidade</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Você pode gerenciar suas preferências de cookies através do banner de consentimento 
                  ou acessando as configurações do seu navegador.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  5. Compartilhamento de Dados
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, 
                  exceto nas seguintes situações:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Com seu consentimento explícito</li>
                  <li>Para cumprimento de obrigações legais</li>
                  <li>Com prestadores de serviços que nos auxiliam na operação do site</li>
                  <li>Em caso de fusão, aquisição ou venda de ativos</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  6. Seus Direitos
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Conforme a LGPD, você tem os seguintes direitos:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Confirmação da existência de tratamento de dados</li>
                  <li>Acesso aos seus dados pessoais</li>
                  <li>Correção de dados incompletos, inexatos ou desatualizados</li>
                  <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
                  <li>Portabilidade dos dados</li>
                  <li>Eliminação dos dados tratados com consentimento</li>
                  <li>Revogação do consentimento</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  7. Segurança dos Dados
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Implementamos medidas técnicas e organizacionais adequadas para proteger 
                  seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição, 
                  incluindo:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Criptografia de dados em trânsito e em repouso</li>
                  <li>Controles de acesso rigorosos</li>
                  <li>Monitoramento contínuo de segurança</li>
                  <li>Treinamento regular da equipe</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  8. Retenção de Dados
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir 
                  as finalidades descritas nesta política, respeitando os prazos legais de retenção 
                  e os princípios da LGPD.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  9. Contato
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Para exercer seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade, 
                  entre em contato conosco:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>E-mail:</strong> privacidade@guiacomercial.com.br<br />
                    <strong>Telefone:</strong> (XX) XXXX-XXXX<br />
                    <strong>Endereço:</strong> [Endereço da empresa]
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  10. Alterações nesta Política
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Esta Política de Privacidade pode ser atualizada periodicamente. 
                  Notificaremos sobre mudanças significativas através do site ou por e-mail. 
                  Recomendamos que você revise esta política regularmente.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PoliticaPrivacidade;