import { NextApiRequest, NextApiResponse } from 'next';
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Buscar categorias existentes para incluir no template
const getExistingCategories = async () => {
  try {
    const { data: empresas } = await supabase
      .from('empresas')
      .select('categoria')
      .not('categoria', 'is', null);

    if (!empresas) return ['Alimentação', 'Saúde', 'Serviços', 'Comércio'];

    // Extrair categorias únicas
    const categories = [...new Set(empresas.map(e => e.categoria))];
    return categories.sort();
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return ['Alimentação', 'Saúde', 'Serviços', 'Comércio'];
  }
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
    const format = req.query.format as string || 'xlsx';

    if (!['xlsx', 'csv'].includes(format)) {
      return res.status(400).json({ error: 'Formato deve ser xlsx ou csv' });
    }

    // Buscar categorias existentes
    const categories = await getExistingCategories();

    // Dados do template com exemplos
    const templateData = [
      {
        nome: 'Exemplo Padaria do João',
        categoria: categories[0] || 'Alimentação',
        telefone: '(11) 99999-9999',
        endereco: 'Rua das Flores, 123 - Centro',
        descricao: 'Padaria tradicional com pães frescos e produtos artesanais',
        email: 'contato@padariajao.com.br',
        website: 'https://www.padariajao.com.br',
        whatsapp: '(11) 99999-9999',
        horario_funcionamento: 'Segunda a Sábado: 6h às 20h',
        imagem: 'https://exemplo.com/imagem-padaria.jpg'
      },
      {
        nome: 'Exemplo Farmácia Central',
        categoria: categories[1] || 'Saúde',
        telefone: '(11) 88888-8888',
        endereco: 'Av. Principal, 456 - Centro',
        descricao: 'Farmácia completa com medicamentos e produtos de higiene',
        email: 'farmacia@central.com.br',
        website: 'https://www.farmaciacentral.com.br',
        whatsapp: '(11) 88888-8888',
        horario_funcionamento: 'Segunda a Domingo: 7h às 22h',
        imagem: 'https://exemplo.com/imagem-farmacia.jpg'
      }
    ];

    if (format === 'csv') {
      // Gerar CSV
      const headers = [
        'nome',
        'categoria', 
        'telefone',
        'endereco',
        'descricao',
        'email',
        'website',
        'whatsapp',
        'horario_funcionamento',
        'imagem'
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

      // Adicionar comentários no final
      csvContent += '\n# INSTRUÇÕES:\n';
      csvContent += '# - Nome: obrigatório, máximo 100 caracteres\n';
      csvContent += '# - Categoria: obrigatória, use uma categoria existente\n';
      csvContent += '# - Telefone: obrigatório, formato (11) 99999-9999\n';
      csvContent += '# - Endereço: obrigatório, máximo 200 caracteres\n';
      csvContent += '# - Descrição: obrigatória, máximo 500 caracteres\n';
      csvContent += '# - Email: opcional, deve ser um email válido\n';
      csvContent += '# - Website: opcional, deve ser uma URL válida\n';
      csvContent += '# - WhatsApp: opcional, formato (11) 99999-9999\n';
      csvContent += '# - Horário: opcional, máximo 100 caracteres\n';
      csvContent += '# - Imagem: opcional, deve ser uma URL válida\n';
      csvContent += `# - Categorias existentes: ${categories.join(', ')}\n`;

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
        { wch: 25 }, // nome
        { wch: 15 }, // categoria
        { wch: 15 }, // telefone
        { wch: 30 }, // endereco
        { wch: 40 }, // descricao
        { wch: 25 }, // email
        { wch: 25 }, // website
        { wch: 15 }, // whatsapp
        { wch: 25 }, // horario_funcionamento
        { wch: 30 }  // imagem
      ];
      worksheet['!cols'] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Empresas');

      // Aba de instruções
      const instructions = [
        { Campo: 'nome', Obrigatório: 'SIM', Formato: 'Texto até 100 caracteres', Exemplo: 'Padaria do João' },
        { Campo: 'categoria', Obrigatório: 'SIM', Formato: 'Texto', Exemplo: 'Alimentação' },
        { Campo: 'telefone', Obrigatório: 'SIM', Formato: '(11) 99999-9999', Exemplo: '(11) 99999-9999' },
        { Campo: 'endereco', Obrigatório: 'SIM', Formato: 'Texto até 200 caracteres', Exemplo: 'Rua das Flores, 123' },
        { Campo: 'descricao', Obrigatório: 'SIM', Formato: 'Texto até 500 caracteres', Exemplo: 'Padaria tradicional...' },
        { Campo: 'email', Obrigatório: 'NÃO', Formato: 'Email válido', Exemplo: 'contato@empresa.com' },
        { Campo: 'website', Obrigatório: 'NÃO', Formato: 'URL válida', Exemplo: 'https://www.empresa.com' },
        { Campo: 'whatsapp', Obrigatório: 'NÃO', Formato: '(11) 99999-9999', Exemplo: '(11) 99999-9999' },
        { Campo: 'horario_funcionamento', Obrigatório: 'NÃO', Formato: 'Texto até 100 caracteres', Exemplo: 'Seg a Sáb: 8h às 18h' },
        { Campo: 'imagem', Obrigatório: 'NÃO', Formato: 'URL válida', Exemplo: 'https://exemplo.com/foto.jpg' }
      ];

      const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
      instructionsSheet['!cols'] = [
        { wch: 20 },
        { wch: 12 },
        { wch: 25 },
        { wch: 30 }
      ];
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instruções');

      // Aba de categorias existentes
      const categoriesData = categories.map(cat => ({ Categoria: cat }));
      if (categoriesData.length > 0) {
        const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData);
        categoriesSheet['!cols'] = [{ wch: 25 }];
        XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Categorias Existentes');
      }

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
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}