#!/bin/data/data/com.termux/files/usr/bin/bash

echo "⚙️  Securing Android Wake Lock..."
termux-wake-lock

echo "🧹 Clearing old log histories..."
rm -f server.log

echo "🚀 Booting Mini-ICANN Engine in deep background..."
nohup node server.js > server.log 2>&1 &

sleep 1
echo "✅ Operational! Engine running on background PID: $!"
echo "➡️  Type 'cat server.log' to monitor network lookups."
