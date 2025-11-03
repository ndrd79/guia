import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ParsedEmpresa {
  nome: string;
  categoria: string;
  telefone: string;
  endereco: string;
  descricao: string;
  email?: string;
  website?: string;
  whatsapp?: string;
  horario_funcionamento?: string;
  imagem?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  _rowNumber: number;
}

// Função para processar arquivo Excel
const parseExcelFile = (buffer: Buffer): ParsedEmpresa[] => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  return data.map((row: any, index: number) => ({
    nome: row.nome || row.Nome || row.NOME || '',
    categoria: row.categoria || row.Categoria || row.CATEGORIA || '',
    telefone: row.telefone || row.Telefone || row.TELEFONE || '',
    endereco: row.endereco || row.Endereco || row.ENDERECO || '',
    descricao: row.descricao || row.Descricao || row.DESCRICAO || '',
    email: row.email || row.Email || row.EMAIL || '',
    website: row.website || row.Website || row.WEBSITE || '',
    whatsapp: row.whatsapp || row.WhatsApp || row.WHATSAPP || '',
    horario_funcionamento: row.horario_funcionamento || row['Horário de Funcionamento'] || '',
    imagem: row.imagem || row.Imagem || row.IMAGEM || '',
    facebook: row.facebook || row.Facebook || row.FACEBOOK || '',
    instagram: row.instagram || row.Instagram || row.INSTAGRAM || '',
    linkedin: row.linkedin || row.LinkedIn || row.LINKEDIN || '',
    twitter: row.twitter || row.Twitter || row.TWITTER || '',
    _rowNumber: index + 2 // +2 porque linha 1 é header
  }));
};

// Função para processar arquivo CSV
const parseCSVFile = (buffer: Buffer): Promise<ParsedEmpresa[]> => {
  return new Promise((resolve, reject) => {
    const csvString = buffer.toString('utf-8');
    
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row: any, index: number) => ({
          nome: row.nome || row.Nome || row.NOME || '',
          categoria: row.categoria || row.Categoria || row.CATEGORIA || '',
          telefone: row.telefone || row.Telefone || row.TELEFONE || '',
          endereco: row.endereco || row.Endereco || row.ENDERECO || '',
          descricao: row.descricao || row.Descricao || row.DESCRICAO || '',
          email: row.email || row.Email || row.EMAIL || '',
          website: row.website || row.Website || row.WEBSITE || '',
          whatsapp: row.whatsapp || row.WhatsApp || row.WHATSAPP || '',
          horario_funcionamento: row.horario_funcionamento || row['Horário de Funcionamento'] || '',
          imagem: row.imagem || row.Imagem || row.IMAGEM || '',
          facebook: row.facebook || row.Facebook || row.FACEBOOK || '',
          instagram: row.instagram || row.Instagram || row.INSTAGRAM || '',
          linkedin: row.linkedin || row.LinkedIn || row.LINKEDIN || '',
          twitter: row.twitter || row.Twitter || row.TWITTER || '',
          _rowNumber: index + 2
        }));
        resolve(data);
      },
      error: reject
    });
  });
};

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Verificar autenticação admin
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem importar empresas.' });
    }

    // Parse do arquivo usando formidable
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filter: ({ mimetype }) => {
        return (
          mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          mimetype === 'application/vnd.ms-excel' ||
          mimetype === 'text/csv' ||
          mimetype === 'application/csv'
        );
      }
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    // Ler o arquivo
    const fs = require('fs');
    const buffer = fs.readFileSync(file.filepath);
    
    let parsedData: ParsedEmpresa[];
    const fileExtension = file.originalFilename?.split('.').pop()?.toLowerCase();

    // Processar baseado no tipo de arquivo
    if (fileExtension === 'csv') {
      parsedData = await parseCSVFile(buffer);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      parsedData = parseExcelFile(buffer);
    } else {
      return res.status(400).json({ error: 'Formato de arquivo não suportado. Use .xlsx, .xls ou .csv' });
    }

    // Validar se há dados
    if (!parsedData || parsedData.length === 0) {
      return res.status(400).json({ error: 'Arquivo vazio ou sem dados válidos' });
    }

    // Limitar a 1000 registros
    if (parsedData.length > 1000) {
      return res.status(400).json({ 
        error: 'Arquivo contém mais de 1000 registros. Limite máximo é 1000 empresas por importação.' 
      });
    }

    // Limpar arquivo temporário
    fs.unlinkSync(file.filepath);

    res.status(200).json({
      success: true,
      data: parsedData,
      totalRecords: parsedData.length,
      filename: file.originalFilename
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao processar arquivo',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}