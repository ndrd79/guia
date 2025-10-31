# Sistema de Planos Premium para Empresas - PRD

## 1. Product Overview

Sistema de diferenciação de planos para empresas no Guia Comercial, permitindo que empresas escolham entre plano premium (página individual dedicada) ou plano básico (listagem compartilhada por categoria).

O sistema resolve a necessidade de monetização da plataforma oferecendo maior visibilidade para empresas pagantes, enquanto mantém um serviço básico gratuito para empresas que preferem listagem simples por categoria.

## 2. Core Features

### 2.1 User Roles

| Role | Registration Method | Core Permissions |
|------|---------------------|------------------|
| Administrador | Login com credenciais admin | Gerenciar todas as empresas, definir planos, visualizar relatórios |
| Empresa Premium | Cadastro com seleção de plano premium | Página individual dedicada, maior visibilidade |
| Empresa Básica | Cadastro com plano básico (padrão) | Listagem em página compartilhada por categoria |

### 2.2 Feature Module

O sistema de planos premium consiste nas seguintes páginas principais:

1. **Página de Administração de Empresas**: gerenciamento de empresas, seleção de planos, controle de expiração.
2. **Página Individual da Empresa**: página dedicada para empresas premium com layout completo.
3. **Página de Listagem por Categoria**: página compartilhada listando empresas básicas da mesma categoria.
4. **Dashboard de Relatórios**: visualização de estatísticas de planos e receitas.

### 2.3 Page Details

| Page Name | Module Name | Feature description |
|-----------|-------------|---------------------|
| Admin Empresas | Formulário de Cadastro | Adicionar campo de seleção de plano (Premium/Básico), campo de data de expiração para premium, validação de datas |
| Admin Empresas | Listagem de Empresas | Exibir badges de tipo de plano, filtros por plano, indicador de status de expiração, ações de renovação |
| Página Individual | Layout Premium | Exibir informações completas da empresa, galeria de imagens, mapa de localização, informações de contato destacadas |
| Listagem Categoria | Layout Básico | Listar empresas básicas por categoria, navegação alfabética, informações resumidas, design simples |
| Dashboard Relatórios | Métricas de Planos | Contadores de empresas por plano, receitas, gráficos de conversão, alertas de expiração |

## 3. Core Process

**Fluxo do Administrador:**
1. Acessa página de administração de empresas
2. Cadastra nova empresa ou edita existente
3. Seleciona tipo de plano (Premium ou Básico)
4. Para plano premium, define data de expiração
5. Salva empresa com configurações de plano
6. Monitora status e renovações via dashboard

**Fluxo do Usuário Final:**
1. Acessa guia comercial pela homepage
2. Para empresas premium: navega para página individual (/guia/[id])
3. Para empresas básicas: navega para listagem por categoria (/guia/categoria/[categoria])
4. Visualiza informações conforme tipo de plano da empresa

```mermaid
graph TD
    A[Homepage] --> B[Guia Comercial]
    B --> C{Tipo de Empresa}
    C -->|Premium| D[Página Individual /guia/[id]]
    C -->|Básica| E[Listagem Categoria /guia/categoria/[categoria]]
    
    F[Admin] --> G[Cadastro Empresa]
    G --> H{Selecionar Plano}
    H -->|Premium| I[Definir Data Expiração]
    H -->|Básico| J[Salvar como Básico]
    I --> K[Salvar como Premium]
    
    L[Sistema] --> M{Verificar Expiração}
    M -->|Expirado| N[Migrar para Básico]
    M -->|Válido| O[Manter Premium]
```

## 4. User Interface Design

### 4.1 Design Style

- **Cores Primárias**: Azul (#2563eb) para premium, Verde (#16a34a) para básico
- **Cores Secundárias**: Cinza (#6b7280) para neutro, Vermelho (#dc2626) para alertas
- **Estilo de Botões**: Arredondados com sombra sutil, hover com transição suave
- **Fontes**: Inter para títulos (16-24px), Open Sans para texto (14-16px)
- **Layout**: Card-based com espaçamento consistente, navegação superior fixa
- **Ícones**: Lucide React para consistência, badges com ícones de coroa (premium) e tag (básico)

### 4.2 Page Design Overview

| Page Name | Module Name | UI Elements |
|-----------|-------------|-------------|
| Admin Empresas | Formulário Cadastro | Select dropdown para plano, date picker para expiração, labels coloridos, validação visual em tempo real |
| Admin Empresas | Listagem | Badges coloridos (Premium: azul com coroa, Básico: verde com tag), filtros dropdown, tabela responsiva, indicadores de status |
| Página Individual | Header Premium | Banner destacado, logo da empresa, informações de contato em destaque, botão de ação principal |
| Página Individual | Conteúdo Premium | Grid de 2 colunas, galeria de imagens, mapa integrado, seções bem definidas com cards |
| Listagem Categoria | Header Básico | Título da categoria, navegação alfabética horizontal, contador de empresas |
| Listagem Categoria | Lista Empresas | Cards simples em grid responsivo, informações essenciais, hover effects sutis |

### 4.3 Responsiveness

Produto desktop-first com adaptação mobile completa. Navegação touch-friendly para dispositivos móveis, com colapso de filtros em drawer lateral e cards empilhados verticalmente em telas pequenas.

## 5. Business Rules

### 5.1 Regras de Plano

- **Plano Básico**: Padrão para todas as empresas, sem custo, listagem compartilhada
- **Plano Premium**: Pago, página individual, maior visibilidade, data de expiração obrigatória
- **Migração Automática**: Empresas premium expiradas migram automaticamente para básico
- **Renovação**: Administrador pode renovar planos premium definindo nova data de expiração

### 5.2 Regras de Exibição

- **Empresas Premium Ativas**: Aparecem em página individual e podem aparecer em destaque na listagem geral
- **Empresas Premium Expiradas**: Migram automaticamente para listagem básica
- **Empresas Básicas**: Aparecem apenas na listagem por categoria
- **Ordem de Exibição**: Premium por data de cadastro, básicas por ordem alfabética

### 5.3 Regras de Acesso

- **Administradores**: Acesso total a configurações de plano e relatórios
- **Usuários Finais**: Visualização conforme tipo de plano da empresa
- **SEO**: URLs amigáveis para ambos os tipos (/guia/[id] e /guia/categoria/[categoria])