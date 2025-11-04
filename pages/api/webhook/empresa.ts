import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { sendNewEmpresaNotification } from '../../../lib/email';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Interface para os dados do formulário
interface FormData {
  nome: string;
  categoria: string;
  telefone: string;
  cidade?: string;
  endereco: string;
  descricao: string;
  email?: string;
  website?: string;
  whatsapp?: string;
  horario_funcionamento_dias?: string;
  horario_funcionamento_horario?: string;
  facebook?: string;
  instagram?: string;
  maps?: string;
  user?: string;
  timestamp?: string;
  form_response_id?: string;
}

// Função para validar dados obrigatórios
function validateRequiredFields(data: FormData): string[] {
  const errors: string[] = [];
  
  if (!data.nome?.trim()) {
    errors.push('Nome é obrigatório');
  }
  
  if (!data.categoria?.trim()) {
    errors.push('Categoria é obrigatória');
  }
  
  if (!data.telefone?.trim()) {
    errors.push('Telefone é obrigatório');
  }
  
  if (!data.endereco?.trim()) {
    errors.push('Endereço é obrigatório');
  }
  
  if (!data.descricao?.trim()) {
    errors.push('Descrição é obrigatória');
  }
  
  return errors;
}

// Função para normalizar dados do formulário
function normalizeFormData(data: FormData) {
  return {
    name: data.nome?.trim(),
    category: data.categoria?.trim(),
    phone: data.telefone?.trim(),
    cidade: data.cidade?.trim() || null,
    address: data.endereco?.trim(),
    description: data.descricao?.trim(),
    email: data.email?.trim() || null,
    website: data.website?.trim() || null,
    whatsapp: data.whatsapp?.trim() || null,
    horario_funcionamento_dias: data.horario_funcionamento_dias?.trim() || null,
    horario_funcionamento_horario: data.horario_funcionamento_horario?.trim() || null,
    facebook: data.facebook?.trim() || null,
    instagram: data.instagram?.trim() || null,
    maps: data.maps?.trim() || null,
    user_source: data.user?.trim() || null,
    form_submission_id: data.form_response_id || null,
    submitted_at: data.timestamp ? new Date(data.timestamp) : new Date(),
    status: 'pending' as const,
    ativo: true,
    featured: false,
    is_new: true,
    rating: 0.0,
    reviews: 0
  };
}

// Função para enviar notificação por email
async function sendNotificationEmail(empresa: any) {
  try {
    const empresaData = {
      id: empresa.id,
      name: empresa.name,
      category: empresa.category,
      phone: empresa.phone,
      email: empresa.email,
      cidade: empresa.cidade,
      submitted_at: empresa.submitted_at,
      user_source: empresa.user_source
    };

    const success = await sendNewEmpresaNotification(empresaData);
    
    if (success) {
      console.log('✅ Notificação por email enviada com sucesso para:', empresa.name);
    } else {
      console.log('⚠️ Falha ao enviar notificação por email para:', empresa.name);
    }
    
    return success;
  } catch (error) {
    console.error('❌ Erro ao enviar notificação por email:', error);
    return false;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Permitir apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Método não permitido',
      message: 'Este endpoint aceita apenas requisições POST' 
    });
  }

  try {
    // Log da requisição para debug
    console.log('Webhook recebido:', {
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    // Verificar se há dados no body
    if (!req.body) {
      return res.status(400).json({
        error: 'Dados não fornecidos',
        message: 'O corpo da requisição está vazio'
      });
    }

    // Extrair dados do formulário
    const formData: FormData = req.body;

    // Validar campos obrigatórios
    const validationErrors = validateRequiredFields(formData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'Campos obrigatórios não preenchidos',
        details: validationErrors
      });
    }

    // Normalizar dados
    const empresaData = normalizeFormData(formData);

    // Verificar se já existe empresa com mesmo nome e telefone
    const { data: existingEmpresa, error: checkError } = await supabase
      .from('empresas')
      .select('id, name, phone, status')
      .eq('name', empresaData.name)
      .eq('phone', empresaData.phone)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar empresa existente:', checkError);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao verificar duplicatas'
      });
    }

    // Se empresa já existe
    if (existingEmpresa) {
      return res.status(409).json({
        error: 'Empresa já cadastrada',
        message: `Já existe uma empresa com o nome "${empresaData.name}" e telefone "${empresaData.phone}"`,
        existing_status: existingEmpresa.status,
        empresa_id: existingEmpresa.id
      });
    }

    // Inserir nova empresa
    const { data: newEmpresa, error: insertError } = await supabase
      .from('empresas')
      .insert([empresaData])
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao inserir empresa:', insertError);
      return res.status(500).json({
        error: 'Erro ao salvar empresa',
        message: 'Não foi possível salvar a empresa no banco de dados',
        details: insertError.message
      });
    }

    // Enviar notificação por email (assíncrono)
    try {
      await sendNotificationEmail(newEmpresa);
    } catch (emailError) {
      console.error('Erro ao enviar notificação por email:', emailError);
      // Não falhar a requisição por causa do email
    }

    // Resposta de sucesso
    return res.status(201).json({
      success: true,
      message: 'Empresa cadastrada com sucesso e aguarda aprovação',
      data: {
        id: newEmpresa.id,
        name: newEmpresa.name,
        category: newEmpresa.category,
        status: newEmpresa.status,
        submitted_at: newEmpresa.submitted_at
      }
    });

  } catch (error) {
    console.error('Erro no webhook:', error);
    
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Ocorreu um erro inesperado ao processar a solicitação',
      timestamp: new Date().toISOString()
    });
  }
}

// Configuração para aumentar o limite do body
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}