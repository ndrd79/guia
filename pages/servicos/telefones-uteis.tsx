import React from 'react';
import Head from 'next/head';
import Header from '../../components/Header';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

interface Contact {
  name: string;
  phone: string;
  whatsapp?: string;
}

interface ContactCategory {
  title: string;
  contacts: Contact[];
}

const TelefonesUteis: React.FC = () => {
  const contactCategories: ContactCategory[] = [
    {
      title: "Órgãos Públicos e Instituições",
      contacts: [
        { name: "Prefeitura Municipal de Maria Helena", phone: "(44) 3662-1030" },
        { name: "Câmara Municipal de Maria Helena", phone: "(44) 3662-1212" },
        { name: "Biblioteca Cidadã", phone: "(44) 3662-1795" },
        { name: "Centro de Educação Menino Jesus", phone: "(44) 3662-1640" },
        { name: "Colégio Estadual Carbonera", phone: "(44) 3662-1146" },
        { name: "Colégio Estadual Prof. Leonídia Pacheco", phone: "(44) 3662-1335" },
        { name: "Escola Municipal Ney Braga", phone: "(44) 3669-1182" },
        { name: "Escola Municipal Nossa Senhora das Graças", phone: "(44) 3662-1600" },
        { name: "Posto de Saúde Carbonera", phone: "(44) 3669-1121" }
      ]
    },
    {
      title: "Serviços de Assistência Social",
      contacts: [
        { name: "CRAS - Assistência Social", phone: "(44) 3662-1993" },
        { name: "CREAS", phone: "(44) 98428-2519", whatsapp: "(44) 3662-1341" },
        { name: "PETI", phone: "(44) 98455-7317" }
      ]
    },
    {
      title: "Segurança e Saúde",
      contacts: [
        { name: "Conselho Tutelar", phone: "(44) 3662-1611", whatsapp: "(44) 98455-6830" },
        { name: "Polícia Militar (Emergência)", phone: "190" },
        { name: "Polícia Militar (WhatsApp)", phone: "(44) 92001-9981" },
        { name: "Pronto Atendimento (PA)", phone: "(44) 3662-1034" },
        { name: "Unidade Básica de Saúde (UBS)", phone: "(44) 3662-1029" }
      ]
    },
    {
      title: "Secretarias Municipais",
      contacts: [
        { name: "Secretaria de Agricultura e Meio Ambiente", phone: "(44) 3662-1649" },
        { name: "Secretaria de Assistência Social", phone: "(44) 3662-1571" },
        { name: "Secretaria de Educação e Cultura", phone: "(44) 3662-1705" },
        { name: "Secretaria de Saúde", phone: "(44) 3662-1033" }
      ]
    },
    {
      title: "Outros Serviços",
      contacts: [
        { name: "Cartório de Maria Helena", phone: "(44) 3662-1477", whatsapp: "(9) 9862-0645" },
        { name: "Emater", phone: "(44) 3662-1225", whatsapp: "(44) 98419-6262" },
        { name: "QNET Maria Helena", phone: "2020-2020", whatsapp: "2031-0202" }
      ]
    },
    {
      title: "Autoridades Municipais",
      contacts: [
        { name: "Marlon Rancer (Prefeito)", phone: "(44) 99870-5599" },
        { name: "Juraci Françoso (Vice-Prefeito)", phone: "(44) 98432-2496" },
        { name: "Jhonatan (Transporte, Obras e Urbanismo)", phone: "(44) 98458-6980" },
        { name: "Paula (Secretária de Saúde)", phone: "(44) 98409-8752" },
        { name: "Júnior Bertoni (Secretário de Administração/Finanças)", phone: "(44) 98423-7578" },
        { name: "Marcia Santucci (Secretária de Educação)", phone: "(44) 98445-4045" },
        { name: "Cristiano Carmona (Secretário de Agricultura/Meio Ambiente)", phone: "(44) 98406-8703" },
        { name: "Eliana Portilho (Secretária de Assistência Social)", phone: "(44) 98438-2528" },
        { name: "Leandro Alves Monteiro (Secretário de Indústria e Comércio)", phone: "(44) 98435-7954" },
        { name: "Felipe Ouchita (Secretário de Esportes)", phone: "(44) 98456-7383" }
      ]
    },
    {
      title: "Contatos Específicos",
      contacts: [
        { name: "Willian (Coveiro)", phone: "(44) 98436-2500" },
        { name: "Wagner (Patrimônio Público)", phone: "(44) 98458-3227" },
        { name: "Paulo (Detran)", phone: "(44) 99906-0918" },
        { name: "Leandro (Tigrão) (Indústria e Comércio)", phone: "(44) 98435-7954" },
        { name: "Ouvidoria", phone: "(44) 3662-1795" }
      ]
    },
    {
      title: "Lista de Vereadores",
      contacts: [
        { name: "Ademilson de Oliveira Quental (PRD)", phone: "(44) 99930-4229" },
        { name: "Ana Laura de Oliveira Riguette (UNIÃO)", phone: "(44) 99841-72839" },
        { name: "Armystrong Luccas Messias Brunelli (PSD)", phone: "(44) 99900-5395" },
        { name: "Iuri Augusto de Alencar (UNIÃO)", phone: "(44) 98429-8285" },
        { name: "Jociane França Lopes Johansen (REP)", phone: "(44) 98429-5674" },
        { name: "Raul José Patusi (PL)", phone: "(44) 98433-0001" },
        { name: "Salvador Francisco (PRD)", phone: "(44) 98454-7290" },
        { name: "Simone Aparecida dos Santos Monteiro (PL)", phone: "(44) 98456-7901" },
        { name: "Vilmar Andrade de Lima (PSD)", phone: "(44) 98446-5364" }
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>Telefones Úteis - Portal Maria Helena</title>
        <meta name="description" content="Lista completa de telefones úteis de Maria Helena - Órgãos públicos, secretarias, autoridades e serviços essenciais." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header />
      <Nav />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header da página */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              <i className="fas fa-phone text-blue-600 mr-3"></i>
              Telefones Úteis
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Lista completa de contatos importantes de Maria Helena. Encontre rapidamente os telefones de órgãos públicos, 
              secretarias municipais, autoridades e serviços essenciais da cidade.
            </p>
          </div>

          {/* Lista de categorias */}
          <div className="grid gap-8">
            {contactCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-600 pb-2">
                  {category.title}
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.contacts.map((contact, contactIndex) => (
                    <div key={contactIndex} className="bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                      <h3 className="font-semibold text-gray-800 mb-2">{contact.name}</h3>
                      
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-600">
                          <i className="fas fa-phone text-blue-600 mr-2 w-4"></i>
                          <a 
                            href={`tel:${contact.phone.replace(/[^\d]/g, '')}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {contact.phone}
                          </a>
                        </div>
                        
                        {contact.whatsapp && (
                          <div className="flex items-center text-gray-600">
                            <i className="fab fa-whatsapp text-green-600 mr-2 w-4"></i>
                            <a 
                              href={`https://wa.me/${contact.whatsapp.replace(/[^\d]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-green-600 transition-colors"
                            >
                              {contact.whatsapp}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Informações adicionais */}
          <div className="mt-12 bg-blue-50 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                Informações Importantes
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Emergências</h4>
                  <p className="text-gray-600">
                    Para emergências, ligue sempre para <strong>190</strong> (Polícia Militar) 
                    ou <strong>193</strong> (Bombeiros).
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Horário de Atendimento</h4>
                  <p className="text-gray-600">
                    A maioria dos órgãos públicos funciona de segunda a sexta-feira, 
                    das 8h às 17h. Verifique horários específicos antes de se dirigir ao local.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Não encontrou o contato que procura? Entre em contato conosco!
            </p>
            <a 
              href="/contato" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-envelope mr-2"></i>
              Fale Conosco
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default TelefonesUteis;