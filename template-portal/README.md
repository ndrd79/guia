# 🎨 Template Portal - Guia Comercial

Este template foi extraído do projeto **Portal Maria Helena** e pode ser usado para criar portais de guia comercial para qualquer cidade.

---

## 📁 Estrutura de Arquivos

```
template-portal/
├── README.md                  # Este arquivo
├── SETUP.md                   # Guia de configuração
├── config/
│   └── site.config.ts         # Configurações do site (EDITAR AQUI)
├── design-system/
│   ├── colors.css             # Paleta de cores
│   ├── tailwind.config.js     # Configuração Tailwind
│   └── globals.css            # CSS global completo
├── components/
│   ├── Header.tsx             # Cabeçalho
│   ├── Footer.tsx             # Rodapé
│   └── Nav.tsx                # Navegação
└── layouts/
    └── page-structure.md      # Estrutura das páginas
```

---

## 🚀 Como Usar Este Template

### 1. Criar Novo Projeto

```bash
npx create-next-app@latest meu-portal --typescript --tailwind --eslint
cd meu-portal
```

### 2. Copiar os Arquivos

- Copie `config/site.config.ts` para o novo projeto
- Copie os arquivos de `design-system/` para `styles/`
- Adapte os componentes conforme necessário

### 3. Criar Banco de Dados

No Supabase, crie as tabelas:
- `noticias`
- `empresas`
- `classificados`
- `eventos`
- `banners`

### 4. Configurar Variáveis de Ambiente

Crie `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_key
```

---

## 🎨 Cores do Tema

| Nome | Hex | Uso |
|------|-----|-----|
| Primary | `#3b82f6` | Botões, links |
| Indigo | `#4f46e5` | Destaques, badges |
| Success | `#10b981` | Confirmações |
| Warning | `#f59e0b` | Alertas |
| Background | `#f8fafc` | Fundo da página |

---

## 📝 O Que Personalizar

1. **`config/site.config.ts`** - Nome, logo, contato
2. **`design-system/colors.css`** - Cores (se quiser mudar)
3. **Componentes** - Textos e links
4. **Imagens** - Logo, favicon

---

## 📖 Documentação Adicional

- [SETUP.md](./SETUP.md) - Guia detalhado de configuração
- [layouts/page-structure.md](./layouts/page-structure.md) - Estrutura das páginas
