import { z } from 'zod'
import { isSecureUrl } from './helpers'

/**
 * Schema de validação completo para banners
 */
export const bannerSchema = z.object({
    nome: z.string()
        .min(1, 'Nome é obrigatório')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .regex(/^[a-zA-Z0-9\s\-_áéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ]+$/, 'Nome contém caracteres inválidos'),
    posicao: z.string().min(1, 'Posição é obrigatória'),
    imagem: z.string()
        .min(1, 'Imagem é obrigatória')
        .url('URL da imagem inválida')
        .refine(url => url.includes('supabase'), 'Apenas imagens do Supabase são permitidas'),
    link: z.string()
        .optional()
        .refine(url => !url || isSecureUrl(url), 'URL não é segura ou contém protocolo inválido')
        .transform(url => url?.trim() || ''),
    largura: z.number()
        .min(50, 'Largura mínima é 50px')
        .max(2000, 'Largura máxima é 2000px')
        .int('Largura deve ser um número inteiro'),
    altura: z.number()
        .min(50, 'Altura mínima é 50px')
        .max(1000, 'Altura máxima é 1000px')
        .int('Altura deve ser um número inteiro'),
    ordem: z.number()
        .int('Ordem deve ser um número inteiro')
        .min(0, 'Ordem mínima é 0')
        .max(9999, 'Ordem máxima é 9999')
        .optional(),
    tempo_exibicao: z.number()
        .int('Tempo deve ser um número inteiro')
        .min(1, 'Tempo mínimo é 1 segundo')
        .max(60, 'Tempo máximo é 60 segundos')
        .default(5),
    local: z.enum(['geral', 'home', 'guia_comercial', 'noticias', 'eventos', 'classificados', 'contato'])
        .default('geral'),
    ativo: z.boolean(),
    data_inicio: z.string()
        .optional()
        .refine(val => !val || !isNaN(Date.parse(val)), 'Data de início inválida'),
    data_fim: z.string()
        .optional()
        .refine(val => !val || !isNaN(Date.parse(val)), 'Data de fim inválida'),
}).refine(data => {
    if (data.data_inicio && data.data_fim) {
        const inicio = new Date(data.data_inicio)
        const fim = new Date(data.data_fim)
        return fim > inicio
    }
    return true
}, {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['data_fim']
})

export type BannerFormData = z.infer<typeof bannerSchema>
