// Tipos compartilhados para a Feira do Produtor
export interface FeiraInfo {
  id: string
  titulo: string
  descricao: string
  data_funcionamento: string
  horario_funcionamento: string
  local: string
  imagem_banner?: string
  informacoes_adicionais?: string
  contato?: string
  ativa: boolean
  created_at?: string
  updated_at?: string
}

export interface Produtor {
  id: string
  nome: string
  produtos: string
  descricao?: string
  contato?: string
  imagem?: string
  ativo: boolean
}

export interface FeiraProdutor {
  feiraInfo: FeiraInfo | null
  produtores: Produtor[]
}