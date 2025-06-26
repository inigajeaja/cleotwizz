import { v4 as uuidv4 } from 'uuid';

// In a real app, you'd use a database
const links = new Map();
const visits = [];

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { originalUrl, customSlug } = req.body;

    if (!originalUrl) {
        return res.status(400).json({ error: 'Original URL is required' });
    }

    try {
        // Validate URL
        new URL(originalUrl);

        // Create slug
        const slug = customSlug || uuidv4().substring(0, 8);
        
        // Store the link
        links.set(slug, {
            originalUrl,
            createdAt: new Date().toISOString(),
            slug
        });

        return res.status(201).json({ slug });
    } catch (error) {
        console.error('Error creating shortlink:', error);
        return res.status(400).json({ error: 'Invalid URL' });
    }
}
