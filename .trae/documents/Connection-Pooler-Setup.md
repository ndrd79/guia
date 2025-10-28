# Configuração do Connection Pooler - Supabase

## O que é o Connection Pooler?

O Connection Pooler do Supabase é uma camada de otimização que:
- Reduz a latência das conexões com o banco
- Melhora a performance das queries
- Gerencia eficientemente o pool de conexões
- Reduz o overhead de estabelecer novas conexões

## Como Configurar

### 1. Acessar o Dashboard do Supabase

1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. Navegue para: **Settings** > **Database**

### 2. Encontrar as Connection Strings

Na seção **Connection pooling**, você encontrará:

- **Pooler URL**: Para uso geral (melhor performance)
- **Direct URL**: Para migrations e operações administrativas

### 3. Configurar Variáveis de Ambiente

Adicione ao seu `.env.local`:

```env
# Connection Pooler (use esta para queries normais)
SUPABASE_POOLER_URL=postgresql://postgres:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Conexão Direta (use para migrations)
SUPABASE_DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

**Importante**: Substitua `[PASSWORD]` e `[PROJECT-ID]` pelos valores reais.

### 4. Atualizar Configurações do Projeto

O arquivo `lib/database-config.js` já foi criado com:
- Configuração otimizada do cliente Supabase
- Funções de busca full-text
- Configurações de cache e performance
- Fallbacks para busca básica

## Benefícios Esperados

### Performance
- **Redução de latência**: 20-50ms menos por query
- **Throughput**: Até 3x mais queries por segundo
- **Estabilidade**: Menos timeouts e erros de conexão

### Escalabilidade
- **Conexões simultâneas**: Suporte a mais usuários
- **Picos de tráfego**: Melhor handling de cargas altas
- **Eficiência de recursos**: Menor uso de CPU/memória

## Monitoramento

### Métricas a Acompanhar
- Tempo de resposta das queries
- Número de conexões ativas
- Taxa de erro de conexão
- Throughput de queries

### Ferramentas
- Dashboard do Supabase (métricas em tempo real)
- Logs da aplicação
- Vercel Analytics (se usando Vercel)

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão**
   - Verifique se as URLs estão corretas
   - Confirme se a senha está correta
   - Teste a conexão direta primeiro

2. **Performance não melhorou**
   - Verifique se está usando a POOLER_URL
   - Confirme se os índices foram criados
   - Monitore as métricas no dashboard

3. **Timeouts**
   - Aumente o timeout nas configurações
   - Verifique a carga do banco
   - Considere otimizar queries lentas

## Próximos Passos

1. ✅ Configurar Connection Pooler
2. ⏳ Aplicar otimizações SQL (índices e busca full-text)
3. ⏳ Testar performance
4. ⏳ Monitorar métricas em produção

## Comandos Úteis

```bash
# Testar conexão
node -e "console.log('Testing connection...'); require('./lib/database-config').checkDatabaseHealth().then(console.log)"

# Verificar configuração
node -e "console.log(process.env.SUPABASE_POOLER_URL ? 'Pooler configurado' : 'Pooler não configurado')"
```
