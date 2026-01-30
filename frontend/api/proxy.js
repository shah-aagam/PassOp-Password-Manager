export default async function handler(req, res) {
    // 1. Use process.env for Serverless Functions
    const TARGET_URL = process.env.VITE_API_URL; 

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
            options.body = JSON.stringify(req.body);
        }

        const response = await fetch(`${TARGET_URL}${url}`, options);

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            res.status(response.status).json(data);
        } else {
            const text = await response.text();
            res.status(response.status).send(text);
        }

    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(500).json({ error: "Proxy failed to reach backend", details: error.message });
    }
}