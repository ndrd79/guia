# Sistema de Banners Publicitários

## 📋 Visão Geral

O sistema de banners permite gerenciar anúncios publicitários em diferentes posições do site, com controle total sobre dimensões, posicionamento e ativação.

## 🎯 Funcionalidades Implementadas

### ✅ Painel Administrativo
- **Cadastro de Banners**: Formulário completo com validação
- **Dimensões Personalizadas**: Largura (50-2000px) e Altura (50-1000px)
- **Upload de Imagens**: Integração com Supabase Storage
- **Posicionamento**: 15 posições predefinidas no site
- **Links Opcionais**: Redirecionamento para URLs externas
- **Status Ativo/Inativo**: Controle de exibição
- **Edição e Exclusão**: CRUD completo

### ✅ Exibição no Site
- **Carregamento Dinâmico**: Banners carregados do banco de dados
- **Múltiplos Banners**: Suporte a vários banners por posição
- **Dimensões Responsivas**: Adaptação automática às dimensões configuradas
- **Placeholder Inteligente**: Exibe espaço reservado quando não há banner
- **Performance Otimizada**: Carregamento assíncrono com hooks personalizados

## 📍 Posições Disponíveis

1. **Header Superior** - Topo do cabeçalho
2. **Header Inferior** - Parte inferior do cabeçalho
3. **Banner Principal** - Seção hero da página inicial
4. **Empresas Destaque - Topo** - Acima da seção de empresas
5. **Empresas Destaque - Rodapé 1** - Primeira posição após empresas
6. **Empresas Destaque - Rodapé 2** - Segunda posição após empresas
7. **Eventos - Rodapé** - Após a seção de eventos
8. **Serviços - Rodapé 1** - Primeira posição após serviços
9. **Serviços - Rodapé 2** - Segunda posição após serviços
10. **Serviços - Rodapé 3** - Terceira posição após serviços
11. **Sidebar Direita** - Barra lateral direita
12. **Sidebar Esquerda** - Barra lateral esquerda
13. **Entre Conteúdo** - No meio do conteúdo
14. **Footer** - Rodapé do site
15. **Popup** - Modal/popup

## 🛠️ Como Usar

### Acessar o Painel
1. Acesse `/admin/banners`
2. Faça login com credenciais de administrador

### Criar Novo Banner
1. Clique em "Novo Banner"
2. Preencha os campos obrigatórios:
   - **Nome**: Identificação do banner
   - **Posição**: Escolha onde será exibido
   - **Largura**: Dimensão em pixels (50-2000)
   - **Altura**: Dimensão em pixels (50-1000)
   - **Imagem**: Upload da imagem publicitária
3. Campos opcionais:
   - **Link**: URL de redirecionamento
   - **Banner ativo**: Marque para exibir imediatamente
4. Clique em "Criar"

### Gerenciar Banners Existentes
- **Visualizar**: Lista todos os banners com preview
- **Editar**: Clique no ícone de lápis
- **Ativar/Desativar**: Clique no status para alternar
- **Excluir**: Clique no ícone de lixeira (com confirmação)

## 🔧 Estrutura Técnica

### Componentes
- `BannerContainer.tsx` - Container inteligente que carrega banners
- `BannerAd.tsx` - Componente de exibição do banner
- `useBanners.ts` - Hook para carregar banners do Supabase

### Banco de Dados
```sql
CREATE TABLE banners (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    posicao VARCHAR(100) NOT NULL,
    imagem TEXT NOT NULL,
    link TEXT,
    largura INTEGER DEFAULT 400,
    altura INTEGER DEFAULT 200,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Migração
Para adicionar as colunas de dimensões em bancos existentes:
```bash
# Execute o arquivo de migração
psql -f migrations/add_banner_dimensions.sql
```

## 📱 Responsividade

Os banners são automaticamente responsivos:
- **Desktop**: Dimensões completas configuradas
- **Tablet**: Adaptação proporcional
- **Mobile**: Ajuste automático com `object-cover`

## 🎨 Personalização

### Adicionar Nova Posição
1. Edite `posicoesBanner` em `/pages/admin/banners.tsx`
2. Adicione `<BannerContainer position="Nova Posição" />` onde desejar
3. Configure CSS classes conforme necessário

### Modificar Dimensões Padrão
Edite os valores padrão em:
- Schema de validação (`bannerSchema`)
- Valores padrão do formulário
- Migração SQL

## 🚀 Próximos Passos

- [ ] Sistema de agendamento de banners
- [ ] Relatórios de cliques e impressões
- [ ] Banners rotativos automáticos
- [ ] Integração com Google Ads
- [ ] Sistema de pagamento para anunciantes

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console do navegador
2. Confirme se o Supabase está configurado corretamente
3. Verifique se as variáveis de ambiente estão definidas
4. Execute a migração SQL se necessário