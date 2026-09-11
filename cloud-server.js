const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000; // Cloud services assign ports dynamically
const REGISTRY_FILE = './registry.json';

// Ensure database file exists
if (!fs.existsSync(REGISTRY_FILE)) {
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify({
        "google.web3": "127.0.0.1",
        "shop.star": "192.168.1.50"
    }, null, 2));
}

const server = http.createServer((req, res) => {
    // CORS headers so anyone's app or extension can query your ICANN engine
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    // 1. DOMAIN RESOLUTION API ENDPOINT (e.g., /resolve?domain=google.web3)
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    if (urlObj.pathname === '/resolve') {
        const domain = urlObj.searchParams.get('domain');
        if (!domain) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: "Missing 'domain' parameter" }));
        }

        const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
        if (registry[domain]) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ domain: domain, resolved_ip: registry[domain] }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: "Domain status: NXDOMAIN (Not found)" }));
        }
    }

    // 2. DOMAIN REGISTRATION API ENDPOINT (POST request to add a domain)
    if (urlObj.pathname === '/register' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { domain, ip } = JSON.parse(body);
                if (!domain || !ip) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: "Missing domain or ip fields" }));
                }

                let registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
                registry[domain] = ip;
                fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));

                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: true, message: `${domain} registered to ${ip}` }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: "Invalid JSON format" }));
            }
        });
        return;
    }

    // 3. HOME WEB INTERFACE (Loads your company dashboard website)
    if (urlObj.pathname === '/' || urlObj.pathname === '/index.html') {
        fs.readFile('./index.html', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Internal Server Error loading website asset.');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }

    // Default 404 for unknown endpoints
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Endpoint not found.');
});

server.listen(PORT, () => {
    console.log(`🚀 Your 24/7 Global ICANN Engine is armed on port ${PORT}`);
});
