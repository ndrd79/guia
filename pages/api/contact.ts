import type { NextApiRequest, NextApiResponse } from 'next';
import { sendContactMessage, ContactMessage } from '../../lib/email';

const isValidEmail = (email: string) => /.+@.+\..+/.test(email);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, phone, message } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Nome inválido' });
    }
    if (email && (typeof email !== 'string' || !isValidEmail(email))) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return res.status(400).json({ error: 'Mensagem inválida' });
    }

    const data: ContactMessage = {
      name: name.trim(),
      email: email?.trim(),
      subject: typeof subject === 'string' ? subject.trim() : undefined,
      phone: typeof phone === 'string' ? phone.trim() : undefined,
      message: message.trim(),
    };

    const ok = await sendContactMessage(data);
    if (!ok) {
      return res.status(500).json({ error: 'Falha ao enviar contato' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro na API de contato:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
}