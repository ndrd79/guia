import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { EmpresaImportSchema, normalizePhone, normalizeUrl } from '../../../../src/schemas/empresa';
import { isCategoriaValidaNormalizada } from '../../../../lib/constants/categorias';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ValidationResult {
  valid: any[];
  invalid: any[];
  warnings: any[];
  duplicates: any[];
}

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

// Verificar duplicatas no banco de dados
const checkDuplicatesInDatabase = async (empresas: any[]) => {
  try {
    const names = empresas
      .map((e: any) => (e.nome || '').toLowerCase().trim())
      .filter((n: string) => n.length > 0);
    const phones = empresas
      .map((e: any) => (e.telefone || '').replace(/\D/g, ''))
      .filter((p: string) => p.length > 0);

    if (names.length === 0 && phones.length === 0) {
      return [] as Array<{ name: string; phone: string }>;
    }

    const orFilters: string[] = [];
    if (names.length > 0) {
      orFilters.push(`name.ilike.%${names.join('%,name.ilike.%')}%`);
    }
    if (phones.length > 0) {
      orFilters.push(`phone.in.(${phones.join(',')})`);
    }

    const { data, error } = await supabase
      .from('empresas')
      .select('name, phone')
      .or(orFilters.join(','));

    if (error) {
      console.error('[validate] Erro ao verificar duplicatas:', error.message);
      return [] as Array<{ name: string; phone: string }>;
    }

    return (data || []) as Array<{ name: string; phone: string }>;
  } catch (e: any) {
    console.error('[validate] Falha inesperada ao verificar duplicatas:', e?.message || String(e));
    return [] as Array<{ name: string; phone: string }>;
  }
};

// Verificar se categorias são válidas usando lista fixa
const checkCategoriesValid = (categorias: string[]) => {
  const categoriesSet = new Set(categorias.map(c => c.trim()));
  const uniqueCategories = Array.from(categoriesSet);
  return uniqueCategories.filter(categoria => isCategoriaValidaNormalizada(categoria));
};



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Verificar autenticação admin
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem validar importações.' });
    }

    const { empresas } = req.body;

    if (!empresas || !Array.isArray(empresas)) {
      return res.status(400).json({ error: 'Dados de empresas inválidos' });
    }

    const result: ValidationResult = {
      valid: [],
      invalid: [],
      warnings: [],
      duplicates: []
    };

    // Verificar duplicatas no banco de dados
    const existingEmpresas = await checkDuplicatesInDatabase(empresas);
    const existingNomes = existingEmpresas.map(e => (e.name || '').toLowerCase().trim());
    const existingTelefones = existingEmpresas.map(e => (e.phone || '').replace(/\D/g, ''));

    // Verificar quais categorias são válidas
    const categorias = empresas.map(e => e.categoria).filter(Boolean);
    const validCategories = checkCategoriesValid(categorias);

    // Rastrear duplicatas internas
    const internalDuplicates = new Map();
    const processedNomes = new Set();
    const processedTelefones = new Set();

    for (const empresa of empresas) {
      try {
        // Normalizar dados
        const normalizedEmpresa = {
          ...empresa,
          nome: empresa.nome?.trim() || '',
          categoria: empresa.categoria?.trim() || '',
          telefone: normalizePhone(empresa.telefone || ''),
          endereco: empresa.endereco?.trim() || '',
          descricao: empresa.descricao?.trim() || '',
          email: empresa.email?.trim() || '',
          website: normalizeUrl(empresa.website?.trim() || ''),
          whatsapp: empresa.whatsapp ? normalizePhone(empresa.whatsapp) : '',
          horario_funcionamento: empresa.horario_funcionamento?.trim() || '',
          imagem: normalizeUrl(empresa.imagem?.trim() || ''),
          facebook: normalizeUrl(empresa.facebook?.trim() || ''),
          instagram: normalizeUrl(empresa.instagram?.trim() || ''),
          linkedin: normalizeUrl(empresa.linkedin?.trim() || ''),
          twitter: normalizeUrl(empresa.twitter?.trim() || '')
        };

        // Validar com Zod
        const validationResult = EmpresaImportSchema.safeParse(normalizedEmpresa);

        if (!validationResult.success) {
          result.invalid.push({
            ...normalizedEmpresa,
            errors: validationResult.error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          });
          continue;
        }

        const validEmpresa = validationResult.data;

        // Verificar duplicatas internas
        const nomeKey = validEmpresa.nome.toLowerCase();
        const telefoneKey = validEmpresa.telefone.replace(/\D/g, '');

        if (processedNomes.has(nomeKey) || processedTelefones.has(telefoneKey)) {
          result.duplicates.push({
            ...validEmpresa,
            duplicateType: 'internal',
            message: 'Duplicata encontrada no próprio arquivo'
          });
          continue;
        }

        // Verificar duplicatas no banco
        const isDuplicateInDB = existingNomes.includes(nomeKey) || existingTelefones.includes(telefoneKey);
        
        if (isDuplicateInDB) {
          result.duplicates.push({
            ...validEmpresa,
            duplicateType: 'database',
            message: 'Empresa já existe no banco de dados'
          });
          continue;
        }

        // Verificar avisos
        const warnings = [];

        // Categoria não é válida
        if (!isCategoriaValidaNormalizada(validEmpresa.categoria)) {
          warnings.push({
            field: 'categoria',
            message: `Categoria "${validEmpresa.categoria}" não é válida. Categorias válidas: Restaurante, Automotivo, Saúde, Alimentação, Beleza, Tecnologia, Comércio, Serviços, Educação, Imóveis`
          });
        }

        // Email vazio
        if (!validEmpresa.email) {
          warnings.push({
            field: 'email',
            message: 'Email não informado'
          });
        }

        // Website vazio
        if (!validEmpresa.website) {
          warnings.push({
            field: 'website',
            message: 'Website não informado'
          });
        }

        // Adicionar aos processados
        processedNomes.add(nomeKey);
        processedTelefones.add(telefoneKey);

        if (warnings.length > 0) {
          result.warnings.push({
            ...validEmpresa,
            warnings
          });
        } else {
          result.valid.push(validEmpresa);
        }

      } catch (error) {
        result.invalid.push({
          ...empresa,
          errors: [{
            field: 'general',
            message: 'Erro inesperado na validação'
          }]
        });
      }
    }

    res.status(200).json({
      success: true,
      ...result,
      summary: {
        total: empresas.length,
        valid: result.valid.length,
        warnings: result.warnings.length,
        invalid: result.invalid.length,
        duplicates: result.duplicates.length
      }
    });

  } catch (error) {
    console.error('Erro na validação:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor na validação',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}