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


// Tipos para usuários
export interface UserProfile {
  id: string
  nome_completo: string
  telefone?: string
  cidade?: string
  estado?: string
  data_nascimento?: string
  avatar_url?: string
  bio?: string
  ativo: boolean
  created_at?: string
  updated_at?: string
}

export interface ClassificadoComUsuario {
  id: string
  titulo: string
  categoria: string
  preco?: number
  imagem?: string
  localizacao?: string
  descricao?: string
  user_id?: string
  contato_nome?: string
  contato_telefone?: string
  contato_email?: string
  created_at?: string
  updated_at?: string
  user_profile?: UserProfile
}