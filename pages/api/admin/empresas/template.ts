import { NextApiRequest, NextApiResponse } from 'next';
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verificar se usuário é admin
const checkAdminAuth = async (req: NextApiRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
};

// Buscar categorias existentes para incluir no template
const getExistingCategories = async () => {
  const { data: empresas } = await supabase
    .from('empresas')
    .select('category')
    .not('category', 'is', null);

  if (!empresas) return [];

  // Extrair categorias únicas
  const categoriesSet = new Set(empresas.map(e => e.category));
  const categories = Array.from(categoriesSet);
  return categories.sort();
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Headers CORS e de segurança
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // Verificar autenticação admin
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem baixar o template.' });
    }

    const format = req.query.format as string || 'xlsx';

    if (!['xlsx', 'csv'].includes(format)) {
      return res.status(400).json({ error: 'Formato deve ser xlsx ou csv' });
    }

    // Buscar categorias existentes
    const categories = await getExistingCategories();

    // Categorias do formulário noITA
    const noitaCategories = [
      'Alimentação', 'Saúde', 'Automotivo', 'Tecnologia', 'Moda', 
      'Pet Shop', 'Educação', 'Decoração', 'Comércio', 'Beleza', 'Esporte'
    ];

    // Dados do template baseados no formulário noITA
    const templateData = [
      {
        'Carimbo de data/hora': '11/3/2025 17:54:13',
        nome: 'noITA - Guia Comercial',
        categoria: 'Comércio',
        telefone: '3675-8325',
        Cidade: 'Itaperuçu',
        endereco: 'Av. Crispim Furquim de Siqueira, 678 - Centro',
        descricao: 'Guia Comercial da Cidade',
        whatsapp: '(41) 98502-1640',
        email: 'falecom@noita.com.br',
        website: 'www.noita.com.br',
        'horario_funcionamento (dias)': 'Seg a Sex',
        'horario_funcionamento (horário)': '9h às 18h',
        facebook: 'noitamidia',
        instagram: 'noitamidia',
        Maps: 'https://maps.app.goo.gl/cJ3AMMDkcuYTYoo88',
        user: 'noita'
      },
      {
        'Carimbo de data/hora': '11/3/2025 18:00:00',
        nome: 'Padaria Pão Dourado',
        categoria: 'Alimentação',
        telefone: '(41) 3675-1234',
        Cidade: 'Itaperuçu',
        endereco: 'Rua das Flores, 123 - Centro',
        descricao: 'Padaria tradicional com pães frescos e produtos artesanais',
        whatsapp: '(41) 99876-5432',
        email: 'contato@paodourado.com.br',
        website: 'www.paodourado.com.br',
        'horario_funcionamento (dias)': 'Seg a Sáb',
        'horario_funcionamento (horário)': '6h às 20h',
        facebook: 'paodourado',
        instagram: 'paodourado',
        Maps: 'https://maps.app.goo.gl/exemplo123',
        user: 'whitevision'
      },
      {
        'Carimbo de data/hora': '11/3/2025 18:15:00',
        nome: 'Clínica Saúde Total',
        categoria: 'Saúde',
        telefone: '(41) 3675-5678',
        Cidade: 'Rio Branco do Sul',
        endereco: 'Av. Principal, 456 - Centro',
        descricao: 'Clínica médica com atendimento especializado',
        whatsapp: '(41) 99123-4567',
        email: 'contato@saudetotal.com.br',
        website: 'www.saudetotal.com.br',
        'horario_funcionamento (dias)': 'Seg a Sex',
        'horario_funcionamento (horário)': '8h às 18h',
        facebook: 'saudetotal',
        instagram: 'saudetotal',
        Maps: 'https://maps.app.goo.gl/exemplo456',
        user: 'noita'
      }
    ];

    if (format === 'csv') {
      // Gerar CSV com cabeçalhos do formulário noITA
      const headers = [
        'Carimbo de data/hora',
        'nome',
        'categoria', 
        'telefone',
        'Cidade',
        'endereco',
        'descricao',
        'whatsapp',
        'email',
        'website',
        'horario_funcionamento (dias)',
        'horario_funcionamento (horário)',
        'facebook',
        'instagram',
        'Maps',
        'user'
      ];

      let csvContent = headers.join(',') + '\n';
      
      templateData.forEach(row => {
        const values = headers.map(header => {
          const value = row[header as keyof typeof row] || '';
          // Escapar aspas duplas e envolver em aspas se contém vírgula
          const escaped = value.toString().replace(/"/g, '""');
          return escaped.includes(',') ? `"${escaped}"` : escaped;
        });
        csvContent += values.join(',') + '\n';
      });

      // Adicionar comentários baseados no formulário noITA
      csvContent += '\n# INSTRUÇÕES BASEADAS NO FORMULÁRIO noITA:\n';
      csvContent += '# CAMPOS OBRIGATÓRIOS:\n';
      csvContent += '# - Nome: obrigatório, máximo 100 caracteres\n';
      csvContent += '# - Categoria: obrigatória, escolha uma das categorias disponíveis\n';
      csvContent += '# - Telefone: obrigatório, aceita 8, 10 ou 11 dígitos (ex: 3675-8325 ou (41) 98502-1640)\n';
      csvContent += '# - Endereço: obrigatório, máximo 200 caracteres\n';
      csvContent += '# - Descrição: obrigatória (pode usar "Pegar bio do Instagram" se aplicável)\n';
      csvContent += '# - WhatsApp: obrigatório, formato (41) 98502-1640\n';
      csvContent += '# \n';
      csvContent += '# CAMPOS OPCIONAIS:\n';
      csvContent += '# - Cidade: opcional (Itaperuçu, Rio Branco do Sul)\n';
      csvContent += '# - Email: opcional, deve ser um email válido\n';
      csvContent += '# - Website: opcional, URL válida (com ou sem protocolo)\n';
      csvContent += '# - Horário funcionamento (dias): opcional (ex: "Seg a Sáb", "Seg a Sex", "Seg a Dom")\n';
      csvContent += '# - Horário funcionamento (horário): opcional (ex: "8h às 18h", "9h às 18h", "08h às 17h")\n';
      csvContent += '# - Facebook: opcional, nome do perfil (ex: noitamidia)\n';
      csvContent += '# - Instagram: opcional, nome do perfil (ex: noitamidia)\n';
      csvContent += '# - Maps: opcional, link do Google Maps\n';
      csvContent += '# - User: opcional (noita, whitevision)\n';
      csvContent += '# \n';
      csvContent += `# CATEGORIAS DISPONÍVEIS: ${noitaCategories.join(', ')}\n`;

      const csvWithBom = '\ufeff' + csvContent; // BOM para UTF-8
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="template_importacao_empresas.csv"');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Content-Length', Buffer.byteLength(csvWithBom, 'utf8').toString());
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'");
      res.setHeader('X-Frame-Options', 'DENY');
      
      // Forçar o download imediatamente
      res.writeHead(200);
      res.end(csvWithBom);

    } else {
      // Gerar Excel
      const workbook = XLSX.utils.book_new();

      // Aba principal com dados
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      
      // Definir larguras das colunas
      const columnWidths = [
        { wch: 20 }, // Carimbo de data/hora
        { wch: 25 }, // nome
        { wch: 15 }, // categoria
        { wch: 15 }, // telefone
        { wch: 15 }, // Cidade
        { wch: 30 }, // endereco
        { wch: 40 }, // descricao
        { wch: 25 }, // email
        { wch: 25 }, // website
        { wch: 15 }, // whatsapp
        { wch: 20 }, // horario_funcionamento (dias)
        { wch: 20 }, // horario_funcionamento (horário)
        { wch: 15 }, // facebook
        { wch: 15 }, // instagram
        { wch: 35 }, // Maps
        { wch: 15 }  // user
      ];
      worksheet['!cols'] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Empresas');

      // Aba de instruções baseadas no formulário noITA
      const instructions = [
        { Campo: 'Carimbo de data/hora', Obrigatório: 'AUTO', Formato: 'DD/MM/AAAA HH:MM:SS', Exemplo: '11/3/2025 17:54:13' },
        { Campo: 'nome', Obrigatório: 'SIM', Formato: 'Texto até 100 caracteres', Exemplo: 'noITA - Guia Comercial' },
        { Campo: 'categoria', Obrigatório: 'SIM', Formato: 'Uma das categorias disponíveis', Exemplo: 'Comércio' },
        { Campo: 'telefone', Obrigatório: 'SIM', Formato: '8, 10 ou 11 dígitos', Exemplo: '3675-8325 ou (41) 98502-1640' },
        { Campo: 'Cidade', Obrigatório: 'NÃO', Formato: 'Itaperuçu ou Rio Branco do Sul', Exemplo: 'Itaperuçu' },
        { Campo: 'endereco', Obrigatório: 'SIM', Formato: 'Texto até 200 caracteres', Exemplo: 'Av. Crispim Furquim, 678 - Centro' },
        { Campo: 'descricao', Obrigatório: 'SIM', Formato: 'Texto ou "Pegar bio do Instagram"', Exemplo: 'Guia Comercial da Cidade' },
        { Campo: 'whatsapp', Obrigatório: 'SIM', Formato: 'Formato (41) 98502-1640', Exemplo: '(41) 98502-1640' },
        { Campo: 'email', Obrigatório: 'NÃO', Formato: 'Email válido', Exemplo: 'falecom@noita.com.br' },
        { Campo: 'website', Obrigatório: 'NÃO', Formato: 'URL válida (com ou sem protocolo)', Exemplo: 'www.noita.com.br' },
        { Campo: 'horario_funcionamento (dias)', Obrigatório: 'NÃO', Formato: 'Seg a Sáb, Seg a Sex, Seg a Dom', Exemplo: 'Seg a Sex' },
        { Campo: 'horario_funcionamento (horário)', Obrigatório: 'NÃO', Formato: '8h às 18h, 9h às 18h, 08h às 17h', Exemplo: '9h às 18h' },
        { Campo: 'facebook', Obrigatório: 'NÃO', Formato: 'Nome do perfil', Exemplo: 'noitamidia' },
        { Campo: 'instagram', Obrigatório: 'NÃO', Formato: 'Nome do perfil', Exemplo: 'noitamidia' },
        { Campo: 'Maps', Obrigatório: 'NÃO', Formato: 'Link do Google Maps', Exemplo: 'https://maps.app.goo.gl/cJ3AMMDkcuYTYoo88' },
        { Campo: 'user', Obrigatório: 'NÃO', Formato: 'noita ou whitevision', Exemplo: 'noita' }
      ];

      const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
      instructionsSheet['!cols'] = [
        { wch: 20 },
        { wch: 12 },
        { wch: 25 },
        { wch: 30 }
      ];
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instruções');

      // Aba de categorias do formulário noITA
      const categoriesData = noitaCategories.map(cat => ({ Categoria: cat }));
      const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData);
      categoriesSheet['!cols'] = [{ wch: 25 }];
      XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Categorias noITA');

      // Gerar buffer do Excel
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Headers mais robustos para forçar download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="template_importacao_empresas.xlsx"');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Content-Length', excelBuffer.length.toString());
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'");
      res.setHeader('X-Frame-Options', 'DENY');
      
      // Forçar o download imediatamente
      res.writeHead(200);
      res.end(excelBuffer);
    }

  } catch (error) {
    console.error('Erro ao gerar template:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao gerar template',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}