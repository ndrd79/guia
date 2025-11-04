# 🔗 Integração Google Forms - Portal Maria Helena

## 📋 Visão Geral

Esta documentação explica como configurar a integração entre o Google Forms e o sistema de empresas do Portal Maria Helena. O formulário coleta dados de empresas que são enviados automaticamente para o sistema via webhook para moderação.

## 🎯 Campos do Formulário

### Campos Obrigatórios
- **nome*** - Nome da empresa
- **categoria*** - Categoria do negócio
- **telefone*** - Telefone de contato (formato: (41) 3***-****)
- **endereco*** - Endereço completo (até 200 caracteres)
- **descricao*** - Descrição da empresa

### Campos Opcionais
- **email** - E-mail de contato
- **website** - Site da empresa
- **whatsapp** - WhatsApp (formato: (41) 98502-1640)
- **cidade** - Opções: Itaperuçu, Rio Branco do Sul
- **horario_funcionamento_dias** - Opções: Seg a Sáb, Seg a Sex, Seg a Dom, Seg a Seg, Ter a Dom, Outro
- **horario_funcionamento_horario** - Opções: 8h às 18h, 9h às 18h, 08h às 17h, Outro
- **facebook** - Usuário do Facebook (ex: noitamidia)
- **instagram** - Usuário do Instagram (ex: noitamidia)
- **maps** - Link do Google Maps
- **user** - Fonte: noita, whitevision

## 🛠️ Configuração do Google Apps Script

### 1. Criar o Script

1. Abra o Google Forms
2. Clique nos três pontos (⋮) → **Editor de scripts**
3. Cole o código abaixo:

```javascript
/**
 * Google Apps Script para integração com Portal Maria Helena
 * Envia dados do formulário para o webhook quando uma resposta é submetida
 */

// URL do webhook (substitua pela URL do seu servidor)
const WEBHOOK_URL = 'https://seu-dominio.com/api/webhook/empresa';

/**
 * Função executada quando o formulário é submetido
 */
function onFormSubmit(e) {
  try {
    console.log('📝 Nova submissão do formulário recebida');
    
    // Obter as respostas do formulário
    const responses = e.response.getItemResponses();
    const formData = {};
    
    // Mapear as respostas para os campos
    responses.forEach(function(response) {
      const question = response.getItem().getTitle().toLowerCase();
      const answer = response.getResponse();
      
      // Mapear perguntas para campos da API
      if (question.includes('nome')) {
        formData.nome = answer;
      } else if (question.includes('categoria')) {
        formData.categoria = answer;
      } else if (question.includes('telefone')) {
        formData.telefone = answer;
      } else if (question.includes('cidade')) {
        formData.cidade = answer;
      } else if (question.includes('endereco') || question.includes('endereço')) {
        formData.endereco = answer;
      } else if (question.includes('descricao') || question.includes('descrição')) {
        formData.descricao = answer;
      } else if (question.includes('email')) {
        formData.email = answer;
      } else if (question.includes('website') || question.includes('site')) {
        formData.website = answer;
      } else if (question.includes('whatsapp')) {
        formData.whatsapp = answer;
      } else if (question.includes('horario_funcionamento') && question.includes('dias')) {
        formData.horario_funcionamento_dias = answer;
      } else if (question.includes('horario_funcionamento') && question.includes('horário')) {
        formData.horario_funcionamento_horario = answer;
      } else if (question.includes('facebook')) {
        formData.facebook = answer;
      } else if (question.includes('instagram')) {
        formData.instagram = answer;
      } else if (question.includes('maps')) {
        formData.maps = answer;
      } else if (question.includes('user')) {
        formData.user = answer;
      }
    });
    
    // Adicionar metadados
    formData.timestamp = new Date().toISOString();
    formData.form_response_id = e.response.getId();
    
    console.log('📊 Dados coletados:', formData);
    
    // Enviar para o webhook
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(formData)
    };
    
    const response = UrlFetchApp.fetch(WEBHOOK_URL, payload);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode === 200) {
      console.log('✅ Dados enviados com sucesso para o webhook');
      console.log('📥 Resposta:', responseText);
    } else {
      console.error('❌ Erro ao enviar dados:', responseCode, responseText);
    }
    
  } catch (error) {
    console.error('💥 Erro no processamento:', error.toString());
    
    // Opcional: Enviar email de erro para administrador
    // MailApp.sendEmail({
    //   to: 'admin@portal.com',
    //   subject: 'Erro na integração Google Forms',
    //   body: 'Erro: ' + error.toString() + '\n\nDados: ' + JSON.stringify(formData)
    // });
  }
}

/**
 * Função para configurar o trigger automaticamente
 * Execute esta função uma vez para configurar o webhook
 */
function setupTrigger() {
  // Remover triggers existentes
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Criar novo trigger
  const form = FormApp.getActiveForm();
  ScriptApp.newTrigger('onFormSubmit')
    .timeBased()
    .onFormSubmit()
    .create();
    
  console.log('✅ Trigger configurado com sucesso');
}

/**
 * Função de teste para verificar a integração
 */
function testWebhook() {
  const testData = {
    nome: 'Empresa Teste',
    categoria: 'Comércio',
    telefone: '(41) 3333-4444',
    cidade: 'Itaperuçu',
    endereco: 'Rua Teste, 123',
    descricao: 'Empresa de teste para verificar integração',
    email: 'teste@empresa.com',
    website: 'https://empresa.com',
    whatsapp: '(41) 99999-8888',
    horario_funcionamento_dias: 'Seg a Sex',
    horario_funcionamento_horario: '8h às 18h',
    facebook: 'empresateste',
    instagram: 'empresateste',
    maps: 'https://maps.google.com/teste',
    user: 'noita',
    timestamp: new Date().toISOString(),
    form_response_id: 'test_' + Date.now()
  };
  
  try {
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(testData)
    };
    
    const response = UrlFetchApp.fetch(WEBHOOK_URL, payload);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    console.log('🧪 Teste do webhook:');
    console.log('📤 Dados enviados:', testData);
    console.log('📥 Código de resposta:', responseCode);
    console.log('📄 Resposta:', responseText);
    
    if (responseCode === 200) {
      console.log('✅ Teste bem-sucedido!');
    } else {
      console.log('❌ Teste falhou');
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error.toString());
  }
}
```

