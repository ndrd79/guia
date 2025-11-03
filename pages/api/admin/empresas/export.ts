import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface EmpresaFilters {
  search?: string;
  categoria?: string;
  batch_id?: string;
  imported_only?: boolean;
}

// Check admin authentication
async function checkAdminAuth(req: NextApiRequest): Promise<boolean> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return false;
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'admin';
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

// Build query with filters
function buildQuery(filters: EmpresaFilters) {
  let query = supabase
    .from('empresas')
    .select(`
      name,
      category,
      phone,
      address,
      description,
      email,
      website,
      location,
      plan_type,
      imported_at,
      import_batch_id,
      created_at,
      updated_at
    `);

  // Search filter
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.or(`name.ilike.${searchTerm},category.ilike.${searchTerm},phone.ilike.${searchTerm},address.ilike.${searchTerm}`);
  }

  // Category filter
  if (filters.categoria) {
    query = query.eq('category', filters.categoria);
  }

  // Batch filter
  if (filters.batch_id) {
    query = query.eq('import_batch_id', filters.batch_id);
  }

  // Imported only filter
  if (filters.imported_only) {
    query = query.not('imported_at', 'is', null);
  }

  return query;
}

// Format data for export
function formatDataForExport(empresas: any[]) {
  return empresas.map(empresa => ({
    'Nome': empresa.name,
    'Categoria': empresa.category,
    'Telefone': empresa.phone,
    'Endereço': empresa.address,
    'Descrição': empresa.description,
    'Email': empresa.email || '',
    'Website': empresa.website || '',
    'Localização': empresa.location || '',
    'Plano': empresa.plan_type || '',
    'Data de Criação': empresa.created_at ? new Date(empresa.created_at).toLocaleDateString('pt-BR') : '',
    'Data de Atualização': empresa.updated_at ? new Date(empresa.updated_at).toLocaleDateString('pt-BR') : '',
    'Data de Importação': empresa.imported_at ? new Date(empresa.imported_at).toLocaleDateString('pt-BR') : '',
    'Lote de Importação': empresa.import_batch_id || ''
  }));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const isAdmin = await checkAdminAuth(req);
  if (!isAdmin) {
    return res.status(401).json({ error: 'Acesso negado' });
  }

  if (req.method === 'GET') {
    try {
      // Parse filters
      const filters: EmpresaFilters = {
        search: req.query.search as string,
        categoria: req.query.categoria as string,
        batch_id: req.query.batch_id as string,
        imported_only: req.query.imported_only === 'true'
      };

      // Build and execute query
      let query = buildQuery(filters);
      query = query.order('created_at', { ascending: false });

      const { data: empresas, error } = await query;

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Erro ao buscar empresas' });
      }

      if (!empresas || empresas.length === 0) {
        return res.status(400).json({ error: 'Nenhuma empresa encontrada para exportar' });
      }

      // Format data for export
      const formattedData = formatDataForExport(empresas);

      // Create workbook
      const workbook = XLSX.utils.book_new();
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(formattedData);

      // Set column widths
      const columnWidths = [
        { wch: 30 }, // Nome
        { wch: 20 }, // Categoria
        { wch: 15 }, // Telefone
        { wch: 40 }, // Endereço
        { wch: 50 }, // Descrição
        { wch: 25 }, // Email
        { wch: 25 }, // Website
        { wch: 15 }, // WhatsApp
        { wch: 25 }, // Horário
        { wch: 15 }, // Plano
        { wch: 12 }, // Data Criação
        { wch: 12 }, // Data Atualização
        { wch: 12 }, // Data Importação
        { wch: 20 }  // Lote Importação
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Empresas');

      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, { 
        type: 'buffer', 
        bookType: 'xlsx' 
      });

      // Set response headers
      const filename = `empresas_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', excelBuffer.length);

      // Send file
      return res.status(200).send(excelBuffer);

    } catch (error) {
      console.error('Export error:', error);
      return res.status(500).json({ error: 'Erro ao exportar empresas' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}