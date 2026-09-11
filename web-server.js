const http = require('http');
const fs = require('fs');
const PORT = 8080; // Android restricts port 80, so we use 8080 locally

http.createServer((req, res) => {
    fs.readFile('./index.html', (err, data) => {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
}).listen(PORT, () => {
    console.log(`💻 Web Server hosting your page is live on port ${PORT}`);
});
