import express from 'express';

const router = express.Router();

// In-memory cache for thumbnails (avoids re-fetching the same image repeatedly)
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * GET /api/proxy/thumbnail/:employeeId.jpg
 * Proxies thumbnail images from MYHC API so they work from any network
 */
router.get('/thumbnail/:filename', async (req, res) => {
    const { filename } = req.params;
    const employeeId = filename.replace(/\.\w+$/, ''); // strip extension

    if (!employeeId || !/^\d+$/.test(employeeId)) {
        return res.status(400).json({ error: 'Invalid employee ID' });
    }

    // Check cache
    const cached = cache.get(employeeId);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        res.set('Content-Type', cached.contentType);
        res.set('Cache-Control', 'public, max-age=3600');
        return res.send(cached.buffer);
    }

    const myhcUrl = `https://api-myhc.gmf-aeroasia.co.id/thumbnail/${employeeId}.jpg`;

    try {
        const response = await fetch(myhcUrl, {
            headers: {
                'User-Agent': 'HC-Doc-Server/1.0',
                'Accept': 'image/*'
            },
            signal: AbortSignal.timeout(5000) // 5 second timeout
        });

        if (!response.ok) {
            return res.status(response.status).end();
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Store in cache
        cache.set(employeeId, {
            buffer,
            contentType,
            timestamp: Date.now()
        });

        // Clean old cache entries periodically (keep max 500)
        if (cache.size > 500) {
            const oldest = [...cache.entries()]
                .sort((a, b) => a[1].timestamp - b[1].timestamp)
                .slice(0, cache.size - 400);
            for (const [key] of oldest) {
                cache.delete(key);
            }
        }

        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=3600');
        res.send(buffer);
    } catch (error) {
        // Silently fail — frontend will show initials fallback
        res.status(502).end();
    }
});

export default router;
