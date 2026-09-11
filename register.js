const fs = require('fs');
const REGISTRY_FILE = './registry.json';

// Capture command line arguments: node register.js [domain] [ip]
const domain = process.argv[2];
const ip = process.argv[3];

if (!domain || !ip) {
    console.log("❌ Error: Missing fields.");
    console.log("Usage: node register.js <domain-name> <ip-address>");
    process.exit(1);
}

try {
    let registry = {};
    if (fs.existsSync(REGISTRY_FILE)) {
        registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
    }
    
    // Add or update the entry
    registry[domain] = ip;
    
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
    console.log(`✅ Success: ${domain} is now registered to ${ip}`);
} catch (error) {
    console.error("❌ Failed to update registry database:", error);
}
