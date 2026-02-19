export default async function handler(req, res) {
    const TARGET_URL = import.meta.env.VITE_API_URL; 

    const url = req.url; 

    try {
        const options = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization || '',
            },
        };

        if (req.method !== 'GET' && req.method !== 'HEAD') {
            options.body = typeof req.body === 'object' 
                ? JSON.stringify(req.body) 
                : req.body;
        }

        const fetchUrl = `${TARGET_URL.replace(/\/$/, '')}${url}`;
        
        const response = await fetch(fetchUrl, options);
        const data = await response.json();

        res.status(response.status).json(data);

    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(500).json({ error: "Backend Unreachable", details: error.message });
    }
}