import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const ContatoPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    phone: '',
    message: '',
    privacy: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    setFormData({
      name: '',
      email: '',
      subject: '',
      phone: '',
      message: '',
      privacy: false
    });
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      question: "Como posso anunciar no Portal Maria Helena?",
      answer: "Você pode anunciar no Portal Maria Helena entrando em contato com nossa equipe comercial através do telefone (44) 1234-5678 ou pelo e-mail comercial@portalmariahelena.com.br. Também oferecemos a opção de cadastro direto no site através do botão \"Anunciar\" no menu principal."
    },
    {
      question: "Quanto custa para anunciar no portal?",
      answer: "Os valores variam de acordo com o tipo de anúncio, tamanho e posicionamento. Temos opções para todos os orçamentos, desde classificados gratuitos até anúncios destacados. Entre em contato com nossa equipe comercial para receber uma proposta personalizada para o seu negócio."
    },
    {
      question: "Como faço para publicar um evento no calendário?",
      answer: "Para publicar um evento, você pode enviar as informações para o e-mail eventos@portalmariahelena.com.br com pelo menos 7 dias de antecedência. Inclua data, horário, local, descrição e uma imagem (se disponível). Eventos gratuitos têm prioridade de publicação."
    },
    {
      question: "Como posso reportar um problema técnico no site?",
      answer: "Caso encontre algum problema técnico, por favor entre em contato através do e-mail suporte@portalmariahelena.com.br ou pelo WhatsApp (44) 98765-4321. Descreva o problema com detalhes e, se possível, inclua capturas de tela para nos ajudar a resolver mais rapidamente."
    },
    {
      question: "Como faço para remover ou atualizar informações do meu negócio?",
      answer: "Para atualizar ou remover informações do seu negócio, envie um e-mail para comercial@portalmariahelena.com.br com os detalhes necessários. Se você possui cadastro no portal, pode acessar sua conta e fazer as alterações diretamente na área do anunciante."
    }
  ];

  const teamMembers = [
    {
      name: "João Silva",
      role: "Diretor Comercial",
      description: "Responsável pelas parcerias e anúncios no portal.",
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      name: "Maria Oliveira",
      role: "Editora Chefe",
      description: "Responsável pelo conteúdo e notícias do portal.",
      gradient: "from-blue-500 to-teal-400"
    },
    {
      name: "Carlos Mendes",
      role: "Desenvolvedor Web",
      description: "Responsável pela manutenção e desenvolvimento do portal.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      name: "Ana Souza",
      role: "Atendimento ao Cliente",
      description: "Responsável pelo suporte e atendimento aos usuários.",
      gradient: "from-orange-500 to-yellow-400"
    }
  ];

  return (
    <>
      <Head>
        <title>Contato - Portal Maria Helena</title>
        <meta name="description" content="Entre em contato com o Portal Maria Helena. Estamos aqui para ajudar!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Top Bar */}
      <div className="bg-indigo-900 text-white py-2 px-4 flex justify-between items-center text-sm">
        <div>
          <span className="hidden md:inline">Portal Oficial de Maria Helena - Conectando pessoas e negócios</span>
        </div>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-indigo-200"><i className="fas fa-user mr-1"></i> Área do Usuário</a>
          <a href="#" className="hover:text-indigo-200"><i className="fas fa-lock mr-1"></i> Painel Admin</a>
        </div>
      </div>

      {/* Header */}
      <header className="gradient-bg text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white rounded-full p-2 mr-4 pulse">
                <i className="fas fa-city text-indigo-600 text-3xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold neon-text">PORTAL MARIA HELENA</h1>
                <p className="text-indigo-100">Sua cidade em um só lugar</p>
              </div>
            </div>
            
            <div className="ad-space w-full md:w-1/3 h-24 rounded-lg mb-4 md:mb-0">
              [ESPAÇO PUBLICITÁRIO 1]
            </div>
            
            <div className="w-full md:w-1/4">
              <div className="relative">
                <input type="text" placeholder="Buscar no portal..." className="w-full py-2 px-4 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                <button className="absolute right-3 top-2 text-indigo-600">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-indigo-600 focus:outline-none"
              >
                <i className="fas fa-bars text-2xl"></i>
              </button>
            </div>
            <div className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-indigo-600 transition">Início</Link>
              <Link href="/guia" className="text-gray-600 hover:text-indigo-600 transition">Guia Comercial</Link>
              <Link href="/classificados" className="text-gray-600 hover:text-indigo-600 transition">Classificados</Link>
              <Link href="/eventos" className="text-gray-600 hover:text-indigo-600 transition">Eventos</Link>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition">Serviços</a>
              <Link href="/noticias" className="text-gray-600 hover:text-indigo-600 transition">Notícias</Link>
              <Link href="/contato" className="text-indigo-600 font-medium border-b-2 border-indigo-600 pb-1">Contato</Link>
            </div>
            <div>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition flex items-center">
                <i className="fas fa-plus-circle mr-2"></i> Anunciar
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t mt-2">
              <Link href="/" className="block py-2 text-gray-600">Início</Link>
              <Link href="/guia" className="block py-2 text-gray-600">Guia Comercial</Link>
              <Link href="/classificados" className="block py-2 text-gray-600">Classificados</Link>
              <Link href="/eventos" className="block py-2 text-gray-600">Eventos</Link>
              <a href="#" className="block py-2 text-gray-600">Serviços</a>
              <Link href="/noticias" className="block py-2 text-gray-600">Notícias</Link>
              <Link href="/contato" className="block py-2 text-indigo-600">Contato</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Page Header */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Fale Conosco</h1>
              <p className="text-xl text-gray-300">Estamos aqui para ajudar. Entre em contato conosco!</p>
            </div>
            <div className="mt-4 md:mt-0">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                  <li className="inline-flex items-center">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white">
                      <i className="fas fa-home mr-2"></i>
                      Início
                    </Link>
                  </li>
                  <li aria-current="page">
                    <div className="flex items-center">
                      <i className="fas fa-chevron-right text-gray-500 mx-2"></i>
                      <span className="text-sm font-medium text-white">Contato</span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Envie sua mensagem</h2>
                <p className="text-gray-600 mb-6">Preencha o formulário abaixo e entraremos em contato o mais breve possível.</p>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" 
                        required 
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Assunto *</label>
                    <select 
                      id="subject" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" 
                      required
                    >
                      <option value="">Selecione um assunto</option>
                      <option value="advertising">Publicidade e Anúncios</option>
                      <option value="support">Suporte Técnico</option>
                      <option value="suggestions">Sugestões</option>
                      <option value="complaints">Reclamações</option>
                      <option value="partnerships">Parcerias</option>
                      <option value="other">Outros</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" 
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensagem *</label>
                    <textarea 
                      id="message" 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5} 
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" 
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <input 
                      id="privacy" 
                      name="privacy"
                      type="checkbox" 
                      checked={formData.privacy}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" 
                      required 
                    />
                    <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                      Concordo com a <a href="#" className="text-indigo-600 hover:text-indigo-800">Política de Privacidade</a>
                    </label>
                  </div>
                  
                  <button type="submit" className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition font-medium">
                    <i className="fas fa-paper-plane mr-2"></i> Enviar Mensagem
                  </button>
                </form>
              </div>
            </div>
            
            {/* Contact Info */}
            <div>
              <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Informações de Contato</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="contact-icon">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-1">Endereço</h3>
                      <p className="text-gray-600">Rua Principal, 123 - Centro</p>
                      <p className="text-gray-600">Maria Helena - PR, 87480-000</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="contact-icon">
                      <i className="fas fa-phone-alt"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-1">Telefones</h3>
                      <p className="text-gray-600">(44) 1234-5678 (Comercial)</p>
                      <p className="text-gray-600">(44) 98765-4321 (WhatsApp)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="contact-icon">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-1">E-mails</h3>
                      <p className="text-gray-600">contato@portalmariahelena.com.br</p>
                      <p className="text-gray-600">comercial@portalmariahelena.com.br</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="contact-icon">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-1">Horário de Atendimento</h3>
                      <p className="text-gray-600">Segunda a Sexta: 8h às 18h</p>
                      <p className="text-gray-600">Sábado: 8h às 12h</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Map */}
              <div className="contact-map mt-8 mb-8" style={{height: '200px'}}>
                <div className="text-center p-4">
                  <i className="fas fa-map-marked-alt text-4xl text-gray-400 mb-2"></i>
                  <h3 className="text-lg font-bold text-gray-700 mb-1">Localização</h3>
                  <p className="text-gray-600 mb-2 text-sm">Veja onde estamos localizados</p>
                  <button className="bg-indigo-600 text-white px-4 py-1 rounded-lg hover:bg-indigo-700 transition text-sm">
                    <i className="fas fa-directions mr-1"></i> Ver no Mapa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
          
          <div className="max-w-4xl mx-auto">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-6 flex justify-between items-center focus:outline-none"
                >
                  <h3 className="font-medium text-lg text-gray-800">{faq.question}</h3>
                  <i className={`fas fa-chevron-down text-indigo-600 transition-transform duration-300 ${
                    openFaq === index ? 'transform rotate-180' : ''
                  }`}></i>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nossa Equipe</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden text-center card-hover">
                <div className={`h-64 bg-gradient-to-r ${member.gradient} flex items-center justify-center`}>
                  <i className="fas fa-user-circle text-white text-8xl"></i>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-1">{member.name}</h3>
                  <p className="text-indigo-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-4">{member.description}</p>
                  <div className="flex justify-center space-x-3">
                    <a href="#" className="text-gray-400 hover:text-indigo-600 transition"><i className="fab fa-whatsapp"></i></a>
                    <a href="#" className="text-gray-400 hover:text-indigo-600 transition"><i className="fab fa-linkedin"></i></a>
                    <a href="#" className="text-gray-400 hover:text-indigo-600 transition"><i className="fas fa-envelope"></i></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 gradient-bg text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Receba as novidades no seu e-mail</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Cadastre-se e receba promoções, eventos e notícias importantes da sua cidade.</p>
          
          <div className="max-w-md mx-auto flex">
            <input type="email" placeholder="Seu melhor e-mail" className="flex-grow py-3 px-4 rounded-l-lg focus:outline-none text-gray-800" />
            <button className="bg-indigo-900 hover:bg-indigo-800 py-3 px-6 rounded-r-lg font-medium transition">Cadastrar</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Portal Maria Helena</h3>
              <p className="mb-4">O guia completo da sua cidade, conectando pessoas, negócios e oportunidades.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-facebook-f"></i></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-instagram"></i></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-whatsapp"></i></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-youtube"></i></a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="hover:text-white transition">Início</Link></li>
                <li><Link href="/guia" className="hover:text-white transition">Guia Comercial</Link></li>
                <li><Link href="/classificados" className="hover:text-white transition">Classificados</Link></li>
                <li><Link href="/eventos" className="hover:text-white transition">Eventos</Link></li>
                <li><a href="#" className="hover:text-white transition">Serviços</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Informações</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-white transition">Anuncie Conosco</a></li>
                <li><a href="#" className="hover:text-white transition">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition">Política de Privacidade</a></li>
                <li><Link href="/contato" className="hover:text-white transition">Fale Conosco</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Contato</h3>
              <ul className="space-y-2">
                <li className="flex items-center"><i className="fas fa-map-marker-alt mr-2"></i> Rua Principal, 123 - Centro</li>
                <li className="flex items-center"><i className="fas fa-phone-alt mr-2"></i> (44) 1234-5678</li>
                <li className="flex items-center"><i className="fas fa-envelope mr-2"></i> contato@portalmariahelena.com.br</li>
                <li className="flex items-center"><i className="fas fa-clock mr-2"></i> Seg-Sex: 8h às 18h</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              &copy; 2023 Portal Maria Helena. Todos os direitos reservados.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white transition">Termos de Serviço</a>
              <a href="#" className="hover:text-white transition">Política de Privacidade</a>
              <a href="#" className="hover:text-white transition">Mapa do Site</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-indigo-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-indigo-700 transition flex items-center justify-center">
          <i className="fas fa-comment-dots text-2xl"></i>
        </button>
      </div>
    </>
  );
};

export default ContatoPage;