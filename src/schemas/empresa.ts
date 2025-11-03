import { z } from 'zod';

// Schema base para empresa
export const EmpresaBaseSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  telefone: z.string().min(1, "Telefone é obrigatório").refine((val) => {
    if (!val) return false;
    const cleaned = val.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  }, "Telefone deve ter 10 ou 11 dígitos"),
  endereco: z.string().min(1, "Endereço é obrigatório").max(200, "Endereço deve ter no máximo 200 caracteres"),
  descricao: z.string().min(1, "Descrição é obrigatória").max(500, "Descrição deve ter no máximo 500 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")).or(z.undefined()),
  website: z.string().refine((val) => isValidUrl(val), "URL inválida").optional().or(z.literal("")).or(z.undefined()),
  whatsapp: z.string().refine((val) => {
    if (!val || val.trim() === '') return true;
    const cleaned = val.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  }, "WhatsApp deve ter 10 ou 11 dígitos").optional().or(z.literal("")).or(z.undefined()),
  horario_funcionamento: z.string().max(100, "Horário deve ter no máximo 100 caracteres").optional().or(z.literal("")).or(z.undefined()),
  imagem: z.string().refine((val) => isValidUrl(val), "URL de imagem inválida").optional().or(z.literal("")).or(z.undefined()),
  facebook: z.string().refine((val) => isValidUrl(val), "URL do Facebook inválida").optional().or(z.literal("")).or(z.undefined()),
  instagram: z.string().refine((val) => isValidUrl(val), "URL do Instagram inválida").optional().or(z.literal("")).or(z.undefined()),
  linkedin: z.string().refine((val) => isValidUrl(val), "URL do LinkedIn inválida").optional().or(z.literal("")).or(z.undefined()),
  twitter: z.string().refine((val) => isValidUrl(val), "URL do Twitter inválida").optional().or(z.literal("")).or(z.undefined())
});

// Schema para importação (inclui _rowNumber)
export const EmpresaImportSchema = EmpresaBaseSchema.extend({
  _rowNumber: z.number()
});

// Schema para criação/edição (sem _rowNumber)
export const EmpresaCreateSchema = EmpresaBaseSchema;

// Schema para atualização (todos os campos opcionais exceto ID)
export const EmpresaUpdateSchema = EmpresaBaseSchema.partial();

// Schema para validação de formulário frontend
export const EmpresaFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  endereco: z.string().min(1, "Endereço é obrigatório").max(200, "Endereço deve ter no máximo 200 caracteres"),
  descricao: z.string().min(1, "Descrição é obrigatória").max(500, "Descrição deve ter no máximo 500 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  whatsapp: z.string().optional(),
  horario_funcionamento: z.string().max(100, "Horário deve ter no máximo 100 caracteres").optional(),
  imagem: z.string().url("URL de imagem inválida").optional().or(z.literal("")),
  facebook: z.string().url("URL do Facebook inválida").optional().or(z.literal("")),
  instagram: z.string().url("URL do Instagram inválida").optional().or(z.literal("")),
  linkedin: z.string().url("URL do LinkedIn inválida").optional().or(z.literal("")),
  twitter: z.string().url("URL do Twitter inválida").optional().or(z.literal(""))
});

// Tipos TypeScript derivados dos schemas
export type EmpresaBase = z.infer<typeof EmpresaBaseSchema>;
export type EmpresaImport = z.infer<typeof EmpresaImportSchema>;
export type EmpresaCreate = z.infer<typeof EmpresaCreateSchema>;
export type EmpresaUpdate = z.infer<typeof EmpresaUpdateSchema>;
export type EmpresaForm = z.infer<typeof EmpresaFormSchema>;

// Função utilitária para normalizar telefone
export const normalizePhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

// Função utilitária para validar telefone
export const isValidPhone = (phone: string): boolean => {
  if (!phone || phone.trim() === '') return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
};

// Função utilitária para validar email
export const isValidEmail = (email: string): boolean => {
  if (!email) return true; // Email é opcional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Função utilitária para validar URL
export const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return true; // URL é opcional
  
  let urlToTest = url.trim();
  
  // Se não tem protocolo, adiciona https://
  if (!urlToTest.startsWith('http://') && !urlToTest.startsWith('https://')) {
    urlToTest = 'https://' + urlToTest;
  }
  
  try {
    new URL(urlToTest);
    return true;
  } catch {
    return false;
  }
};

// Função utilitária para normalizar URL
export const normalizeUrl = (url: string): string => {
  if (!url || url.trim() === '') return '';
  
  let normalizedUrl = url.trim();
  
  // Se não tem protocolo, adiciona https://
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }
  
  return normalizedUrl;
};

// Constantes para validação
export const VALIDATION_CONSTANTS = {
  MAX_NOME_LENGTH: 100,
  MAX_ENDERECO_LENGTH: 200,
  MAX_DESCRICAO_LENGTH: 500,
  MAX_HORARIO_LENGTH: 100,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 11
} as const;

// Mensagens de erro padronizadas
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: "Este campo é obrigatório",
  INVALID_EMAIL: "Email inválido",
  INVALID_PHONE: "Formato de telefone inválido",
  INVALID_URL: "URL inválida",
  MAX_LENGTH: (field: string, max: number) => `${field} deve ter no máximo ${max} caracteres`,
  MIN_LENGTH: (field: string, min: number) => `${field} deve ter no mínimo ${min} caracteres`
} as const;