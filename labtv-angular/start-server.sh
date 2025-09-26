#!/bin/bash

# Script per avviare il server JSON locale
echo "Avviando il server JSON locale su localhost:3000..."

# Controlla se json-server è installato
if ! command -v json-server &> /dev/null; then
    echo "json-server non è installato. Installazione in corso..."
    npm install -g json-server
fi

# Avvia il server
json-server --watch db.json --port 3000 --host 0.0.0.0

echo "Server avviato su http://localhost:3000"