### 2. Configurar o Webhook URL

1. No código acima, substitua `https://seu-dominio.com/api/webhook/empresa` pela URL real do seu servidor
2. Para desenvolvimento local, use: `http://localhost:3000/api/webhook/empresa`
3. Para produção, use sua URL de produção

### 3. Configurar o Trigger

1. No editor de scripts, execute a função `setupTrigger()` uma vez
2. Autorize as permissões necessárias
3. O trigger será configurado automaticamente

### 4. Testar a Integração

1. Execute a função `testWebhook()` para testar a conexão
2. Verifique os logs em **Execuções** no Apps Script
3. Teste enviando uma resposta real no formulário

## 🔧 Configuração do Servidor

### Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env.local`:

```env
# Email Configuration (para notificações)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
ADMIN_EMAIL=admin@portal.com
```

### Aplicar Migração

Execute a migração do banco de dados:

```bash
# Aplicar migração via Supabase CLI (se disponível)
supabase db push

# Ou execute manualmente no SQL Editor do Supabase
# O arquivo está em: migrations/023_add_status_field_empresas.sql
```

## 📊 Fluxo de Dados

1. **Usuário preenche formulário** → Google Forms
2. **Google Apps Script** → Processa dados e envia para webhook
3. **API Webhook** → Recebe dados e salva no banco com status 'pending'
4. **Sistema de Email** → Notifica administradores sobre nova empresa
5. **Painel de Moderação** → Admin aprova/rejeita empresas
6. **Sistema de Email** → Notifica empresa sobre aprovação (se email fornecido)

## 🎛️ Painel de Moderação

### Acessar Empresas Pendentes

1. Faça login no painel admin: `/admin/login`
2. Acesse: `/admin/empresas/pendentes`
3. Ou clique em "📋 Empresas Pendentes" no menu lateral

### Ações Disponíveis

- **✅ Aprovar** - Empresa fica visível no site
- **❌ Rejeitar** - Empresa é rejeitada (não aparece no site)
- **👁️ Visualizar** - Ver todos os detalhes da empresa
- **✏️ Editar** - Modificar dados antes de aprovar

## 🚨 Troubleshooting

### Webhook não está recebendo dados

1. Verifique se a URL do webhook está correta
2. Confirme se o servidor está rodando
3. Verifique os logs do Google Apps Script
4. Teste com a função `testWebhook()`

### Emails não estão sendo enviados

1. Verifique as variáveis de ambiente SMTP
2. Confirme se a senha de app do Gmail está correta
3. Verifique os logs do servidor

### Empresas não aparecem no painel

1. Confirme se a migração foi aplicada
2. Verifique se o status está como 'pending'
3. Confirme se o usuário tem permissões de admin

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs do Google Apps Script
2. Verifique os logs do servidor Next.js
3. Consulte a documentação do Supabase
4. Entre em contato com o desenvolvedor

---

**Desenvolvido para Portal Maria Helena** 🏘