import nodemailer from 'nodemailer';

// Configuração do transporter de email
const createTransporter = () => {
  // Verificar se as variáveis de ambiente estão configuradas
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailHost || !emailUser || !emailPass) {
    console.warn('Configurações de email não encontradas. Emails não serão enviados.');
    return null;
  }

  return nodemailer.createTransport({
    host: emailHost,
    port: parseInt(emailPort || '587'),
    secure: emailPort === '465', // true para 465, false para outras portas
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

// Interface para dados da empresa
interface EmpresaNotification {
  id: string;
  name: string;
  category: string;
  phone: string;
  email?: string;
  cidade?: string;
  submitted_at: string;
  user_source?: string;
}

// Template HTML para notificação de nova empresa
const getNewEmpresaEmailTemplate = (empresa: EmpresaNotification) => {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nova Empresa Pendente - Portal Maria Helena</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 8px 8px;
          border: 1px solid #e9ecef;
        }
        .empresa-info {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #667eea;
        }
        .info-row {
          display: flex;
          margin-bottom: 10px;
          padding: 5px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .info-label {
          font-weight: bold;
          width: 120px;
          color: #555;
        }
        .info-value {
          flex: 1;
          color: #333;
        }
        .status-badge {
          background: #ffc107;
          color: #856404;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .action-buttons {
          text-align: center;
          margin: 30px 0;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          margin: 0 10px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          text-align: center;
        }
        .btn-approve {
          background: #28a745;
          color: white;
        }
        .btn-review {
          background: #007bff;
          color: white;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏢 Nova Empresa Cadastrada</h1>
        <p>Portal Maria Helena - Sistema de Moderação</p>
      </div>
      
      <div class="content">
        <p>Uma nova empresa foi cadastrada via Google Forms e está aguardando aprovação.</p>
        
        <div class="empresa-info">
          <h3>📋 Informações da Empresa</h3>
          
          <div class="info-row">
            <span class="info-label">Nome:</span>
            <span class="info-value"><strong>${empresa.name}</strong></span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Categoria:</span>
            <span class="info-value">${empresa.category}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Telefone:</span>
            <span class="info-value">${empresa.phone}</span>
          </div>
          
          ${empresa.email ? `
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${empresa.email}</span>
          </div>
          ` : ''}
          
          ${empresa.cidade ? `
          <div class="info-row">
            <span class="info-label">Cidade:</span>
            <span class="info-value">${empresa.cidade}</span>
          </div>
          ` : ''}
          
          ${empresa.user_source ? `
          <div class="info-row">
            <span class="info-label">Fonte:</span>
            <span class="info-value">${empresa.user_source}</span>
          </div>
          ` : ''}
          
          <div class="info-row">
            <span class="info-label">Data:</span>
            <span class="info-value">${new Date(empresa.submitted_at).toLocaleString('pt-BR')}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-value"><span class="status-badge">Pendente</span></span>
          </div>
        </div>
        
        <div class="action-buttons">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/empresas/pendentes" class="btn btn-review">
            📋 Revisar no Painel
          </a>
        </div>
        
        <p><strong>⚠️ Ação Necessária:</strong> Esta empresa precisa ser revisada e aprovada antes de aparecer no site público.</p>
        
        <p>Acesse o painel administrativo para:</p>
        <ul>
          <li>✅ Aprovar a empresa</li>
          <li>❌ Rejeitar o cadastro</li>
          <li>👁️ Ver todos os detalhes</li>
        </ul>
      </div>
      
      <div class="footer">
        <p>Portal Maria Helena - Sistema Administrativo</p>
        <p>Este é um email automático, não responda.</p>
      </div>
    </body>
    </html>
  `;
};

// Função para enviar notificação de nova empresa
export const sendNewEmpresaNotification = async (empresa: EmpresaNotification): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('Transporter de email não configurado. Simulando envio...');
      console.log('📧 [SIMULADO] Nova empresa pendente:', empresa.name);
      return true; // Retorna sucesso para não quebrar o fluxo
    }

    // Lista de emails dos administradores
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    
    if (adminEmails.length === 0) {
      console.warn('Nenhum email de administrador configurado (ADMIN_EMAILS)');
      return false;
    }

    const mailOptions = {
      from: {
        name: 'Portal Maria Helena',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@portalmariahelena.com.br'
      },
      to: adminEmails,
      subject: `🏢 Nova Empresa Pendente: ${empresa.name}`,
      html: getNewEmpresaEmailTemplate(empresa),
      text: `
Nova empresa cadastrada via Google Forms:

Nome: ${empresa.name}
Categoria: ${empresa.category}
Telefone: ${empresa.phone}
${empresa.email ? `Email: ${empresa.email}` : ''}
${empresa.cidade ? `Cidade: ${empresa.cidade}` : ''}
${empresa.user_source ? `Fonte: ${empresa.user_source}` : ''}
Data: ${new Date(empresa.submitted_at).toLocaleString('pt-BR')}

Acesse o painel administrativo para revisar: ${process.env.NEXT_PUBLIC_SITE_URL}/admin/empresas/pendentes
      `.trim()
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de notificação enviado:', result.messageId);
    return true;

  } catch (error) {
    console.error('❌ Erro ao enviar email de notificação:', error);
    return false;
  }
};

// Função para enviar notificação de empresa aprovada (opcional)
export const sendEmpresaApprovedNotification = async (empresa: EmpresaNotification): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    if (!transporter || !empresa.email) {
      return false;
    }

    const mailOptions = {
      from: {
        name: 'Portal Maria Helena',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@portalmariahelena.com.br'
      },
      to: empresa.email,
      subject: `✅ Empresa Aprovada - ${empresa.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h1>✅ Empresa Aprovada!</h1>
            <p>Portal Maria Helena</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px;">
            <p>Olá!</p>
            
            <p>Temos o prazer de informar que sua empresa <strong>${empresa.name}</strong> foi aprovada e já está disponível no Portal Maria Helena!</p>
            
            <p>Sua empresa agora pode ser encontrada pelos usuários em nossa plataforma.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/guia/categoria/${encodeURIComponent(empresa.category.toLowerCase())}" 
                 style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Ver Minha Empresa
              </a>
            </div>
            
            <p>Obrigado por fazer parte do Portal Maria Helena!</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>Portal Maria Helena</p>
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      `,
      text: `
Olá!

Temos o prazer de informar que sua empresa ${empresa.name} foi aprovada e já está disponível no Portal Maria Helena!

Sua empresa agora pode ser encontrada pelos usuários em nossa plataforma.

Acesse: ${process.env.NEXT_PUBLIC_SITE_URL}/guia/categoria/${encodeURIComponent(empresa.category.toLowerCase())}

Obrigado por fazer parte do Portal Maria Helena!
      `.trim()
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de aprovação enviado:', result.messageId);
    return true;

  } catch (error) {
    console.error('❌ Erro ao enviar email de aprovação:', error);
    return false;
  }
};

// Função para testar configuração de email
export const testEmailConfiguration = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('❌ Configuração de email não encontrada');
      return false;
    }

    // Verificar conexão
    await transporter.verify();
    console.log('✅ Configuração de email válida');
    return true;

  } catch (error) {
    console.error('❌ Erro na configuração de email:', error);
    return false;
  }
};