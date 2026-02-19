export default async function handler(req, res) {
    const TARGET_URL = process.env.VITE_API_URL;

    if (!TARGET_URL) {
        return res.status(500).json({ error: "VITE_API_URL not set" });
    }

    try {
        // Remove /api prefix
        const path = req.url.replace(/^\/api/, '');

        const fetchUrl = `${TARGET_URL.replace(/\/$/, '')}${path}`;

        const response = await fetch(fetchUrl, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                ...(req.headers.authorization && {
                    Authorization: req.headers.authorization
                })
            },
            body: ['GET', 'HEAD'].includes(req.method)
                ? undefined
                : JSON.stringify(req.body)
        });

        const text = await response.text();

        res.status(response.status).send(text);

    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(500).json({
            error: "Backend Unreachable",
            details: error.message
        });
    }
}
