import { links, visits } from './create';

export default async function handler(req, res) {
    const { slug } = req.query;

    if (!slug) {
        return res.status(400).json({ error: 'Slug is required' });
    }

    try {
        // Get the original URL
        const link = links.get(slug);
        
        if (!link) {
            return res.status(404).json({ error: 'Shortlink not found' });
        }

        // Check if visitor is blocked using the API
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const ua = req.headers['user-agent'];
        
        const blockerUrl = `https://cleostop.up.railway.app/api/blocker?api_key=ADMIN&ua=${encodeURIComponent(ua)}&ip=${ip}`;
        const blockerResponse = await fetch(blockerUrl);
        const blockerData = await blockerResponse.json();

        // Record the visit
        visits.push({
            ...blockerData,
            timestamp: new Date().toISOString(),
            slug,
            originalUrl: link.originalUrl
        });

        // If blocked, show error
        if (blockerData.is_block) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Redirect to original URL
        return res.redirect(link.originalUrl);
    } catch (error) {
        console.error('Error redirecting:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
