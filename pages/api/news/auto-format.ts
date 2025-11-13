import { NextApiRequest, NextApiResponse } from 'next'
import { autoFormatNews } from '../../../lib/text/autoFormatNews'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { title, content, category } = req.body || {}
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'conteudo_obrigatorio' })
      }
      const result = autoFormatNews({ title, content, category })
      return res.status(200).json({ success: true, result })
    }
    if (req.method === 'GET') {
      const { text, title, category } = req.query
      if (!text || typeof text !== 'string') {
        return res.status(405).json({ error: 'method_not_allowed' })
      }
      const result = autoFormatNews({ title: typeof title === 'string' ? title : undefined, content: text, category: typeof category === 'string' ? category : undefined })
      return res.status(200).json({ success: true, result })
    }
    return res.status(405).json({ error: 'method_not_allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'erro_interno' })
  }
}
