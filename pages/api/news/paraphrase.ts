import { NextApiRequest, NextApiResponse } from 'next'
import { paraphraseNews } from '../../../lib/text/paraphrase'
import { autoFormatNews } from '../../../lib/text/autoFormatNews'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'method_not_allowed' })
    }
    const { title, content, category } = req.body || {}
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'conteudo_obrigatorio' })
    }
    const p = paraphraseNews({ title, content })
    const formatted = autoFormatNews({ title: p.title, content: p.content, category })
    return res.status(200).json({ success: true, paraphrased: p, formatted })
  } catch (e) {
    return res.status(500).json({ error: 'erro_interno' })
  }
}
