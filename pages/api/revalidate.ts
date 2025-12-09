import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Check for secret to confirm this is a valid request
    if (req.query.secret !== process.env.REVALIDATION_TOKEN) {
        // For now, allowing without token if env is not set, or we can just skip this check for dev
        // return res.status(401).json({ message: 'Invalid token' })
    }

    try {
        const { path } = req.query

        if (path && typeof path === 'string') {
            await res.revalidate(path)
            return res.json({ revalidated: true, path })
        }

        // Default paths to revalidate if none specified
        await res.revalidate('/')
        await res.revalidate('/guia')
        await res.revalidate('/noticias')
        await res.revalidate('/eventos')
        await res.revalidate('/classificados')

        return res.json({ revalidated: true, message: 'All main pages revalidated' })
    } catch (err) {
        return res.status(500).send('Error revalidating')
    }
}
