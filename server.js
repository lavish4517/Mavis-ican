const dgram = require('dgram');
const fs = require('fs');
const server = dgram.createSocket('udp4');

const PORT = 5353;
const REGISTRY_FILE = './registry.json';

function parseDomain(msg) {
    let position = 12; 
    let domainParts = [];
    while (true) {
        let length = msg[position];
        if (length === 0 || length === undefined) break;
        if (position + 1 + length > msg.length) break;
        domainParts.push(msg.toString('utf-8', position + 1, position + 1 + length));
        position += 1 + length;
    }
    return domainParts.join('.');
}

function buildResponse(requestMsg, ipAddress) {
    const response = Buffer.from(requestMsg);
    response.writeUInt16BE(0x8180, 2);
    response.writeUInt16BE(1, 6);
    
    const ipParts = ipAddress.split('.').map(Number);
    const answerBuffer = Buffer.alloc(16);
    
    answerBuffer.writeUInt16BE(0xc00c, 0); 
    answerBuffer.writeUInt16BE(1, 2);      
    answerBuffer.writeUInt16BE(1, 4);      
    answerBuffer.writeUInt32BE(300, 6);    
    answerBuffer.writeUInt16BE(4, 10);     
    answerBuffer.set(ipParts, 12);         
    
    return Buffer.concat([response, answerBuffer]);
}

server.on('message', (msg, rinfo) => {
    try {
        const domain = parseDomain(msg);
        if (!domain) return;
        
        console.log(`[ICANN Root Log] Query received for: ${domain}`);
        const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
        
        if (registry[domain]) {
            const targetIp = registry[domain];
            console.log(`[Match Found] Resolving ${domain} -> ${targetIp}`);
            const responsePacket = buildResponse(msg, targetIp);
            server.send(responsePacket, rinfo.port, rinfo.address);
        } else {
            console.log(`[NXDOMAIN] ${domain} does not exist in this root database.`);
        }
    } catch (err) {
        console.error("DNS Processing Error:", err);
    }
});

server.on('listening', () => {
    console.log(`==================================================`);
    console.log(`🚀 Independent Mini-ICANN Server Engine Online`);
    console.log(` Listening on UDP Local Port: ${PORT}`);
    console.log(`==================================================`);
});

server.bind(PORT);
